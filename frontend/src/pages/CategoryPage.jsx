import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import PostCard from "../components/blog/PostCard";
import PostCardSkeleton from "../components/blog/PostCardSkeleton";
import SEO from "../components/common/SEO";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CategoryPage = () => {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setLoading(true);
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, catRes] = await Promise.all([
          api.get(`/posts?category=${slug}&page=${page}&limit=12`),
          api.get("/categories"),
        ]);
        if (page === 1) {
          setPosts(postsRes.data.data.posts);
        } else {
          setPosts((prev) => [...prev, ...postsRes.data.data.posts]);
        }
        setPagination(postsRes.data.data.pagination);
        setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchData();
  }, [slug, page]);

  const currentCategory = categories.find((c) => c.slug === slug);

  const loadMore = () => {
    setLoadingMore(true);
    setPage((prev) => prev + 1);
  };

  return (
    <>
      <SEO
        title={currentCategory?.name || slug}
        description={currentCategory?.description || `Articles in ${slug}`}
      />

      <div className="min-h-screen bg-white dark:bg-dark-950">
        {/* Header */}
        <div className="bg-dark-50 dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
          <div className="container-custom py-10 sm:py-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="text-4xl mb-4">
                {currentCategory?.icon || "📂"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-900 dark:text-white mb-3">
                {currentCategory?.name || slug}
              </h1>
              {currentCategory?.description && (
                <p className="text-dark-500 dark:text-dark-400 text-lg">
                  {currentCategory.description}
                </p>
              )}
              <p className="text-sm text-dark-400 mt-2">
                {pagination.total || 0} articles
              </p>
            </motion.div>
          </div>
        </div>

        {/* Other Categories */}
        <div className="border-b border-dark-100 dark:border-dark-800">
          <div className="container-custom py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <Link
                to="/blog"
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-dark-100 dark:bg-dark-800 
                           text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700 
                           transition-colors flex-shrink-0"
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    cat.slug === slug
                      ? "bg-primary-600 text-white"
                      : "bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="container-custom py-8 sm:py-12">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              <PostCardSkeleton count={6} />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts in this category"
              description="Check back later or explore other categories."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {posts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </div>

              {pagination.hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-secondary px-8 py-3"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" /> Loading...
                      </span>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
