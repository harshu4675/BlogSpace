import Category from "../models/Category.js";
import { asyncHandler, createError } from "../utils/error.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort("order name")
    .lean();

  res.json({ success: true, data: { categories } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: { category } });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) return next(createError(404, "Category not found."));
  res.json({ success: true, data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(createError(404, "Category not found."));

  if (category.postCount > 0) {
    return next(
      createError(
        400,
        `Cannot delete category with ${category.postCount} posts.`,
      ),
    );
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Category deleted." });
});
