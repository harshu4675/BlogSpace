import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi2";

const SEOPanel = ({ seo, onChange, title, excerpt }) => {
  const [expanded, setExpanded] = useState(false);

  const metaTitle = seo.metaTitle || title || "";
  const metaDescription = seo.metaDescription || excerpt || "";
  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const handleChange = (field, value) => {
    onChange({ ...seo, [field]: value });
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-5 text-left hover:bg-dark-50 
                   dark:hover:bg-dark-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 
                          flex items-center justify-center"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-900 dark:text-white">
              SEO Settings
            </h3>
            <p className="text-xs text-dark-400">Optimize for search engines</p>
          </div>
        </div>
        {expanded ? (
          <HiOutlineChevronUp className="w-5 h-5 text-dark-400" />
        ) : (
          <HiOutlineChevronDown className="w-5 h-5 text-dark-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-5">
              {/* Google Preview */}
              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
                  Google Preview
                </label>
                <div
                  className="p-4 bg-white dark:bg-dark-700 rounded-xl border border-dark-200 
                                dark:border-dark-600"
                >
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 truncate">
                    blogspace.com › blog › your-post-slug
                  </p>
                  <p
                    className="text-base font-medium text-blue-700 dark:text-blue-400 mb-1 
                                line-clamp-1 hover:underline cursor-pointer"
                  >
                    {metaTitle || "Your post title will appear here"}
                  </p>
                  <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-2">
                    {metaDescription ||
                      "Your post description will appear here. Write a compelling meta description to improve click-through rates."}
                  </p>
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                    Meta Title
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      titleLength > 60
                        ? "text-red-500"
                        : titleLength > 50
                          ? "text-amber-500"
                          : "text-dark-400"
                    }`}
                  >
                    {titleLength}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={seo.metaTitle || ""}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  placeholder={
                    title || "Custom meta title (defaults to post title)"
                  }
                  className="input-field text-sm"
                  maxLength={70}
                />
                <div className="mt-1.5 h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      titleLength > 60
                        ? "bg-red-500"
                        : titleLength > 50
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min((titleLength / 60) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                    Meta Description
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      descLength > 160
                        ? "text-red-500"
                        : descLength > 140
                          ? "text-amber-500"
                          : "text-dark-400"
                    }`}
                  >
                    {descLength}/160
                  </span>
                </div>
                <textarea
                  value={seo.metaDescription || ""}
                  onChange={(e) =>
                    handleChange("metaDescription", e.target.value)
                  }
                  placeholder={
                    excerpt || "Custom meta description (defaults to excerpt)"
                  }
                  className="input-field text-sm resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="mt-1.5 h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      descLength > 160
                        ? "bg-red-500"
                        : descLength > 140
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min((descLength / 160) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Focus Keywords
                </label>
                <input
                  type="text"
                  value={seo.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    handleChange(
                      "keywords",
                      e.target.value
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="react, javascript, web development"
                  className="input-field text-sm"
                />
                <p className="text-xs text-dark-400 mt-1">
                  Separate with commas
                </p>
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Canonical URL (optional)
                </label>
                <input
                  type="url"
                  value={seo.canonicalUrl || ""}
                  onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                  placeholder="https://example.com/original-article"
                  className="input-field text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SEOPanel;
