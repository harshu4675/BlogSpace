import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChatBubbleLeft,
  HiOutlineEye,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlinePlusCircle,
  HiOutlineChartBar,
  HiOutlineHeart,
  HiOutlineClock,
} from "react-icons/hi2";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatNumber, formatDate, timeAgo } from "../../utils/helpers";
import SEO from "../../components/common/SEO";

const StatCard = ({ icon: Icon, label, value, change, color, delay = 0 }) => {
  const colorMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-dark-800 rounded-2xl p-5 sm:p-6 border border-dark-100 
                 dark:border-dark-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              change >= 0
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                : "bg-red-100 dark:bg-red-900/30 text-red-600"
            }`}
          >
            {change >= 0 ? (
              <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
            ) : (
              <HiOutlineArrowTrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white mb-1">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="text-sm text-dark-400">{label}</p>
    </motion.div>
  );
};

const MiniBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-24 mt-4">
      {data.map((item, i) => (
        <motion.div
          key={item._id || i}
          initial={{ height: 0 }}
          animate={{ height: `${(item.count / maxVal) * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="flex-1 bg-primary-500/80 dark:bg-primary-400/60 rounded-t-md min-h-[4px] 
                     relative group cursor-pointer hover:bg-primary-600 dark:hover:bg-primary-400 
                     transition-colors"
        >
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-800 text-white 
                          text-2xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 
                          transition-opacity whitespace-nowrap z-10 pointer-events-none"
          >
            {item.count} posts
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/users/analytics");
        setAnalytics(data.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = analytics?.stats || {};
  const roleMap = {};
  (analytics?.usersByRole || []).forEach((r) => {
    roleMap[r._id] = r.count;
  });

  const days = analytics?.dailyPosts || [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <SEO title="Admin Dashboard" />

      <div className="space-y-6 sm:space-y-8 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mt-1">
              Welcome back, {user?.name?.split(" ")[0]}! Here's what's
              happening.
            </p>
          </div>
          <Link to="/admin/posts/create" className="btn-primary">
            <HiOutlinePlusCircle className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            icon={HiOutlineDocumentText}
            label="Total Posts"
            value={stats.totalPosts}
            color="blue"
            change={12}
            delay={0}
          />
          <StatCard
            icon={HiOutlineUsers}
            label="Total Users"
            value={stats.totalUsers}
            color="green"
            change={8}
            delay={0.1}
          />
          <StatCard
            icon={HiOutlineChatBubbleLeft}
            label="Comments"
            value={stats.totalComments}
            color="purple"
            change={-3}
            delay={0.2}
          />
          <StatCard
            icon={HiOutlineDocumentText}
            label="Published"
            value={stats.publishedPosts}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl p-5 sm:p-6 
                       border border-dark-100 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                  Posts Activity
                </h3>
                <p className="text-sm text-dark-400">Last 7 days</p>
              </div>
              <HiOutlineChartBar className="w-6 h-6 text-dark-300" />
            </div>

            {days.length > 0 ? (
              <>
                <MiniBarChart data={days} />
                <div className="flex justify-between mt-2">
                  {days.map((d, i) => (
                    <span
                      key={i}
                      className="text-2xs text-dark-400 flex-1 text-center"
                    >
                      {d._id?.slice(-2)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-dark-400 text-sm">
                No data for this period
              </div>
            )}

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-dark-100 dark:border-dark-700">
              <div className="text-center">
                <p className="text-xl font-bold text-dark-900 dark:text-white">
                  {stats.publishedPosts}
                </p>
                <p className="text-xs text-dark-400">Published</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-dark-900 dark:text-white">
                  {stats.draftPosts}
                </p>
                <p className="text-xs text-dark-400">Drafts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-dark-900 dark:text-white">
                  {stats.totalPosts - stats.publishedPosts - stats.draftPosts}
                </p>
                <p className="text-xs text-dark-400">Other</p>
              </div>
            </div>
          </motion.div>

          {/* Users by Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-800 rounded-2xl p-5 sm:p-6 border border-dark-100 
                       dark:border-dark-700"
          >
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">
              Users by Role
            </h3>
            <div className="space-y-3">
              {[
                {
                  role: "user",
                  label: "Users",
                  color: "bg-blue-500",
                  icon: "👤",
                },
                {
                  role: "author",
                  label: "Authors",
                  color: "bg-emerald-500",
                  icon: "✍️",
                },
                {
                  role: "editor",
                  label: "Editors",
                  color: "bg-purple-500",
                  icon: "📝",
                },
                {
                  role: "admin",
                  label: "Admins",
                  color: "bg-orange-500",
                  icon: "🛡️",
                },
              ].map(({ role, label, color, icon }) => {
                const count = roleMap[role] || 0;
                const percent =
                  stats.totalUsers > 0
                    ? Math.round((count / stats.totalUsers) * 100)
                    : 0;
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2 text-dark-700 dark:text-dark-300">
                        <span>{icon}</span>
                        {label}
                      </span>
                      <span className="font-semibold text-dark-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-dark-100 dark:border-dark-700">
              <Link
                to="/admin/users"
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 
                           hover:text-primary-700 flex items-center gap-1"
              >
                Manage Users →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-dark-800 rounded-2xl p-5 sm:p-6 border border-dark-100 
                       dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                Top Posts
              </h3>
              <Link
                to="/admin/posts"
                className="text-sm text-primary-600 dark:text-primary-400 
                                                  font-medium hover:text-primary-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {(analytics?.topPosts || []).map((post, i) => (
                <div key={post._id} className="flex items-start gap-3">
                  <span
                    className="text-lg font-black text-dark-200 dark:text-dark-600 w-6 
                                   flex-shrink-0 font-display"
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-sm font-semibold text-dark-900 dark:text-dark-100 
                                 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 
                                 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <HiOutlineEye className="w-3.5 h-3.5" />
                        {formatNumber(post.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineHeart className="w-3.5 h-3.5" />
                        {formatNumber(post.likesCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineChatBubbleLeft className="w-3.5 h-3.5" />
                        {formatNumber(post.commentsCount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {(!analytics?.topPosts || analytics.topPosts.length === 0) && (
                <p className="text-sm text-dark-400 text-center py-4">
                  No posts yet
                </p>
              )}
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-dark-800 rounded-2xl p-5 sm:p-6 border border-dark-100 
                       dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                Recent Users
              </h3>
              <Link
                to="/admin/users"
                className="text-sm text-primary-600 dark:text-primary-400 
                                                  font-medium hover:text-primary-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {(analytics?.recentUsers || []).map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <Avatar src={u.avatar?.url} name={u.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-dark-400 truncate">{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`badge text-2xs ${
                        u.role === "admin"
                          ? "badge-warning"
                          : u.role === "author"
                            ? "badge-success"
                            : "badge-primary"
                      }`}
                    >
                      {u.role}
                    </span>
                    <p className="text-2xs text-dark-400 mt-1">
                      {timeAgo(u.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {(!analytics?.recentUsers ||
                analytics.recentUsers.length === 0) && (
                <p className="text-sm text-dark-400 text-center py-4">
                  No users yet
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            {
              label: "New Post",
              icon: HiOutlinePlusCircle,
              path: "/admin/posts/create",
              color: "from-primary-500 to-primary-600",
            },
            {
              label: "All Posts",
              icon: HiOutlineDocumentText,
              path: "/admin/posts",
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Users",
              icon: HiOutlineUsers,
              path: "/admin/users",
              color: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Categories",
              icon: HiOutlineChartBar,
              path: "/admin/categories",
              color: "from-purple-500 to-purple-600",
            },
          ].map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-800 border 
                         border-dark-100 dark:border-dark-700 hover:shadow-lg transition-all 
                         hover:-translate-y-1"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} 
                              flex items-center justify-center mb-3`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-dark-900 dark:text-white">
                {action.label}
              </p>
            </Link>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;
