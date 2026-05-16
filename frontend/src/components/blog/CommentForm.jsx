import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CommentForm = ({
  postId,
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Comment cannot be empty");
    if (content.trim().length < 2) return toast.error("Comment is too short");

    setLoading(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
        parentId,
      });
      setContent("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onSubmit(data.data.comment);
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="mb-8"
    >
      <div className="flex gap-3">
        <Avatar
          src={user?.avatar?.url}
          name={user?.name}
          size="md"
          className="mt-1 hidden sm:flex"
        />

        <div className="flex-1">
          <div
            className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
              focused
                ? "border-primary-500 ring-4 ring-primary-500/10 bg-white dark:bg-dark-800"
                : "border-dark-200 dark:border-dark-600 bg-dark-50 dark:bg-dark-800"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                autoResize();
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={focused || content ? 3 : 1}
              maxLength={2000}
              className="w-full px-4 py-3 bg-transparent border-0 resize-none text-dark-900 
                         dark:text-dark-100 placeholder:text-dark-400 focus:ring-0 outline-none 
                         text-sm sm:text-base"
            />

            {(focused || content) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between px-4 py-2.5 bg-dark-50 
                           dark:bg-dark-700/50 border-t border-dark-100 dark:border-dark-600"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${content.length > 1800 ? "text-red-500" : "text-dark-400"}`}
                  >
                    {content.length}/2000
                  </span>
                  <span className="text-2xs text-dark-300 hidden sm:inline">
                    Ctrl+Enter to submit
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-sm text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 
                                 font-medium px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 
                               hover:bg-primary-700 text-white text-sm font-semibold rounded-lg 
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Post
                        <HiOutlinePaperAirplane className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default CommentForm;
