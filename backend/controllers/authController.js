import crypto from "crypto";
import User from "../models/User.js";
import { asyncHandler, createError } from "../utils/error.js";
import {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
} from "../utils/jwt.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../utils/email.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

// @POST /api/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createError(400, "Email already registered. Please login."));
  }

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  sendWelcomeEmail(user).catch(console.error);

  user.password = undefined;
  user.refreshToken = undefined;

  res.status(201).json({
    success: true,
    message: "Account created successfully! Welcome to BlogSpace 🎉",
    data: { user, accessToken },
  });
});

// @POST /api/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select(
    "+password +refreshToken +loginAttempts +lockUntil",
  );

  if (!user) return next(createError(401, "Invalid email or password."));

  if (user.isLocked()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    return next(
      createError(423, `Account locked. Try again in ${lockTime} minutes.`),
    );
  }

  if (user.isBanned) {
    return next(
      createError(
        403,
        `Account banned: ${user.banReason || "Terms violation"}`,
      ),
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    await user.incrementLoginAttempts();
    return next(createError(401, "Invalid email or password."));
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  user.password = undefined;
  user.refreshToken = undefined;

  res.json({
    success: true,
    message: `Welcome back, ${user.name}! 👋`,
    data: { user, accessToken },
  });
});

// @POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  clearTokenCookies(res);
  res.json({ success: true, message: "Logged out successfully." });
});

// @POST /api/auth/refresh
export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return next(createError(401, "No refresh token provided."));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    return next(createError(401, "Invalid refresh token."));
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id,
  );
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, newRefreshToken);
  res.json({ success: true, data: { accessToken } });
});

// @GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "bookmarks",
    "title slug coverImage",
  );
  res.json({ success: true, data: { user } });
});

// @PUT /api/auth/update-profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ["name", "bio", "social", "preferences", "username"];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (updateData.username) {
    const existing = await User.findOne({
      username: updateData.username,
      _id: { $ne: req.user._id },
    });
    if (existing) return next(createError(400, "Username already taken."));
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: "Profile updated!", data: { user } });
});

// @PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect)
    return next(createError(400, "Current password is incorrect."));

  user.password = newPassword;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  res.json({ success: true, message: "Password changed successfully!" });
});

// @POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.json({
      success: true,
      message: "If that email exists, a reset link was sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user, resetUrl);

  res.json({
    success: true,
    message: "Password reset link sent to your email!",
  });
});

// @POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(createError(400, "Reset token is invalid or expired."));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  res.json({ success: true, message: "Password reset successfully!" });
});

// @PUT /api/auth/avatar - CLOUDINARY ONLY
export const updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(createError(400, "Please upload an image file."));
  }

  console.log("\n👤 Avatar upload request");
  console.log("   File path:", req.file.path);
  console.log("   File name:", req.file.filename);
  console.log("   File size:", Math.round(req.file.size / 1024), "KB");
  console.log("   MIME type:", req.file.mimetype);

  try {
    // Get current user to delete old avatar
    const currentUser = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary
    if (currentUser.avatar?.public_id) {
      await deleteFromCloudinary(currentUser.avatar.public_id);
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(
      req.file.path,
      "blog-platform/avatars",
      {
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
            quality: "auto",
          },
        ],
      },
    );

    // Update user in DB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          public_id: result.public_id,
          url: result.url,
        },
      },
      { new: true },
    ).select("-password -refreshToken");

    console.log("✅ Avatar updated for user:", user.name);
    console.log("🔗 Avatar URL:", result.url);

    res.json({
      success: true,
      message: "Avatar updated successfully!",
      data: { user },
    });
  } catch (error) {
    console.error("❌ Avatar upload failed:", error.message);
    return next(createError(500, "Avatar upload failed: " + error.message));
  }
});
