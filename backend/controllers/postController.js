import Post from "../models/Post.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { asyncHandler, createError } from "../utils/error.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// @GET /api/posts
export const getPosts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    tag,
    author,
    status = "published",
    featured,
    trending,
    sort = "-publishedAt",
    search,
  } = req.query;

  const query = { status };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category = cat._id;
  }
  if (tag) query.tags = { $in: [tag.toLowerCase()] };
  if (author) {
    const authorUser = await User.findOne({ username: author });
    if (authorUser) query.author = authorUser._id;
  }
  if (featured === "true") query.featured = true;
  if (trending === "true") query.trending = true;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name username avatar")
      .populate("category", "name slug color icon")
      .select("-content -seo -viewsHistory")
      .sort(search ? { score: { $meta: "textScore" } } : sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Post.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      posts,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        hasMore: skip + posts.length < total,
      },
    },
  });
});

// @GET /api/posts/:slug
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    slug: req.params.slug,
    status: "published",
  })
    .populate("author", "name username avatar bio social followers")
    .populate("category", "name slug color icon description")
    .populate({
      path: "relatedPosts",
      select: "title slug coverImage readTime publishedAt",
      populate: { path: "author", select: "name avatar" },
    })
    .lean();

  if (!post) return next(createError(404, "Post not found."));

  Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec();

  if (req.user) {
    post.isLiked = post.likes?.some(
      (id) => id.toString() === req.user._id.toString(),
    );
    const userDoc = await User.findById(req.user._id).select("bookmarks");
    post.isBookmarked = userDoc?.bookmarks?.includes(post._id) || false;
    User.findByIdAndUpdate(req.user._id, {
      $push: { readHistory: { $each: [{ post: post._id }], $slice: -50 } },
    }).exec();
  }

  delete post.likes;
  res.json({ success: true, data: { post } });
});

// @POST /api/posts
export const createPost = asyncHandler(async (req, res, next) => {
  const {
    title,
    content,
    excerpt,
    category,
    tags,
    status,
    featured,
    scheduledAt,
    seo,
    allowComments,
  } = req.body;

  if (!title || !content || !category) {
    return next(createError(400, "Title, content, and category are required."));
  }

  const cat = await Category.findById(category);
  if (!cat) return next(createError(404, "Category not found."));

  const postData = {
    title,
    content,
    excerpt: excerpt || "",
    category,
    tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
    status: status || "draft",
    featured: featured === "true" || featured === true,
    allowComments: allowComments !== "false" && allowComments !== false,
    author: req.user._id,
  };

  if (status === "scheduled" && scheduledAt) {
    postData.scheduledAt = new Date(scheduledAt);
  }

  if (seo) {
    postData.seo = typeof seo === "string" ? JSON.parse(seo) : seo;
  }

  // Upload cover image to Cloudinary
  if (req.file) {
    console.log("\n🖼️  Cover image upload request");
    console.log("   Path:", req.file.path);
    console.log("   Size:", Math.round(req.file.size / 1024), "KB");

    try {
      const result = await uploadToCloudinary(
        req.file.path,
        "blog-platform/posts",
        {
          transformation: [
            {
              width: 1200,
              height: 630,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
      );

      postData.coverImage = {
        public_id: result.public_id,
        url: result.url,
        alt: title,
      };

      console.log("✅ Cover image uploaded:", result.url);
    } catch (uploadError) {
      console.error("❌ Cover image upload failed:", uploadError.message);
      return next(
        createError(500, "Image upload failed: " + uploadError.message),
      );
    }
  }

  const post = await Post.create(postData);

  Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } }).exec();

  const related = await Post.find({
    _id: { $ne: post._id },
    status: "published",
    $or: [{ category }, { tags: { $in: postData.tags } }],
  })
    .limit(4)
    .select("_id");

  if (related.length > 0) {
    await Post.findByIdAndUpdate(post._id, {
      relatedPosts: related.map((r) => r._id),
    });
  }

  await post.populate(["author", "category"]);

  res.status(201).json({
    success: true,
    message: "Post created successfully!",
    data: { post },
  });
});

// @PUT /api/posts/:id
export const updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) return next(createError(404, "Post not found."));

  const isOwner = post.author.toString() === req.user._id.toString();
  const isAdmin = ["admin", "superadmin"].includes(req.user.role);
  if (!isOwner && !isAdmin) return next(createError(403, "Not authorized."));

  const updateData = { ...req.body };

  if (req.body.tags && typeof req.body.tags === "string") {
    updateData.tags = JSON.parse(req.body.tags);
  }
  if (req.body.seo && typeof req.body.seo === "string") {
    updateData.seo = JSON.parse(req.body.seo);
  }
  if (updateData.featured !== undefined) {
    updateData.featured =
      updateData.featured === "true" || updateData.featured === true;
  }
  if (updateData.allowComments !== undefined) {
    updateData.allowComments =
      updateData.allowComments !== "false" &&
      updateData.allowComments !== false;
  }

  // Upload new cover image
  if (req.file) {
    console.log("\n🖼️  Update cover image");
    try {
      // Delete old image first
      if (post.coverImage?.public_id) {
        await deleteFromCloudinary(post.coverImage.public_id);
      }

      const result = await uploadToCloudinary(
        req.file.path,
        "blog-platform/posts",
        {
          transformation: [
            {
              width: 1200,
              height: 630,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
      );

      updateData.coverImage = {
        public_id: result.public_id,
        url: result.url,
        alt: updateData.title || post.title,
      };

      console.log("✅ Cover image updated:", result.url);
    } catch (uploadError) {
      console.error("❌ Image update failed:", uploadError.message);
      return next(
        createError(500, "Image upload failed: " + uploadError.message),
      );
    }
  }

  post = await Post.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate(["author", "category"]);

  res.json({ success: true, message: "Post updated!", data: { post } });
});
// @DELETE /api/posts/:id
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(createError(404, "Post not found."));

  const isOwner = post.author.toString() === req.user._id.toString();
  const isAdmin = ["admin", "superadmin"].includes(req.user.role);
  if (!isOwner && !isAdmin) return next(createError(403, "Not authorized."));

  if (post.coverImage?.public_id) {
    await deleteFromCloudinary(post.coverImage.public_id);
  }

  await Promise.all([
    Post.findByIdAndDelete(req.params.id),
    Comment.deleteMany({ post: req.params.id }),
    Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } }),
    User.updateMany({}, { $pull: { bookmarks: req.params.id } }),
  ]);

  res.json({ success: true, message: "Post deleted." });
});

// @POST /api/posts/:id/like
export const toggleLike = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).select("likes likesCount");
  if (!post) return next(createError(404, "Post not found."));

  const userId = req.user._id;
  const isLiked = post.likes.some((id) => id.toString() === userId.toString());

  const update = isLiked
    ? { $pull: { likes: userId }, $inc: { likesCount: -1 } }
    : { $push: { likes: userId }, $inc: { likesCount: 1 } };

  await Post.findByIdAndUpdate(req.params.id, update);
  res.json({
    success: true,
    message: isLiked ? "Like removed." : "Post liked!",
    data: { isLiked: !isLiked },
  });
});

// @POST /api/posts/:id/bookmark
export const toggleBookmark = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(createError(404, "Post not found."));

  const user = await User.findById(req.user._id).select("bookmarks");
  const isBookmarked = user.bookmarks.includes(req.params.id);

  const userUpdate = isBookmarked
    ? { $pull: { bookmarks: req.params.id } }
    : { $push: { bookmarks: req.params.id } };
  const postUpdate = isBookmarked
    ? { $inc: { bookmarksCount: -1 } }
    : { $inc: { bookmarksCount: 1 } };

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, userUpdate),
    Post.findByIdAndUpdate(req.params.id, postUpdate),
  ]);

  res.json({
    success: true,
    message: isBookmarked ? "Bookmark removed." : "Post bookmarked!",
    data: { isBookmarked: !isBookmarked },
  });
});

// @GET /api/posts/trending
export const getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "published" })
    .sort({ views: -1, likesCount: -1 })
    .limit(10)
    .populate("author", "name username avatar")
    .populate("category", "name slug color")
    .select(
      "title slug coverImage readTime views likesCount commentsCount publishedAt",
    )
    .lean();
  res.json({ success: true, data: { posts } });
});

// @GET /api/posts/featured
export const getFeaturedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "published", featured: true })
    .sort("-publishedAt")
    .limit(9)
    .populate("author", "name username avatar")
    .populate("category", "name slug color icon")
    .select(
      "title slug excerpt coverImage readTime views likesCount publishedAt",
    )
    .lean();
  res.json({ success: true, data: { posts } });
});

// @GET /api/posts/admin/all
export const getAdminPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search, category } = req.query;
  const query = {};
  if (status && status !== "all") query.status = status;
  if (category) query.category = category;
  if (search) query.$text = { $search: search };
  if (!["admin", "superadmin"].includes(req.user.role))
    query.author = req.user._id;

  const skip = (Number(page) - 1) * Number(limit);
  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name username avatar")
      .populate("category", "name slug")
      .select(
        "title slug status views likesCount commentsCount featured publishedAt scheduledAt createdAt",
      )
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Post.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      posts,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    },
  });
});

// @GET /api/posts/admin/:id
export const getAdminPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name username avatar")
    .populate("category", "name slug color icon");

  if (!post) return next(createError(404, "Post not found."));

  const isOwner = post.author._id.toString() === req.user._id.toString();
  const isAdmin = ["admin", "superadmin"].includes(req.user.role);
  if (!isOwner && !isAdmin) return next(createError(403, "Not authorized."));

  res.json({ success: true, data: { post } });
});
