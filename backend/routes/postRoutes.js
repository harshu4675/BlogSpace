import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getTrendingPosts,
  getFeaturedPosts,
  getAdminPosts,
  getAdminPostById,
} from "../controllers/postController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/trending", getTrendingPosts);
router.get("/featured", getFeaturedPosts);

// Admin routes (must be before :slug to avoid conflict)
router.get(
  "/admin/all",
  protect,
  authorize("author", "editor", "admin", "superadmin"),
  getAdminPosts,
);
router.get(
  "/admin/:id",
  protect,
  authorize("author", "editor", "admin", "superadmin"),
  getAdminPostById,
);

// Public single post (with optional auth for like/bookmark status)
router.get("/:slug", optionalAuth, getPost);

// Protected CRUD
router.post(
  "/",
  protect,
  authorize("author", "editor", "admin", "superadmin"),
  upload.single("coverImage"),
  createPost,
);
router.put(
  "/:id",
  protect,
  authorize("author", "editor", "admin", "superadmin"),
  upload.single("coverImage"),
  updatePost,
);
router.delete(
  "/:id",
  protect,
  authorize("author", "editor", "admin", "superadmin"),
  deletePost,
);

// Interactions
router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);

export default router;
