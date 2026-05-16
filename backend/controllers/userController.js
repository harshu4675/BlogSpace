import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { asyncHandler, createError } from "../utils/error.js";
import Newsletter from "../models/Newsletter.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, sort = "-createdAt" } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken -passwordResetToken")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    },
  });
});

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username }).select(
    "-password -refreshToken -email -loginAttempts",
  );

  if (!user) return next(createError(404, "User not found."));

  const posts = await Post.find({ author: user._id, status: "published" })
    .sort("-publishedAt")
    .limit(10)
    .populate("category", "name slug")
    .select(
      "title slug coverImage excerpt readTime views likesCount publishedAt",
    )
    .lean();

  res.json({ success: true, data: { user, posts } });
});

export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!["user", "author", "editor", "admin"].includes(role)) {
    return next(createError(400, "Invalid role."));
  }

  if (role === "admin" && req.user.role !== "superadmin") {
    return next(createError(403, "Only superadmin can assign admin role."));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  ).select("-password -refreshToken");

  if (!user) return next(createError(404, "User not found."));

  res.json({
    success: true,
    message: `Role updated to ${role}.`,
    data: { user },
  });
});

export const banUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(createError(404, "User not found."));

  if (user.role === "superadmin")
    return next(createError(403, "Cannot ban superadmin."));

  user.isBanned = !user.isBanned;
  user.banReason = req.body.reason || null;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: user.isBanned ? "User banned." : "User unbanned.",
    data: { user },
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPosts,
    totalComments,
    recentUsers,
    topPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    usersByRole,
    totalSubscribers,
    totalViews,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments({ isDeleted: false }),
    User.find()
      .sort("-createdAt")
      .limit(5)
      .select("name email avatar role createdAt"),
    Post.find({ status: "published" })
      .sort("-views")
      .limit(5)
      .populate("author", "name")
      .populate("category", "name")
      .select("title slug views likesCount commentsCount"),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    Post.countDocuments({ status: "scheduled" }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Newsletter.countDocuments({ isActive: true }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailyPosts = await Post.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyUsers = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        totalSubscribers,
        totalViews: totalViews[0]?.total || 0,
      },
      recentUsers,
      topPosts,
      dailyPosts,
      dailyUsers,
      usersByRole,
    },
  });
});
