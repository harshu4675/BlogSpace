import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineEllipsisVertical,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArchiveBox,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDate, formatNumber, timeAgo } from "../../utils/helpers";
import useDebounce from "../../hooks/useDebounce";
import SEO from "../../components/common/SEO";
import toast from "react-hot-toast";

const statusConfig = {
  published: {
    label: "Published",
    class: "badge-success",
    icon: HiOutlineCheckCircle,
  },
  draft: {
    label: "Draft",
    class: "badge-warning",
    icon: HiOutlineDocumentText,
  },
  scheduled: {
    label: "Scheduled",
    class: "badge-primary",
    icon: HiOutlineClock,
  },
  archived: {
    label: "Archived",
    class: "bg-dark-100 dark:bg-dark-700 text-dark-500",
    icon: HiOutlineArchiveBox,
  },
  review: {
    label: "Review",
    class:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    icon: HiOutlineEye,
  },
};

const Posts = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    postId: null,
    title: "",
  });
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const currentPage = parseInt(searchParams.get("page")) || 1;

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", currentPage);
      params.set("limit", "15");
      if (statusFilter && statusFilter !== "all")
        params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const { data } = await api.get(`/posts/admin/all?${params.toString()}`);
      setPosts(data.data.posts);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${deleteDialog.postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== deleteDialog.postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
    } finally {
      setDeleteDialog({ open: false, postId: null, title: "" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedPosts.map((id) => api.delete(`/posts/${id}`)));
      setPosts((prev) => prev.filter((p) => !selectedPosts.includes(p._id)));
      setSelectedPosts([]);
      toast.success(`${selectedPosts.length} posts deleted`);
    } catch (err) {
      toast.error("Some deletions failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((p) => p._id));
    }
  };

  const handleStatusChange = (filter) => {
    setStatusFilter(filter);
    const newParams = new URLSearchParams(searchParams);
    if (filter === "all") newParams.delete("status");
    else newParams.set("status", filter);
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    setSearchParams(newParams);
  };

  const toggleFeatured = async (postId, currentFeatured) => {
    try {
      await api.put(`/posts/${postId}`, { featured: !currentFeatured });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, featured: !currentFeatured } : p,
        ),
      );
      toast.success(currentFeatured ? "Unfeatured" : "Featured!");
    } catch {
      toast.error("Failed to update");
    }
    setActiveMenu(null);
  };

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "scheduled", label: "Scheduled" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <>
      <SEO title="Manage Posts" />

      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white">
              Posts
            </h1>
            <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">
              {pagination.total || 0} total posts
            </p>
          </div>
          <Link to="/admin/posts/create" className="btn-primary">
            <HiOutlinePlusCircle className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto mb-4 scrollbar-hide">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab.key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass
                className="absolute left-3.5 top-1/2 -translate-y-1/2 
                                                    w-4 h-4 text-dark-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-50 dark:bg-dark-700 border-0 
                           rounded-xl text-sm text-dark-900 dark:text-dark-100 
                           placeholder:text-dark-400 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {selectedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-dark-500">
                  {selectedPosts.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="btn-danger py-2 px-4 text-sm"
                >
                  {bulkDeleting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Delete Selected"
                  )}
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts found"
              description="Create your first post or adjust your filters."
              action={() => (window.location.href = "/admin/posts/create")}
              actionText="Create Post"
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-100 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedPosts.length === posts.length &&
                            posts.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-dark-300 text-primary-600 
                                     focus:ring-primary-500"
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                    {posts.map((post) => {
                      const status =
                        statusConfig[post.status] || statusConfig.draft;
                      const StatusIcon = status.icon;

                      return (
                        <motion.tr
                          key={post._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors ${
                            selectedPosts.includes(post._id)
                              ? "bg-primary-50/50 dark:bg-primary-950/20"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post._id)}
                              onChange={() => toggleSelect(post._id)}
                              className="w-4 h-4 rounded border-dark-300 text-primary-600 
                                         focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {post.featured && (
                                <HiOutlineStar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <Link
                                  to={`/admin/posts/edit/${post._id}`}
                                  className="text-sm font-semibold text-dark-900 dark:text-dark-100 
                                             hover:text-primary-600 dark:hover:text-primary-400 
                                             line-clamp-1 transition-colors"
                                >
                                  {post.title}
                                </Link>
                                <p className="text-xs text-dark-400 mt-0.5">
                                  by {post.author?.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${status.class} text-2xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-dark-600 dark:text-dark-400">
                              {post.category?.name || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 text-xs text-dark-400">
                              <span className="flex items-center gap-1">
                                <HiOutlineEye className="w-3.5 h-3.5" />
                                {formatNumber(post.views)}
                              </span>
                              <span>{formatNumber(post.likesCount)} ❤️</span>
                              <span>{formatNumber(post.commentsCount)} 💬</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-dark-400">
                              {timeAgo(post.publishedAt || post.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveMenu(
                                    activeMenu === post._id ? null : post._id,
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600 
                                           text-dark-400 transition-colors"
                              >
                                <HiOutlineEllipsisVertical className="w-5 h-5" />
                              </button>

                              <AnimatePresence>
                                {activeMenu === post._id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setActiveMenu(null)}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute right-0 mt-1 w-44 bg-white dark:bg-dark-700 
                                                 rounded-xl shadow-lg border border-dark-100 
                                                 dark:border-dark-600 z-20 overflow-hidden"
                                    >
                                      <Link
                                        to={`/blog/${post.slug}`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm 
                                                   text-dark-700 dark:text-dark-300 
                                                   hover:bg-dark-50 dark:hover:bg-dark-600"
                                        onClick={() => setActiveMenu(null)}
                                      >
                                        <HiOutlineEye className="w-4 h-4" />{" "}
                                        View
                                      </Link>
                                      <Link
                                        to={`/admin/posts/edit/${post._id}`}
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm 
                                                   text-dark-700 dark:text-dark-300 
                                                   hover:bg-dark-50 dark:hover:bg-dark-600"
                                        onClick={() => setActiveMenu(null)}
                                      >
                                        <HiOutlinePencilSquare className="w-4 h-4" />{" "}
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() =>
                                          toggleFeatured(
                                            post._id,
                                            post.featured,
                                          )
                                        }
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm 
                                                   text-dark-700 dark:text-dark-300 
                                                   hover:bg-dark-50 dark:hover:bg-dark-600"
                                      >
                                        <HiOutlineStar className="w-4 h-4" />
                                        {post.featured
                                          ? "Unfeature"
                                          : "Feature"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDeleteDialog({
                                            open: true,
                                            postId: post._id,
                                            title: post.title,
                                          });
                                          setActiveMenu(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm 
                                                   text-red-600 dark:text-red-400 
                                                   hover:bg-red-50 dark:hover:bg-red-950/30"
                                      >
                                        <HiOutlineTrash className="w-4 h-4" />{" "}
                                        Delete
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-dark-100 dark:divide-dark-700">
                {posts.map((post) => {
                  const status =
                    statusConfig[post.status] || statusConfig.draft;
                  const StatusIcon = status.icon;

                  return (
                    <div key={post._id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post._id)}
                            onChange={() => toggleSelect(post._id)}
                            className="w-4 h-4 mt-1 rounded border-dark-300 text-primary-600"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/posts/edit/${post._id}`}
                              className="text-sm font-semibold text-dark-900 dark:text-dark-100 
                                         line-clamp-2 hover:text-primary-600"
                            >
                              {post.featured && "⭐ "}
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span
                                className={`badge ${status.class} text-2xs`}
                              >
                                {status.label}
                              </span>
                              <span className="text-xs text-dark-400">
                                {post.category?.name}
                              </span>
                              <span className="text-xs text-dark-400">
                                {timeAgo(post.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
                              <span>👁 {formatNumber(post.views)}</span>
                              <span>❤️ {formatNumber(post.likesCount)}</span>
                              <span>💬 {formatNumber(post.commentsCount)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Link
                            to={`/admin/posts/edit/${post._id}`}
                            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 
                                       text-dark-400"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                postId: post._id,
                                title: post.title,
                              })
                            }
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 
                                       text-red-400"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div
                  className="flex items-center justify-between p-4 border-t border-dark-100 
                                dark:border-dark-700"
                >
                  <p className="text-sm text-dark-400">
                    Page {pagination.current} of {pagination.pages}
                  </p>
                  <div className="flex gap-1">
                    {Array.from(
                      { length: Math.min(pagination.pages, 5) },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === pagination.current
                            ? "bg-primary-600 text-white"
                            : "text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-700"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, postId: null, title: "" })
        }
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default Posts;
