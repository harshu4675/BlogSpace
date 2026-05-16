import express from "express";
import {
  getUsers,
  getUserProfile,
  updateUserRole,
  banUser,
  getAnalytics,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin only
router.get(
  "/analytics",
  protect,
  authorize("admin", "superadmin"),
  getAnalytics,
);
router.get("/", protect, authorize("admin", "superadmin"), getUsers);
router.put(
  "/:id/role",
  protect,
  authorize("admin", "superadmin"),
  updateUserRole,
);
router.put("/:id/ban", protect, authorize("admin", "superadmin"), banUser);

// Public profile (must be last to avoid catching other routes)
router.get("/:username", getUserProfile);

export default router;
