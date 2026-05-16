import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChatBubbleLeft } from "react-icons/hi2";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import { Link } from "react-router-dom";

const CommentSection = ({ postId, commentsCount }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(commentsCount || 0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState("-createdAt");

  const fetchComments = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const { data } = await api.get(
          `/posts/${postId}/comments?page=${pageNum}&sort=${sort}`,
        );

        if (reset || pageNum === 1) {
          setComments(data.data.comments);
        } else {
          setComments((prev) => [...prev, ...data.data.comments]);
        }
        setTotal(data.data.pagination.total);
        setHasMore(data.data.pagination.hasMore);
        setPage(pageNum);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [postId, sort],
  );

  useEffect(() => {
    fetchComments(1, true);
  }, [fetchComments]);

  const handleNewComment = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const handleReply = (parentId, reply) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        return comment;
      }),
    );
    setTotal((prev) => prev + 1);
  };

  const handleDelete = (commentId, parentId) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies:
                comment.replies?.filter((r) => r._id !== commentId) || [],
            };
          }
          return comment;
        }),
      );
    } else {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
    setTotal((prev) => prev - 1);
  };

  const handleUpdate = (commentId, content, parentId) => {
    const updateInList = (list) =>
      list.map((c) =>
        c._id === commentId ? { ...c, content, isEdited: true } : c,
      );

    if (parentId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === parentId) {
            return { ...comment, replies: updateInList(comment.replies || []) };
          }
          return comment;
        }),
      );
    } else {
      setComments((prev) => updateInList(prev));
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-dark-200 dark:border-dark-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <HiOutlineChatBubbleLeft className="w-6 h-6 text-dark-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white">
            Comments
            {total > 0 && (
              <span className="ml-2 text-base font-normal text-dark-400">
                ({total})
              </span>
            )}
          </h2>
        </div>

        {comments.length > 0 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm bg-dark-100 dark:bg-dark-800 border-0 rounded-lg px-3 py-1.5 
                       text-dark-600 dark:text-dark-300"
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-likesCount">Top</option>
          </select>
        )}
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <CommentForm postId={postId} onSubmit={handleNewComment} />
      ) : (
        <div className="p-5 rounded-2xl bg-dark-50 dark:bg-dark-800 text-center mb-8">
          <p className="text-dark-500 dark:text-dark-400 mb-3">
            Join the conversation
          </p>
          <Link to="/login" className="btn-primary py-2 px-6 text-sm">
            Sign in to comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={HiOutlineChatBubbleLeft}
          title="No comments yet"
          description="Be the first to share your thoughts!"
        />
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={postId}
                onReply={handleReply}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </AnimatePresence>

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchComments(page + 1)}
                disabled={loadingMore}
                className="btn-ghost text-primary-600 dark:text-primary-400"
              >
                {loadingMore ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Load more comments"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
