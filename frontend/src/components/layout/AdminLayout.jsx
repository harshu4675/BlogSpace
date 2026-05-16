import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSquares2X2,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineTag,
  HiOutlinePlusCircle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiXMark,
  HiOutlineCog6Tooth,
  HiOutlineChevronLeft,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../common/Avatar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    {
      icon: HiOutlineSquares2X2,
      label: "Dashboard",
      path: "/admin",
      end: true,
    },
    { icon: HiOutlineDocumentText, label: "Posts", path: "/admin/posts" },
    {
      icon: HiOutlinePlusCircle,
      label: "New Post",
      path: "/admin/posts/create",
    },
    ...(isAdmin
      ? [
          { icon: HiOutlineUsers, label: "Users", path: "/admin/users" },
          {
            icon: HiOutlineTag,
            label: "Categories",
            path: "/admin/categories",
          },
        ]
      : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-200 dark:border-dark-700">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-xl font-black text-white">B</span>
          </div>
          <div>
            <span className="text-lg font-bold text-dark-900 dark:text-white">
              BlogSpace
            </span>
            <p className="text-2xs text-dark-400 uppercase tracking-wider font-semibold">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
              ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 shadow-sm"
                  : "text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-dark-200"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-dark-200 dark:border-dark-700 space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium 
                     text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 
                     transition-colors"
        >
          <HiOutlineCog6Tooth className="w-5 h-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium 
                     text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 
                     transition-colors"
        >
          <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
          Logout
        </button>

        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-dark-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col 
                         bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-700 z-30"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-900 z-50 
                         shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-100 
                           dark:hover:bg-dark-800 text-dark-500"
              >
                <HiXMark className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl 
                           border-b border-dark-200 dark:border-dark-700"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 
                           text-dark-600 dark:text-dark-300"
              >
                <HiOutlineBars3 className="w-6 h-6" />
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 
                           hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                View Site
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 
                           text-dark-600 dark:text-dark-300 transition-colors"
              >
                {darkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
