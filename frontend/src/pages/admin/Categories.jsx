import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineTag,
} from "react-icons/hi2";
import api from "../../utils/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SEO from "../../components/common/SEO";
import toast from "react-hot-toast";

const emojiOptions = [
  "📝",
  "💻",
  "🎨",
  "🏋️",
  "🍕",
  "✈️",
  "📸",
  "🎵",
  "💰",
  "🎮",
  "📱",
  "🌍",
  "❤️",
  "🔬",
  "📚",
  "🏠",
  "⚽",
  "🎬",
  "🧘",
  "👗",
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: null,
  });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📝",
    color: "#6366f1",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "📝",
      color: "#6366f1",
      isActive: true,
      order: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      icon: cat.icon || "📝",
      color: cat.color || "#6366f1",
      isActive: cat.isActive,
      order: cat.order || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      if (editingCategory) {
        const { data } = await api.put(
          `/categories/${editingCategory._id}`,
          formData,
        );
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingCategory._id ? data.data.category : c,
          ),
        );
        toast.success("Category updated!");
      } else {
        const { data } = await api.post("/categories", formData);
        setCategories((prev) => [...prev, data.data.category]);
        toast.success("Category created!");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteDialog.category._id}`);
      setCategories((prev) =>
        prev.filter((c) => c._id !== deleteDialog.category._id),
      );
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteDialog({ open: false, category: null });
    }
  };

  const colorPresets = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#64748b",
  ];

  return (
    <>
      <SEO title="Manage Categories" />

      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white">
              Categories
            </h1>
            <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">
              {categories.length} categories
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <HiOutlinePlusCircle className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={HiOutlineTag}
              title="No categories"
              description="Create your first category to organize posts."
              action={openCreateModal}
              actionText="Add Category"
            />
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 
                            divide-dark-100 dark:divide-dark-700"
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 sm:border-r sm:border-b border-dark-100 dark:border-dark-700 
                             last:border-r-0 hover:bg-dark-50 dark:hover:bg-dark-700/50 
                             transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: cat.color + "20" }}
                      >
                        {cat.icon || "📝"}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-dark-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-dark-400 mt-0.5">
                          {cat.postCount || 0} posts · /{cat.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600 
                                   text-dark-400 transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteDialog({ open: true, category: cat })
                        }
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 
                                   text-red-400 transition-colors"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {cat.description && (
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span
                      className={`text-2xs font-medium ${cat.isActive ? "text-emerald-500" : "text-dark-400"}`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-2xs text-dark-400">
                      · Order: {cat.order}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Technology"
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the category..."
              className="input-field resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, icon: emoji }))
                  }
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg 
                              transition-all ${
                                formData.icon === emoji
                                  ? "bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 scale-110"
                                  : "bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600"
                              }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-dark-400 scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Order + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                className="input-field"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Status
              </label>
              <label className="flex items-center gap-3 cursor-pointer mt-2">
                <div
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    formData.isActive
                      ? "bg-primary-500"
                      : "bg-dark-300 dark:bg-dark-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md 
                                transition-transform ${formData.isActive ? "left-[22px]" : "left-0.5"}`}
                  />
                </div>
                <span className="text-sm text-dark-600 dark:text-dark-400">
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
            <p className="text-xs text-dark-400 mb-2 font-semibold uppercase tracking-wider">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: formData.color + "20" }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-dark-900 dark:text-white">
                  {formData.name || "Category Name"}
                </p>
                <p className="text-xs text-dark-400">
                  {formData.description || "Category description"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary py-2.5 px-5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-2.5 px-5 text-sm"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Saving...
                </span>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={
          deleteDialog.category?.postCount > 0
            ? `"${deleteDialog.category?.name}" has ${deleteDialog.category?.postCount} posts. You cannot delete a category with posts.`
            : `Are you sure you want to delete "${deleteDialog.category?.name}"?`
        }
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default Categories;
