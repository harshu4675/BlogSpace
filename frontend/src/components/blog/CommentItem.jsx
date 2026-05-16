import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatBubbleLeft,
  HiOutlineEllipsisHorizontal,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFlag,
} from "react-icons/hi2";
import Avatar from "../common/Avatar";
import CommentForm from "./CommentForm";
import { useAuth } from "../../context/AuthContext";
import { timeAgo, formatNumber } from "../../utils/helpers";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CommentItem = ({
  comment,
  postId,
  parentId = null,
  onReply,
  onDelete,
  onUpdate,
}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?._id === comment.author?._id;
  const canModify = isOwner || isAdmin;

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error("Please login");
    try {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      await api.post(`/posts/${postId}/comments/${comment._id}/like`);
    } catch {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${postId}/comments/${comment._id}`);
      onDelete(comment._id, parentId);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await api.put(`/posts/${postId}/comments/${comment._id}`, {
        content: editContent.trim(),
      });
      onUpdate(comment._id, editContent.trim(), parentId);
      setEditing(false);
      toast.success("Comment updated");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleReplySubmit = (reply) => {
    onReply(parentId || comment._id, reply);
    setShowReplyForm(false);
  };

  if (comment.isDeleted) {
    return (
      <div className="py-3 text-sm text-dark-400 dark:text-dark-500 italic">
        [Comment deleted]
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${parentId ? "ml-8 sm:ml-12" : ""}`}
    >
      <div className="flex gap-3">
        <Link
          to={`/user/${comment.author?.username}`}
          className="flex-shrink-0 mt-0.5"
        >
          <Avatar
            src={comment.author?.avatar?.url}
            name={comment.author?.name}
            size="sm"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/user/${comment.author?.username}`}
                className="text-sm font-semibold text-dark-900 dark:text-dark-100 
                           hover:text-primary-600 dark:hover:text-primary-400"
              >
                {comment.author?.name}
              </Link>
              <span className="text-xs text-dark-400">
                {timeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-2xs text-dark-400 italic">(edited)</span>
              )}
            </div>

            {/* Menu */}
            {canModify && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 
                             text-dark-400 transition-colors"
                >
                  <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-1 w-36 bg-white dark:bg-dark-700 rounded-xl 
                                 shadow-lg border border-dark-100 dark:border-dark-600 z-20 
                                 overflow-hidden"
                    >
                      {isOwner && (
                        <button
                          onClick={() => {
                            setEditing(true);
                            setShowMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-700 
                                     dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-600"
                        >
                          <HiOutlinePencil className="w-4 h-4" /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        disabled={deleting}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 
                                   dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <HiOutlineTrash className="w-4 h-4" /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {editing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-dark-50 dark:bg-dark-700 border border-dark-200 
                           dark:border-dark-600 rounded-xl text-sm text-dark-900 dark:text-dark-100 
                           resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 
                           outline-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-dark-500 hover:text-dark-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed mb-2 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                liked ? "text-red-500" : "text-dark-400 hover:text-red-500"
              }`}
            >
              {liked ? (
                <HiHeart className="w-3.5 h-3.5" />
              ) : (
                <HiOutlineHeart className="w-3.5 h-3.5" />
              )}
              {likesCount > 0 && formatNumber(likesCount)}
            </button>

            {!parentId && isAuthenticated && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs font-medium text-dark-400 
                           hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <HiOutlineChatBubbleLeft className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment._id}
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${comment.author?.name}...`}
                autoFocus
              />
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  parentId={comment._id}
                  onReply={onReply}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;
