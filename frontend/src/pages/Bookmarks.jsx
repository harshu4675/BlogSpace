import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineBookmark,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/blog/PostCard";
import PostCardSkeleton from "../components/blog/PostCardSkeleton";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import SEO from "../components/common/SEO";
import toast from "react-hot-toast";

const Bookmarks = () => {
  const { user, checkAuth } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clearDialog, setClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auth/me");
        const bookmarkIds = data.data.user.bookmarks || [];

        if (bookmarkIds.length === 0) {
          setBookmarks([]);
          setLoading(false);
          return;
        }

        // Fetch full post data for each bookmark
        const postsPromises = bookmarkIds.map(async (bookmark) => {
          try {
            if (typeof bookmark === "object" && bookmark.slug) {
              return bookmark;
            }
            const postRes = await api.get(
              `/posts/${bookmark.slug || bookmark}`,
            );
            return postRes.data.data.post;
          } catch {
            return null;
          }
        });

        const posts = (await Promise.all(postsPromises)).filter(Boolean);
        setBookmarks(posts);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const removeBookmark = async (postId) => {
    try {
      await api.post(`/posts/${postId}/bookmark`);
      setBookmarks((prev) => prev.filter((b) => b._id !== postId));
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  const clearAllBookmarks = async () => {
    setClearing(true);
    try {
      await Promise.all(
        bookmarks.map((b) => api.post(`/posts/${b._id}/bookmark`)),
      );
      setBookmarks([]);
      toast.success("All bookmarks cleared");
    } catch {
      toast.error("Failed to clear bookmarks");
    } finally {
      setClearing(false);
      setClearDialog(false);
    }
  };

  const filteredBookmarks = searchTerm
    ? bookmarks.filter(
        (b) =>
          b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : bookmarks;

  return (
    <>
      <SEO title="Bookmarks" />

      <div className="min-h-screen bg-white dark:bg-dark-950">
        {/* Header */}
        <div className="bg-dark-50 dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
          <div className="container-custom py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/50 
                                  flex items-center justify-center"
                  >
                    <HiOutlineBookmark className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white">
                    Bookmarks
                  </h1>
                </div>
                <p className="text-dark-500 dark:text-dark-400">
                  {bookmarks.length} saved article
                  {bookmarks.length !== 1 ? "s" : ""}
                </p>
              </div>

              {bookmarks.length > 0 && (
                <button
                  onClick={() => setClearDialog(true)}
                  className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 
                             text-sm self-start"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Search */}
          {bookmarks.length > 3 && (
            <div className="relative max-w-md mb-6">
              <HiOutlineMagnifyingGlass
                className="absolute left-4 top-1/2 -translate-y-1/2 
                                                    w-4 h-4 text-dark-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookmarks..."
                className="w-full pl-11 pr-4 py-2.5 bg-dark-50 dark:bg-dark-800 border border-dark-200 
                           dark:border-dark-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 
                           focus:border-primary-500 transition-all outline-none"
              />
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PostCardSkeleton count={6} />
            </div>
          ) : bookmarks.length === 0 ? (
            <EmptyState
              icon={HiOutlineBookmark}
              title="No bookmarks yet"
              description="Save interesting articles to read them later. Look for the bookmark icon on any post."
              action={() => (window.location.href = "/blog")}
              actionText="Browse Articles"
            />
          ) : filteredBookmarks.length === 0 ? (
            <EmptyState
              icon={HiOutlineMagnifyingGlass}
              title="No matching bookmarks"
              description="Try a different search term."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group"
                >
                  <PostCard post={{ ...post, isBookmarked: true }} index={i} />

                  {/* Quick Remove */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeBookmark(post._id);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-red-500/90 text-white 
                               opacity-0 group-hover:opacity-100 transition-all duration-200 
                               hover:bg-red-600 shadow-lg"
                    title="Remove bookmark"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={clearDialog}
        onClose={() => setClearDialog(false)}
        onConfirm={clearAllBookmarks}
        title="Clear All Bookmarks"
        message={`Remove all ${bookmarks.length} bookmarks? This cannot be undone.`}
        confirmText="Clear All"
        variant="danger"
        loading={clearing}
      />
    </>
  );
};

export default Bookmarks;
