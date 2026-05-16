import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getCategories);

// Admin only
router.post("/", protect, authorize("admin", "superadmin"), createCategory);
router.put("/:id", protect, authorize("admin", "superadmin"), updateCategory);
router.delete(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteCategory,
);

export default router;
