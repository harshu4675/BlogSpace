import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { asyncHandler, createError } from "../utils/error.js";

// @GET /api/posts/:postId/comments
export const getComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { page = 1, limit = 20, sort = "-createdAt" } = req.query;

  const post = await Post.findById(postId).select("_id allowComments");
  if (!post) return next(createError(404, "Post not found."));

  const skip = (Number(page) - 1) * Number(limit);

  const query = {
    post: postId,
    parent: null,
    isDeleted: false,
    isApproved: true,
  };

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate("author", "name username avatar role")
      .populate({
        path: "replies",
        match: { isDeleted: false, isApproved: true },
        populate: {
          path: "author",
          select: "name username avatar role",
        },
        options: { sort: { createdAt: 1 }, limit: 10 },
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Comment.countDocuments(query),
  ]);

  // Mark liked comments for authenticated user
  if (req.user) {
    const userId = req.user._id.toString();
    comments.forEach((comment) => {
      comment.isLiked = comment.likes?.some((id) => id.toString() === userId);
      delete comment.likes;

      if (comment.replies) {
        comment.replies.forEach((reply) => {
          reply.isLiked = reply.likes?.some((id) => id.toString() === userId);
          delete reply.likes;
        });
      }
    });
  } else {
    comments.forEach((comment) => {
      comment.isLiked = false;
      delete comment.likes;
      if (comment.replies) {
        comment.replies.forEach((reply) => {
          reply.isLiked = false;
          delete reply.likes;
        });
      }
    });
  }

  res.json({
    success: true,
    data: {
      comments,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        hasMore: skip + comments.length < total,
      },
    },
  });
});

// @POST /api/posts/:postId/comments
export const createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;

  if (!content || !content.trim()) {
    return next(createError(400, "Comment content is required."));
  }

  const post = await Post.findById(postId).select(
    "allowComments commentsCount",
  );
  if (!post) return next(createError(404, "Post not found."));
  if (!post.allowComments) {
    return next(createError(403, "Comments are disabled for this post."));
  }

  // Rate limiting: max 10 comments per minute per user
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentComments = await Comment.countDocuments({
    author: req.user._id,
    createdAt: { $gte: oneMinuteAgo },
  });
  if (recentComments >= 10) {
    return next(createError(429, "Too many comments. Please wait a minute."));
  }

  // Validate parent comment if replying
  let parent = null;
  if (parentId) {
    parent = await Comment.findById(parentId);
    if (!parent) return next(createError(404, "Parent comment not found."));
    if (parent.post.toString() !== postId) {
      return next(
        createError(400, "Parent comment does not belong to this post."),
      );
    }
    // Prevent deeply nested replies (max 1 level)
    if (parent.parent) {
      return next(
        createError(
          400,
          "Cannot reply to a reply. Reply to the parent comment instead.",
        ),
      );
    }
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content: content.trim(),
    parent: parentId || null,
  });

  await comment.populate("author", "name username avatar role");

  // Update parent's replies array
  if (parentId) {
    await Comment.findByIdAndUpdate(parentId, {
      $push: { replies: comment._id },
    });
  }

  // Update post comment count
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  res.status(201).json({
    success: true,
    message: "Comment posted!",
    data: { comment },
  });
});

// @PUT /api/posts/:postId/comments/:id
export const updateComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return next(createError(400, "Comment content is required."));
  }

  const comment = await Comment.findById(id);
  if (!comment) return next(createError(404, "Comment not found."));
  if (comment.isDeleted)
    return next(createError(400, "Cannot edit deleted comment."));

  // Only owner can edit
  if (comment.author.toString() !== req.user._id.toString()) {
    return next(createError(403, "Not authorized to edit this comment."));
  }

  // Time limit: can only edit within 30 minutes
  const thirtyMinutes = 30 * 60 * 1000;
  if (Date.now() - comment.createdAt.getTime() > thirtyMinutes) {
    return next(
      createError(
        400,
        "Edit window expired. Comments can only be edited within 30 minutes.",
      ),
    );
  }

  comment.content = content.trim();
  comment.isEdited = true;
  await comment.save();

  await comment.populate("author", "name username avatar role");

  res.json({
    success: true,
    message: "Comment updated.",
    data: { comment },
  });
});

// @DELETE /api/posts/:postId/comments/:id
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { postId, id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) return next(createError(404, "Comment not found."));

  const isOwner = comment.author.toString() === req.user._id.toString();
  const isAdmin = ["admin", "superadmin"].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    return next(createError(403, "Not authorized to delete this comment."));
  }

  // Soft delete
  comment.isDeleted = true;
  comment.content = "[Comment deleted]";
  comment.deletedBy = req.user._id;
  await comment.save();

  // If parent comment, also soft-delete all replies
  if (!comment.parent) {
    await Comment.updateMany(
      { parent: comment._id },
      {
        isDeleted: true,
        content: "[Reply deleted]",
        deletedBy: req.user._id,
      },
    );
    const repliesCount = await Comment.countDocuments({
      parent: comment._id,
      isDeleted: true,
      deletedBy: req.user._id,
    });
    // Decrease post comment count (parent + replies)
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -(1 + repliesCount) },
    });
  } else {
    // Single reply deleted
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    // Remove from parent's replies array
    await Comment.findByIdAndUpdate(comment.parent, {
      $pull: { replies: comment._id },
    });
  }

  res.json({ success: true, message: "Comment deleted." });
});

// @POST /api/posts/:postId/comments/:id/like
export const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) return next(createError(404, "Comment not found."));
  if (comment.isDeleted)
    return next(createError(400, "Cannot like deleted comment."));

  const userId = req.user._id;
  const isLiked = comment.likes.some(
    (likeId) => likeId.toString() === userId.toString(),
  );

  if (isLiked) {
    await Comment.findByIdAndUpdate(id, {
      $pull: { likes: userId },
      $inc: { likesCount: -1 },
    });
  } else {
    await Comment.findByIdAndUpdate(id, {
      $push: { likes: userId },
      $inc: { likesCount: 1 },
    });
  }

  res.json({
    success: true,
    message: isLiked ? "Like removed." : "Comment liked!",
    data: { isLiked: !isLiked },
  });
});

// @POST /api/posts/:postId/comments/:id/report
export const reportComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) return next(createError(404, "Comment not found."));

  // Prevent self-reporting
  if (comment.author.toString() === req.user._id.toString()) {
    return next(createError(400, "Cannot report your own comment."));
  }

  comment.reported = true;
  comment.reportCount = (comment.reportCount || 0) + 1;

  // Auto-hide if reported 5+ times
  if (comment.reportCount >= 5) {
    comment.isApproved = false;
  }

  await comment.save();

  res.json({
    success: true,
    message: "Comment reported. Our team will review it.",
  });
});

// @GET /api/posts/:postId/comments/admin/all (Admin only)
export const getAllComments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 30,
    status = "all",
    search,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  if (status === "reported") {
    query.reported = true;
  } else if (status === "pending") {
    query.isApproved = false;
    query.isDeleted = false;
  } else if (status === "deleted") {
    query.isDeleted = true;
  } else if (status === "approved") {
    query.isApproved = true;
    query.isDeleted = false;
  }

  if (search) {
    query.content = { $regex: search, $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate("author", "name username avatar email")
      .populate("post", "title slug")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Comment.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      comments,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        hasMore: skip + comments.length < total,
      },
    },
  });
});

// @PUT /api/posts/:postId/comments/:id/approve (Admin only)
export const approveComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { approved } = req.body;

  const comment = await Comment.findById(id);
  if (!comment) return next(createError(404, "Comment not found."));

  comment.isApproved = approved !== false;
  comment.reported = false;
  comment.reportCount = 0;
  await comment.save();

  await comment.populate("author", "name username avatar");

  res.json({
    success: true,
    message: comment.isApproved ? "Comment approved." : "Comment hidden.",
    data: { comment },
  });
});
