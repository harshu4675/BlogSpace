import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatBubbleLeft,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineBookmark,
  HiBookmark,
} from "react-icons/hi2";
import Avatar from "../common/Avatar";
import {
  formatDate,
  formatNumber,
  getCategoryColor,
  timeAgo,
} from "../../utils/helpers";
import { getImageUrl } from "../../utils/api";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://placehold.co/600x400/e2e8f0/94a3b8?text=BlogSpace";

const PostCard = ({ post, variant = "default", index = 0 }) => {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(post?.isBookmarked || false);

  const catColor = getCategoryColor(post?.category?.name);
  const imageUrl = getImageUrl(post?.coverImage?.url) || PLACEHOLDER;
  const authorAvatar = getImageUrl(post?.author?.avatar?.url);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return toast.error("Please login to like posts");
    try {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return toast.error("Please login to bookmark");
    try {
      setBookmarked(!bookmarked);
      await api.post(`/posts/${post._id}/bookmark`);
      toast.success(bookmarked ? "Bookmark removed" : "Post bookmarked!");
    } catch {
      setBookmarked(!bookmarked);
    }
  };

  // ---- FEATURED HERO ----
  if (variant === "featured-hero") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Link to={`/blog/${post.slug}`} className="group block">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src = PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${catColor.bg} ${catColor.text}`}
                >
                  {post.category?.name}
                </span>
                <span className="text-white/60 text-xs sm:text-sm flex items-center gap-1">
                  <HiOutlineClock className="w-3.5 h-3.5" />
                  {post.readTime} min read
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl lg:text-4xl font-extrabold text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors leading-tight">
                {post.title}
              </h2>

              <p className="text-white/60 text-sm sm:text-base line-clamp-2 mb-3 max-w-2xl hidden sm:block">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar
                    src={authorAvatar}
                    name={post.author?.name}
                    size="sm"
                  />
                  <div>
                    <p className="text-white text-xs sm:text-sm font-semibold">
                      {post.author?.name}
                    </p>
                    <p className="text-white/50 text-xs">
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-white/50 text-sm">
                  <span className="flex items-center gap-1">
                    <HiOutlineEye className="w-4 h-4" />
                    {formatNumber(post.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineHeart className="w-4 h-4" />
                    {formatNumber(likesCount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // ---- HORIZONTAL ----
  if (variant === "horizontal") {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="group"
      >
        <Link to={`/blog/${post.slug}`} className="flex gap-3 sm:gap-4">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.src = PLACEHOLDER;
              }}
            />
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${catColor.text}`}>
                {post.category?.name}
              </span>
              <span className="text-dark-300 dark:text-dark-600">·</span>
              <span className="text-xs text-dark-400">{post.readTime}m</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-dark-900 dark:text-dark-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1 leading-snug">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <span className="font-medium">{post.author?.name}</span>
              <span>·</span>
              <span>{timeAgo(post.publishedAt)}</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // ---- COMPACT ----
  if (variant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link
          to={`/blog/${post.slug}`}
          className="group flex items-start gap-3 py-3 border-b border-dark-100 dark:border-dark-800 last:border-0"
        >
          <span className="text-2xl font-black text-dark-200 dark:text-dark-700 w-7 flex-shrink-0 font-display">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Avatar src={authorAvatar} name={post.author?.name} size="xs" />
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 truncate">
                {post.author?.name}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-dark-900 dark:text-dark-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-dark-400">
              <span>{formatDate(post.publishedAt)}</span>
              <span>·</span>
              <span>{post.readTime}m</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // ---- DEFAULT (2-col mobile, 3-col desktop) ----
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl overflow-hidden border border-dark-100 dark:border-dark-700 card-hover"
    >
      <Link to={`/blog/${post.slug}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = PLACEHOLDER;
            }}
          />

          {/* Bookmark - desktop only */}
          <div className="absolute top-2 right-2 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleBookmark}
              className="p-1.5 rounded-lg bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
            >
              {bookmarked ? (
                <HiBookmark className="w-3.5 h-3.5 text-primary-500" />
              ) : (
                <HiOutlineBookmark className="w-3.5 h-3.5 text-dark-600" />
              )}
            </button>
          </div>

          {/* Category */}
          <div className="absolute bottom-2 left-2">
            <span
              className={`${catColor.bg} ${catColor.text} inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-semibold rounded-full`}
            >
              {post.category?.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          {/* Title */}
          <h3 className="text-xs sm:text-sm lg:text-base font-bold text-dark-900 dark:text-dark-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug mb-1.5 sm:mb-2">
            {post.title}
          </h3>

          {/* Excerpt - desktop only */}
          <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2 mb-2.5 hidden sm:block">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar src={authorAvatar} name={post.author?.name} size="xs" />
              <p className="text-xs font-medium text-dark-600 dark:text-dark-400 line-clamp-1 hidden sm:block">
                {post.author?.name}
              </p>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-0.5 text-[10px] sm:text-xs text-dark-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              {liked ? (
                <HiHeart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              ) : (
                <HiOutlineHeart className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span>{formatNumber(likesCount)}</span>
            </button>
          </div>

          {/* Mobile: read time */}
          <div className="flex items-center gap-2 mt-1.5 sm:hidden">
            <span className="text-[9px] text-dark-400">
              {post.readTime || 3}m read
            </span>
            <span className="text-dark-300">·</span>
            <span className="text-[9px] text-dark-400">
              {timeAgo(post.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default PostCard;
