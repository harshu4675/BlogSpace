import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineEye,
  HiOutlineDocumentCheck,
  HiOutlineCloudArrowUp,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import RichTextEditor from "../../components/editor/RichTextEditor";
import CoverImageUpload from "../../components/editor/CoverImageUpload";
import SEOPanel from "../../components/editor/SEOPanel";
import TagInput from "../../components/editor/TagInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SEO from "../../components/common/SEO";
import toast from "react-hot-toast";

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    status: "draft",
    featured: false,
    allowComments: true,
    scheduledAt: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      canonicalUrl: "",
    },
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [existingCoverImage, setExistingCoverImage] = useState(null);

  // Fetch categories
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  // Replace the fetch existing post section with:
  useEffect(() => {
    if (!isEditing) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/posts/admin/${id}`);
        const full = data.data.post;

        setPostData({
          title: full.title || "",
          content: full.content || "",
          excerpt: full.excerpt || "",
          category: full.category?._id || "",
          tags: full.tags || [],
          status: full.status || "draft",
          featured: full.featured || false,
          allowComments: full.allowComments !== false,
          scheduledAt: full.scheduledAt
            ? new Date(full.scheduledAt).toISOString().slice(0, 16)
            : "",
          seo: {
            metaTitle: full.seo?.metaTitle || "",
            metaDescription: full.seo?.metaDescription || "",
            keywords: full.seo?.keywords || [],
            canonicalUrl: full.seo?.canonicalUrl || "",
          },
        });

        if (full.coverImage?.url) {
          setExistingCoverImage(full.coverImage.url);
        }

        if (full.status === "scheduled") {
          setShowSchedule(true);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
        toast.error("Failed to load post");
        navigate("/admin/posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isEditing, navigate]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-save draft every 30s
  useEffect(() => {
    if (!postData.title || !hasUnsavedChanges) return;

    const timer = setTimeout(async () => {
      if (postData.status === "draft" && postData.title.trim()) {
        try {
          await handleSave("draft", true);
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 3000);
        } catch {}
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [postData, hasUnsavedChanges]);

  const updateField = (field, value) => {
    setPostData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (status = postData.status, silent = false) => {
    if (!postData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!postData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!postData.category) {
      toast.error("Please select a category");
      return;
    }
    if (status === "scheduled" && !postData.scheduledAt) {
      toast.error("Please set a schedule date");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", postData.title.trim());
      formData.append("content", postData.content);
      formData.append("excerpt", postData.excerpt.trim());
      formData.append("category", postData.category);
      formData.append("tags", JSON.stringify(postData.tags));
      formData.append("status", status);
      formData.append("featured", postData.featured);
      formData.append("allowComments", postData.allowComments);
      formData.append("seo", JSON.stringify(postData.seo));

      if (status === "scheduled" && postData.scheduledAt) {
        formData.append("scheduledAt", postData.scheduledAt);
      }

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      }

      let response;
      if (isEditing) {
        response = await api.put(`/posts/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setHasUnsavedChanges(false);

      if (!silent) {
        const actionLabel =
          status === "published"
            ? "Published"
            : status === "scheduled"
              ? "Scheduled"
              : "Saved";
        toast.success(`${actionLabel} successfully!`);

        if (!isEditing) {
          navigate(`/admin/posts/edit/${response.data.data.post._id}`);
        }
      }
    } catch (err) {
      if (!silent) {
        toast.error(err.response?.data?.message || "Failed to save post");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${id}`);
      toast.success("Post deleted");
      navigate("/admin/posts");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO title={isEditing ? `Edit: ${postData.title}` : "Create New Post"} />

      <div className="max-w-5xl mx-auto page-enter">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/posts"
              className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 
                         text-dark-500 transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-dark-900 dark:text-white">
                {isEditing ? "Edit Post" : "Create New Post"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {autoSaved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-emerald-500 flex items-center gap-1"
                  >
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Auto-saved
                  </motion.span>
                )}
                {hasUnsavedChanges && !autoSaved && (
                  <span className="text-xs text-amber-500">
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={() => setDeleteDialog(true)}
                className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm"
              >
                <HiOutlineTrash className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="btn-secondary py-2 px-4 text-sm"
            >
              <HiOutlineCloudArrowUp className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="btn-primary py-2 px-4 text-sm"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <HiOutlineDocumentCheck className="w-4 h-4" />
              )}
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={postData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Your amazing post title..."
                className="w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-transparent 
                           border-0 outline-none text-dark-900 dark:text-white 
                           placeholder:text-dark-300 dark:placeholder:text-dark-600 
                           font-display leading-tight"
                autoFocus={!isEditing}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Excerpt / Summary
              </label>
              <textarea
                value={postData.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                placeholder="Brief summary of your post (shown in previews and SEO)..."
                className="input-field resize-none text-sm"
                rows={2}
                maxLength={500}
              />
              <p className="text-xs text-dark-400 mt-1 text-right">
                {postData.excerpt.length}/500
              </p>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={postData.content}
                onChange={(val) => updateField("content", val)}
                placeholder="Start writing your story... Use the toolbar to format your text, add images, code blocks, and more."
                minHeight="500px"
              />
            </div>

            {/* SEO Panel */}
            <SEOPanel
              seo={postData.seo}
              onChange={(seo) => updateField("seo", seo)}
              title={postData.title}
              excerpt={postData.excerpt}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Publish Settings */}
            <div
              className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 
                            dark:border-dark-700 p-5 sticky top-20"
            >
              <h3
                className="text-sm font-bold text-dark-900 dark:text-white mb-4 uppercase 
                             tracking-wider"
              >
                Publish Settings
              </h3>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Status
                </label>
                <select
                  value={postData.status}
                  onChange={(e) => {
                    updateField("status", e.target.value);
                    setShowSchedule(e.target.value === "scheduled");
                  }}
                  className="input-field py-2.5 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="review">Under Review</option>
                </select>
              </div>

              {/* Schedule Date */}
              {(showSchedule || postData.status === "scheduled") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4"
                >
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                    <HiOutlineCalendar className="w-4 h-4 inline mr-1" />
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={postData.scheduledAt}
                    onChange={(e) => updateField("scheduledAt", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="input-field py-2.5 text-sm"
                  />
                </motion.div>
              )}

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Category *
                </label>
                <select
                  value={postData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="input-field py-2.5 text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <TagInput
                  tags={postData.tags}
                  onChange={(tags) => updateField("tags", tags)}
                />
              </div>

              {/* Cover Image */}
              <div className="mb-4">
                <CoverImageUpload
                  coverImage={existingCoverImage}
                  onFileSelect={(file) => {
                    setCoverImageFile(file);
                    setHasUnsavedChanges(true);
                  }}
                  onRemove={() => {
                    setCoverImageFile(null);
                    setExistingCoverImage(null);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 py-4 border-t border-dark-100 dark:border-dark-700">
                {/* Featured */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-dark-700 dark:text-dark-300">
                    ⭐ Featured Post
                  </label>
                  <button
                    type="button"
                    onClick={() => updateField("featured", !postData.featured)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      postData.featured
                        ? "bg-primary-500"
                        : "bg-dark-300 dark:bg-dark-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md 
                                    transition-transform ${postData.featured ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>

                {/* Allow Comments */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-dark-700 dark:text-dark-300">
                    💬 Allow Comments
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("allowComments", !postData.allowComments)
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      postData.allowComments
                        ? "bg-primary-500"
                        : "bg-dark-300 dark:bg-dark-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md 
                                    transition-transform ${postData.allowComments ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-dark-100 dark:border-dark-700">
                <button
                  onClick={() => handleSave("published")}
                  disabled={saving}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" /> Publishing...
                    </span>
                  ) : (
                    <>
                      <HiOutlineDocumentCheck className="w-4 h-4" />
                      {isEditing ? "Update & Publish" : "Publish Now"}
                    </>
                  )}
                </button>

                {postData.status !== "scheduled" && (
                  <button
                    onClick={() => {
                      setShowSchedule(true);
                      updateField("status", "scheduled");
                    }}
                    className="btn-secondary w-full py-3 text-sm"
                  >
                    <HiOutlineClock className="w-4 h-4" />
                    Schedule for Later
                  </button>
                )}

                {postData.status === "scheduled" && (
                  <button
                    onClick={() => handleSave("scheduled")}
                    disabled={saving || !postData.scheduledAt}
                    className="btn-secondary w-full py-3 text-sm"
                  >
                    <HiOutlineClock className="w-4 h-4" />
                    {saving ? "Scheduling..." : "Confirm Schedule"}
                  </button>
                )}

                <button
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="btn-ghost w-full py-3 text-sm"
                >
                  <HiOutlineCloudArrowUp className="w-4 h-4" />
                  Save as Draft
                </button>
              </div>

              {/* Post Info (editing only) */}
              {isEditing && (
                <div
                  className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700 
                                text-xs text-dark-400 space-y-1"
                >
                  <p>Author: {user?.name}</p>
                  <p>Post ID: {id?.slice(-8)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure? This will permanently delete the post and all its comments."
        confirmText="Delete Permanently"
        variant="danger"
      />
    </>
  );
};

export default PostEditor;
