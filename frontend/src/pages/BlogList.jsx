import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineFunnel,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
  HiXMark,
} from "react-icons/hi2";
import api from "../utils/api";
import PostCard from "../components/blog/PostCard";
import PostCardSkeleton from "../components/blog/PostCardSkeleton";
import SEO from "../components/common/SEO";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasMore: false,
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "-publishedAt";
  const currentTag = searchParams.get("tag") || "";
  const featured = searchParams.get("featured") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  const fetchPosts = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const params = new URLSearchParams();
        params.set("page", pageNum);
        params.set("limit", "12");
        if (currentCategory) params.set("category", currentCategory);
        if (currentSort) params.set("sort", currentSort);
        if (currentTag) params.set("tag", currentTag);
        if (featured === "true") params.set("featured", "true");

        const { data } = await api.get(`/posts?${params.toString()}`);

        // Safe access with fallbacks
        const posts = data?.data?.posts || [];
        const pagination = data?.data?.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          hasMore: false,
        };

        if (append) {
          setPosts((prev) => [...prev, ...posts]);
        } else {
          setPosts(posts);
        }
        setPagination(pagination);
      } catch (err) {
        console.error("Failed to fetch posts:", err.message);
        setPosts([]);
        setPagination({ current: 1, pages: 1, total: 0, hasMore: false });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentCategory, currentSort, currentTag, featured],
  );
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const loadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", pagination.current + 1);
      setSearchParams(newParams);
      fetchPosts(pagination.current + 1, true);
    }
  };

  const hasActiveFilters =
    currentCategory || currentTag || featured || currentSort !== "-publishedAt";

  const sortOptions = [
    { value: "-publishedAt", label: "Newest" },
    { value: "publishedAt", label: "Oldest" },
    { value: "-views", label: "Most Viewed" },
    { value: "-likesCount", label: "Most Liked" },
    { value: "-commentsCount", label: "Most Discussed" },
  ];

  return (
    <>
      <SEO
        title="Blog"
        description="Explore all articles and stories on BlogSpace"
      />

      <div className="min-h-screen bg-white dark:bg-dark-950">
        {/* Header */}
        <div className="bg-dark-50 dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
          <div className="container-custom py-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-900 dark:text-white mb-2">
                {currentCategory
                  ? `Category: ${currentCategory}`
                  : featured
                    ? "Featured Posts"
                    : "All Posts"}
              </h1>
              <p className="text-dark-500 dark:text-dark-400">
                {pagination.total} article{pagination.total !== 1 ? "s" : ""} to
                explore
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-6 sm:py-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-hide">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-ghost text-sm flex-shrink-0 ${showFilters ? "bg-primary-50 dark:bg-primary-950/50 text-primary-600" : ""}`}
              >
                <HiOutlineFunnel className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </button>

              {/* Quick category filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    !currentCategory
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700"
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateFilter("category", cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                      currentCategory === cat.slug
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={currentSort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="text-sm bg-dark-100 dark:bg-dark-800 border-0 rounded-lg px-3 py-2 
                           text-dark-700 dark:text-dark-300 focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-dark-100 dark:bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm"
                      : "text-dark-400 hover:text-dark-600"
                  }`}
                >
                  <HiOutlineSquares2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm"
                      : "text-dark-400 hover:text-dark-600"
                  }`}
                >
                  <HiOutlineListBullet className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-dark-400">Active filters:</span>
              {currentCategory && (
                <span className="badge-primary flex items-center gap-1">
                  {currentCategory}
                  <button onClick={() => updateFilter("category", "")}>
                    <HiXMark className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentTag && (
                <span className="badge-primary flex items-center gap-1">
                  #{currentTag}
                  <button onClick={() => updateFilter("tag", "")}>
                    <HiXMark className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-5 bg-dark-50 dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                    Category
                  </label>
                  <select
                    value={currentCategory}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="input-field py-2.5"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={currentSort}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                    className="input-field py-2.5"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-ghost text-sm w-full justify-center"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div
              className={`grid gap-3 sm:gap-5 ${
                viewMode === "grid"
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 max-w-3xl"
              }`}
            >
              <PostCardSkeleton
                count={6}
                variant={viewMode === "list" ? "horizontal" : "default"}
              />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts found"
              description="Try adjusting your filters or check back later for new content."
              action={clearFilters}
              actionText="Clear Filters"
            />
          ) : (
            <>
              {/* Replace the grid div */}
              <div
                className={`grid gap-3 sm:gap-5 ${
                  viewMode === "grid"
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-3xl"
                }`}
              >
                {posts.map((post, i) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    variant={viewMode === "list" ? "horizontal" : "default"}
                    index={i}
                  />
                ))}
              </div>

              {/* Load More */}
              {pagination.hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-secondary px-8 py-3"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Loading...
                      </span>
                    ) : (
                      `Load More (${pagination.total - posts.length} remaining)`
                    )}
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center mt-6 text-sm text-dark-400">
                Showing {posts.length} of {pagination.total} posts
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;
