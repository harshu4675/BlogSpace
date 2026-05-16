import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineChatBubbleLeft,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineShare,
  HiOutlineLink,
  HiOutlineArrowLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import SEO from "../components/common/SEO";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CommentSection from "../components/blog/CommentSection";
import PostCard from "../components/blog/PostCard";
import {
  formatDate,
  formatNumber,
  getCategoryColor,
  timeAgo,
} from "../utils/helpers";
import { getImageUrl } from "../utils/api";
import toast from "react-hot-toast";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/posts/${slug}`);
        setPost(data.data.post);
        setLiked(data.data.post.isLiked || false);
        setLikesCount(data.data.post.likesCount || 0);
        setBookmarked(data.data.post.isBookmarked || false);
      } catch (err) {
        if (err.response?.status === 404) navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error("Please login to like");
    try {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return toast.error("Please login to bookmark");
    try {
      setBookmarked(!bookmarked);
      await api.post(`/posts/${post._id}/bookmark`);
      toast.success(bookmarked ? "Bookmark removed" : "Post bookmarked!");
    } catch {
      setBookmarked(!bookmarked);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = post?.title;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      copy: null,
    };

    if (platform === "copy") {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) return null;

  const catColor = getCategoryColor(post.category?.name);

  return (
    <>
      <SEO
        title={post.seo?.metaTitle || post.title}
        description={post.seo?.metaDescription || post.excerpt}
        image={post.coverImage?.url}
        type="article"
        author={post.author?.name}
        publishedAt={post.publishedAt}
        keywords={post.tags?.join(", ")}
      />

      <article className="min-h-screen bg-white dark:bg-dark-950">
        {/* Breadcrumb */}
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Link to="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <HiOutlineChevronRight className="w-3 h-3" />
            <Link
              to="/blog"
              className="hover:text-primary-600 transition-colors"
            >
              Blog
            </Link>
            <HiOutlineChevronRight className="w-3 h-3" />
            <Link
              to={`/category/${post.category?.slug}`}
              className="hover:text-primary-600 transition-colors"
            >
              {post.category?.name}
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container-custom pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Link
                  to={`/category/${post.category?.slug}`}
                  className={`badge ${catColor.bg} ${catColor.text}`}
                >
                  {post.category?.name}
                </Link>
                <span className="flex items-center gap-1 text-sm text-dark-400">
                  <HiOutlineClock className="w-4 h-4" />
                  {post.readTime} min read
                </span>
                <span className="flex items-center gap-1 text-sm text-dark-400">
                  <HiOutlineCalendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 
                             dark:text-white leading-tight mb-5"
              >
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg sm:text-xl text-dark-500 dark:text-dark-400 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}

              {/* Author + Actions */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 
                              pb-6 border-b border-dark-200 dark:border-dark-700"
              >
                <Link
                  to={`/user/${post.author?.username}`}
                  className="flex items-center gap-3 group"
                >
                  {" "}
                  <Avatar
                    src={getImageUrl(post.author?.avatar?.url)}
                    name={post.author?.name}
                    size="lg"
                    ring
                  />
                  <div>
                    <p
                      className="font-semibold text-dark-900 dark:text-white 
                                  group-hover:text-primary-600 dark:group-hover:text-primary-400 
                                  transition-colors"
                    >
                      {post.author?.name}
                    </p>
                    <p className="text-sm text-dark-400">
                      {post.author?.bio?.substring(0, 60) ||
                        "Writer at BlogSpace"}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {/* Like */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium 
                                transition-all ${
                                  liked
                                    ? "bg-red-50 dark:bg-red-950/30 text-red-500"
                                    : "bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:text-red-500"
                                }`}
                  >
                    {liked ? (
                      <HiHeart className="w-5 h-5" />
                    ) : (
                      <HiOutlineHeart className="w-5 h-5" />
                    )}
                    {formatNumber(likesCount)}
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={handleBookmark}
                    className={`p-2.5 rounded-xl transition-all ${
                      bookmarked
                        ? "bg-primary-50 dark:bg-primary-950/30 text-primary-500"
                        : "bg-dark-100 dark:bg-dark-800 text-dark-500 hover:text-primary-500"
                    }`}
                  >
                    {bookmarked ? (
                      <HiBookmark className="w-5 h-5" />
                    ) : (
                      <HiOutlineBookmark className="w-5 h-5" />
                    )}
                  </button>

                  {/* Share */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2.5 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-500 
                                 hover:text-primary-500 transition-all"
                    >
                      <HiOutlineShare className="w-5 h-5" />
                    </button>

                    {showShareMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowShareMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl 
                                     shadow-lg border border-dark-100 dark:border-dark-700 z-20 
                                     overflow-hidden"
                        >
                          {[
                            { key: "twitter", label: "𝕏 Twitter", emoji: "🐦" },
                            { key: "facebook", label: "Facebook", emoji: "📘" },
                            { key: "linkedin", label: "LinkedIn", emoji: "💼" },
                            { key: "whatsapp", label: "WhatsApp", emoji: "💬" },
                            { key: "copy", label: "Copy Link", emoji: "🔗" },
                          ].map((item) => (
                            <button
                              key={item.key}
                              onClick={() => handleShare(item.key)}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm 
                                         text-dark-700 dark:text-dark-300 hover:bg-dark-50 
                                         dark:hover:bg-dark-700 transition-colors"
                            >
                              <span>{item.emoji}</span>
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage?.url && (
          <div className="container-custom mb-8 sm:mb-12">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl sm:rounded-3xl overflow-hidden"
              >
                <img
                  src={post.coverImage.url}
                  alt={post.coverImage.alt || post.title}
                  className="w-full aspect-[16/9] object-cover"
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container-custom pb-12">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-10 pt-6 border-t border-dark-200 dark:border-dark-700">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="px-3 py-1.5 rounded-lg bg-dark-100 dark:bg-dark-800 text-sm 
                                 text-dark-600 dark:text-dark-400 hover:bg-primary-100 
                                 hover:text-primary-700 dark:hover:bg-primary-950/50 
                                 dark:hover:text-primary-300 transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Bar */}
            <div
              className="mt-8 py-4 px-6 rounded-2xl bg-dark-50 dark:bg-dark-800 
                            flex items-center justify-around"
            >
              {[
                {
                  icon: HiOutlineEye,
                  label: "Views",
                  value: formatNumber(post.views),
                },
                {
                  icon: HiOutlineHeart,
                  label: "Likes",
                  value: formatNumber(likesCount),
                },
                {
                  icon: HiOutlineChatBubbleLeft,
                  label: "Comments",
                  value: formatNumber(post.commentsCount),
                },
                {
                  icon: HiOutlineClock,
                  label: "Read Time",
                  value: `${post.readTime}m`,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-dark-900 dark:text-white">
                    {value}
                  </p>
                  <p className="text-2xs text-dark-400 uppercase tracking-wider">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Author Card */}
            <div
              className="mt-10 p-6 sm:p-8 rounded-2xl bg-dark-50 dark:bg-dark-800 border 
                            border-dark-100 dark:border-dark-700"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to={`/user/${post.author?.username}`}>
                  <Avatar
                    src={post.author?.avatar?.url}
                    name={post.author?.name}
                    size="xl"
                    ring
                  />
                </Link>
                <div className="flex-1">
                  <p className="text-xs text-dark-400 uppercase tracking-wider font-semibold mb-1">
                    Written by
                  </p>
                  <Link
                    to={`/user/${post.author?.username}`}
                    className="text-xl font-bold text-dark-900 dark:text-white hover:text-primary-600 
                               dark:hover:text-primary-400 transition-colors"
                  >
                    {post.author?.name}
                  </Link>
                  <p className="text-dark-500 dark:text-dark-400 text-sm mt-1 leading-relaxed">
                    {post.author?.bio ||
                      "Writer and creator on BlogSpace. Sharing stories and insights."}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      to={`/user/${post.author?.username}`}
                      className="text-sm font-semibold text-primary-600 dark:text-primary-400 
                                 hover:text-primary-700"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <CommentSection
              postId={post._id}
              commentsCount={post.commentsCount}
            />

            {/* Related Posts */}
            {post.relatedPosts?.length > 0 && (
              <section className="mt-12 pt-10 border-t border-dark-200 dark:border-dark-700">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-6">
                  You might also like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {post.relatedPosts.map((related, i) => (
                    <PostCard
                      key={related._id}
                      post={related}
                      variant="horizontal"
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Floating Bottom Bar (Mobile) */}
        <div
          className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-dark-900/90 
                        backdrop-blur-xl border-t border-dark-200 dark:border-dark-700 
                        p-3 sm:hidden safe-area-inset-bottom"
        >
          <div className="flex items-center justify-around">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-0.5"
            >
              {liked ? (
                <HiHeart className="w-6 h-6 text-red-500" />
              ) : (
                <HiOutlineHeart className="w-6 h-6 text-dark-400" />
              )}
              <span className="text-2xs text-dark-400">
                {formatNumber(likesCount)}
              </span>
            </button>

            <Link to="#comments" className="flex flex-col items-center gap-0.5">
              <HiOutlineChatBubbleLeft className="w-6 h-6 text-dark-400" />
              <span className="text-2xs text-dark-400">
                {formatNumber(post.commentsCount)}
              </span>
            </Link>

            <button
              onClick={handleBookmark}
              className="flex flex-col items-center gap-0.5"
            >
              {bookmarked ? (
                <HiBookmark className="w-6 h-6 text-primary-500" />
              ) : (
                <HiOutlineBookmark className="w-6 h-6 text-dark-400" />
              )}
              <span className="text-2xs text-dark-400">Save</span>
            </button>

            <button
              onClick={() => handleShare("copy")}
              className="flex flex-col items-center gap-0.5"
            >
              <HiOutlineShare className="w-6 h-6 text-dark-400" />
              <span className="text-2xs text-dark-400">Share</span>
            </button>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPost;
