import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "../images/Herosection.png";
import {
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineFire,
  HiOutlineBolt,
  HiOutlineArrowTrendingUp,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/blog/PostCard";
import PostCardSkeleton from "../components/blog/PostCardSkeleton";
import SEO from "../components/common/SEO";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

// In Home.jsx, replace fetchData function:
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const [featuredRes, latestRes, trendingRes, catRes] = await Promise.all([
      api.get('/posts/featured'),
      api.get('/posts?limit=8&sort=-publishedAt'),
      api.get('/posts/trending'),
      api.get('/categories'),
    ]);

    // Safe data extraction with fallbacks
    setFeatured(featuredRes?.data?.data?.posts || []);
    setLatest(latestRes?.data?.data?.posts || []);
    setTrending(trendingRes?.data?.data?.posts || []);
    setCategories(catRes?.data?.data?.categories || []);
    
  } catch (err) {
    console.error('Failed to fetch home data:', err.message);
    // Set empty arrays so page doesn't crash
    setFeatured([]);
    setLatest([]);
    setTrending([]);
    setCategories([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <SEO
        title="Home"
        description="Discover the best articles, stories and insights from creators worldwide."
      />

      {/* ===== HERO: Left Text + Right Image ===== */}
      <section className="relative overflow-hidden gradient-bg-subtle">
        <div className="absolute inset-0 bg-hero-pattern opacity-40 dark:opacity-15" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-400/10 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left — Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-6">
                <HiOutlineSparkles className="w-4 h-4" />
                Welcome to BlogSpace
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-dark-900 dark:text-white mb-6">
                Where <span className="gradient-text">stories</span>
                <br />
                come alive
              </h1>

              <p className="text-lg text-dark-500 dark:text-dark-400 max-w-lg mb-8 leading-relaxed">
                Discover amazing articles, connect with passionate creators, and
                share your unique voice with the world. Join us today.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <Link to="/blog" className="btn-primary text-base px-8 py-3.5">
                  Start Reading <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="btn-secondary text-base px-8 py-3.5"
                  >
                    Become a Writer
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Right — Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden sm:block"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10">
                  <img
                    src={heroImg}
                    alt="Blogging workspace"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -z-10 -bottom-8 -left-8 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20" />
              <div className="absolute -z-10 -top-8 -right-8 w-40 h-40 bg-accent-500 rounded-full blur-3xl opacity-15" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <section className="border-b border-dark-100 dark:border-dark-800 bg-white dark:bg-dark-950">
        <div className="container-custom py-5">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            <span className="text-sm font-semibold text-dark-400 flex-shrink-0">
              Explore:
            </span>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-20 rounded-full bg-dark-200 dark:bg-dark-700 animate-pulse flex-shrink-0"
                  />
                ))
              : categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-950/50 dark:hover:text-primary-300 transition-all"
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Hero Post */}
      {!loading && featured.length > 0 && (
        <section className="bg-white dark:bg-dark-950 py-8 sm:py-12">
          <div className="container-custom">
            <PostCard post={featured[0]} variant="featured-hero" index={0} />
          </div>
        </section>
      )}

      {/* Latest + Trending — Flipkart-like Grid */}
      <section className="bg-white dark:bg-dark-950 py-8 sm:py-12 lg:py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Latest — 2/3 */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5 sm:mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                    <HiOutlineBolt className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-dark-900 dark:text-white">
                      Latest Posts
                    </h2>
                    <p className="text-sm text-dark-400 hidden sm:block">
                      Fresh content just for you
                    </p>
                  </div>
                </div>
                <Link
                  to="/blog"
                  className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2 transition-all"
                >
                  View all <HiOutlineChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Latest Posts grid */}
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <PostCardSkeleton count={6} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  {latest.slice(0, 6).map((post, i) => (
                    <PostCard key={post._id} post={post} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Trending — 1/3 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-5 sm:mb-7">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                    <HiOutlineArrowTrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-dark-900 dark:text-white">
                      Trending
                    </h2>
                    <p className="text-sm text-dark-400 hidden sm:block">
                      Most popular this week
                    </p>
                  </div>
                </div>

                <div className="space-y-0">
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex gap-4 py-4 animate-pulse border-b border-dark-100 dark:border-dark-800"
                        >
                          <div className="w-8 h-6 bg-dark-200 dark:bg-dark-700 rounded" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-full bg-dark-200 dark:bg-dark-700 rounded" />
                            <div className="h-3 w-24 bg-dark-200 dark:bg-dark-700 rounded" />
                          </div>
                        </div>
                      ))
                    : trending
                        .slice(0, 6)
                        .map((post, i) => (
                          <PostCard
                            key={post._id}
                            post={post}
                            variant="compact"
                            index={i}
                          />
                        ))}
                </div>

                {/* Write CTA */}
                {!isAuthenticated && (
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/20 border border-primary-100 dark:border-primary-900/30">
                    <h3 className="text-base font-bold text-dark-900 dark:text-white mb-1.5">
                      ✍️ Start Writing
                    </h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                      Share your stories with thousands of readers.
                    </p>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all"
                    >
                      Get started free{" "}
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      {!loading && featured.length > 1 && (
        <section className="bg-dark-50 dark:bg-dark-900 py-10 sm:py-16">
          <div className="container-custom">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                <HiOutlineFire className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-dark-900 dark:text-white">
                  Editor's Picks
                </h2>
                <p className="text-sm text-dark-400">
                  Hand-picked by our editorial team
                </p>
              </div>
            </div>

            {/* 2 cols mobile, 3 cols laptop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {featured.slice(1, 7).map((post, i) => (
                <PostCard key={post._id} post={post} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Categories Grid */}
      {!loading && categories.length > 0 && (
        <section className="bg-white dark:bg-dark-950 py-10 sm:py-16">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white mb-3">
                Explore by Category
              </h2>
              <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto">
                Find exactly what you're looking for
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="group block p-4 sm:p-5 rounded-2xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className="text-2xl mb-2">{cat.icon || "📝"}</div>
                    <h3 className="text-sm sm:text-base font-bold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-0.5">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-dark-400">
                      {cat.postCount || 0} articles
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-14 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to start your journey?
              </h2>
              <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
                Join thousands of readers and writers in the BlogSpace
                community.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-white/90 shadow-xl transition-all w-full sm:w-auto justify-center"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto justify-center"
                >
                  Browse Articles
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
