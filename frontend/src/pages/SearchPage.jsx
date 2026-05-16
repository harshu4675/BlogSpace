import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
  HiOutlineFunnel,
  HiOutlineSparkles,
} from "react-icons/hi2";
import api from "../utils/api";
import PostCard from "../components/blog/PostCard";
import PostCardSkeleton from "../components/blog/PostCardSkeleton";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SEO from "../components/common/SEO";
import useDebounce from "../hooks/useDebounce";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "-publishedAt",
  );
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 400);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecentSearches(JSON.parse(stored).slice(0, 8));
  }, []);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current && !initialQuery) {
      inputRef.current.focus();
    }
  }, [initialQuery]);

  // Generate suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 2 && !searched) {
      const fetchSuggestions = async () => {
        try {
          const { data } = await api.get(
            `/posts?search=${debouncedQuery}&limit=5`,
          );
          setSuggestions(
            data.data.posts.map((p) => ({ title: p.title, slug: p.slug })),
          );
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery, searched]);

  const performSearch = useCallback(
    async (searchQuery, page = 1) => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      setSearched(true);
      setShowSuggestions(false);

      const params = new URLSearchParams();
      params.set("search", searchQuery.trim());
      params.set("page", page);
      params.set("limit", "12");
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("sort", sortBy);

      try {
        const { data } = await api.get(`/posts?${params.toString()}`);
        setResults(data.data.posts);
        setPagination(data.data.pagination);

        // Save to recent searches
        const newRecent = [
          searchQuery.trim(),
          ...recentSearches.filter((s) => s !== searchQuery.trim()),
        ].slice(0, 8);
        setRecentSearches(newRecent);
        localStorage.setItem("recentSearches", JSON.stringify(newRecent));

        // Update URL
        const urlParams = new URLSearchParams();
        urlParams.set("q", searchQuery.trim());
        if (selectedCategory) urlParams.set("category", selectedCategory);
        if (sortBy !== "-publishedAt") urlParams.set("sort", sortBy);
        setSearchParams(urlParams);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, sortBy, recentSearches, setSearchParams],
  );

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery);
  }, []);

  useEffect(() => {
    if (searched && query.trim()) performSearch(query);
  }, [selectedCategory, sortBy]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSuggestionClick = (title) => {
    setQuery(title);
    performSearch(title);
  };

  const removeRecentSearch = (search) => {
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const trendingTopics = [
    "React",
    "AI",
    "Web Development",
    "Fitness",
    "Startups",
    "Travel Tips",
    "Productivity",
    "Design",
  ];

  return (
    <>
      <SEO title={query ? `Search: ${query}` : "Search"} />

      <div className="min-h-screen bg-white dark:bg-dark-950">
        {/* Search Header */}
        <div
          className="bg-gradient-to-br from-primary-50 via-white to-accent-50 
                        dark:from-dark-900 dark:via-dark-950 dark:to-dark-900 
                        border-b border-dark-100 dark:border-dark-800"
        >
          <div className="container-custom py-8 sm:py-12 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-900 
                             dark:text-white mb-6"
              >
                {searched ? "Search Results" : "Search BlogSpace"}
              </h1>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <HiOutlineMagnifyingGlass
                    className="absolute left-5 top-1/2 -translate-y-1/2 
                                                        w-5 h-5 text-dark-400"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSearched(false);
                    }}
                    onFocus={() =>
                      query.length >= 2 &&
                      suggestions.length > 0 &&
                      setShowSuggestions(true)
                    }
                    placeholder="Search articles, topics, authors..."
                    className="w-full pl-14 pr-24 py-4 sm:py-5 bg-white dark:bg-dark-800 
                               border-2 border-dark-200 dark:border-dark-600 rounded-2xl 
                               text-dark-900 dark:text-dark-100 text-base sm:text-lg 
                               placeholder:text-dark-400 
                               focus:border-primary-500 dark:focus:border-primary-400 
                               focus:ring-4 focus:ring-primary-500/10 
                               shadow-lg shadow-dark-900/5 
                               transition-all duration-200 outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSearched(false);
                        setResults([]);
                        inputRef.current?.focus();
                      }}
                      className="absolute right-20 top-1/2 -translate-y-1/2 p-1 rounded-full 
                                 hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400"
                    >
                      <HiOutlineXMark className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 
                               bg-primary-600 hover:bg-primary-700 text-white font-semibold 
                               rounded-xl text-sm transition-colors"
                  >
                    Search
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-800 
                                 rounded-xl shadow-xl border border-dark-100 dark:border-dark-700 
                                 z-20 overflow-hidden"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionClick(s.title)}
                          className="flex items-center gap-3 w-full px-5 py-3 text-left text-sm 
                                     text-dark-700 dark:text-dark-300 hover:bg-dark-50 
                                     dark:hover:bg-dark-700 transition-colors"
                        >
                          <HiOutlineMagnifyingGlass className="w-4 h-4 text-dark-400 flex-shrink-0" />
                          <span className="line-clamp-1">{s.title}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {searched && pagination.total !== undefined && (
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-4">
                  Found{" "}
                  <span className="font-semibold text-dark-700 dark:text-dark-200">
                    {pagination.total}
                  </span>{" "}
                  result{pagination.total !== 1 ? "s" : ""} for "
                  <span className="font-semibold text-dark-700 dark:text-dark-200">
                    {query}
                  </span>
                  "
                </p>
              )}
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-8 sm:py-12">
          {!searched ? (
            /* Pre-search State */
            <div className="max-w-2xl mx-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-sm font-semibold text-dark-500 dark:text-dark-400 
                                   uppercase tracking-wider flex items-center gap-2"
                    >
                      <HiOutlineClock className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-dark-400 hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, i) => (
                      <div key={i} className="group flex items-center">
                        <button
                          onClick={() => {
                            setQuery(search);
                            performSearch(search);
                          }}
                          className="px-4 py-2 bg-dark-100 dark:bg-dark-800 text-sm text-dark-600 
                                     dark:text-dark-400 rounded-l-xl hover:bg-dark-200 
                                     dark:hover:bg-dark-700 transition-colors"
                        >
                          {search}
                        </button>
                        <button
                          onClick={() => removeRecentSearch(search)}
                          className="px-2 py-2 bg-dark-100 dark:bg-dark-800 text-dark-400 
                                     rounded-r-xl hover:bg-red-100 hover:text-red-500 
                                     dark:hover:bg-red-950/30 transition-colors"
                        >
                          <HiOutlineXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3
                  className="text-sm font-semibold text-dark-500 dark:text-dark-400 
                               uppercase tracking-wider flex items-center gap-2 mb-4"
                >
                  <HiOutlineArrowTrendingUp className="w-4 h-4" />
                  Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setQuery(topic);
                        performSearch(topic);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 
                                 dark:from-primary-950/30 dark:to-accent-950/20 
                                 text-primary-700 dark:text-primary-300 text-sm font-medium 
                                 rounded-xl border border-primary-100 dark:border-primary-800 
                                 hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Quick Categories */}
              {categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-10"
                >
                  <h3
                    className="text-sm font-semibold text-dark-500 dark:text-dark-400 
                                 uppercase tracking-wider flex items-center gap-2 mb-4"
                  >
                    <HiOutlineSparkles className="w-4 h-4" />
                    Browse Categories
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.slice(0, 9).map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800 
                                   hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors 
                                   border border-dark-100 dark:border-dark-700"
                      >
                        <span className="text-lg">{cat.icon || "📝"}</span>
                        <div>
                          <p className="text-sm font-semibold text-dark-900 dark:text-white">
                            {cat.name}
                          </p>
                          <p className="text-xs text-dark-400">
                            {cat.postCount || 0} posts
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* Search Results */
            <div>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <HiOutlineFunnel className="w-4 h-4 text-dark-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm bg-dark-100 dark:bg-dark-800 border-0 rounded-lg px-3 py-2 
                               text-dark-700 dark:text-dark-300 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm bg-dark-100 dark:bg-dark-800 border-0 rounded-lg px-3 py-2 
                               text-dark-700 dark:text-dark-300 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="-publishedAt">Most Recent</option>
                    <option value="-views">Most Viewed</option>
                    <option value="-likesCount">Most Liked</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <PostCardSkeleton count={6} />
                </div>
              ) : results.length === 0 ? (
                <EmptyState
                  icon={HiOutlineMagnifyingGlass}
                  title="No results found"
                  description={`We couldn't find anything for "${query}". Try different keywords or browse categories.`}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((post, i) => (
                      <PostCard key={post._id} post={post} index={i} />
                    ))}
                  </div>

                  {pagination.hasMore && (
                    <div className="text-center mt-10">
                      <button
                        onClick={() =>
                          performSearch(query, pagination.current + 1)
                        }
                        className="btn-secondary px-8 py-3"
                      >
                        Load More Results
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
