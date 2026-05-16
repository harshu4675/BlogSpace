import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineNoSymbol,
  HiOutlineEllipsisVertical,
  HiOutlineEnvelope,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import api from "../../utils/api";
import Avatar from "../../components/common/Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import useDebounce from "../../hooks/useDebounce";
import { formatDate, timeAgo } from "../../utils/helpers";
import SEO from "../../components/common/SEO";
import toast from "react-hot-toast";

const roleBadge = {
  superadmin: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  admin:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  editor:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  author:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  user: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [roleModal, setRoleModal] = useState({ open: false, user: null });
  const [banDialog, setBanDialog] = useState({ open: false, user: null });
  const [banReason, setBanReason] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "20");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter) params.set("role", roleFilter);

      const { data } = await api.get(`/users?${params.toString()}`);
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async () => {
    if (!selectedRole || !roleModal.user) return;
    try {
      await api.put(`/users/${roleModal.user._id}/role`, {
        role: selectedRole,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === roleModal.user._id ? { ...u, role: selectedRole } : u,
        ),
      );
      toast.success(`Role updated to ${selectedRole}`);
      setRoleModal({ open: false, user: null });
      setSelectedRole("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleBan = async () => {
    if (!banDialog.user) return;
    try {
      const { data } = await api.put(`/users/${banDialog.user._id}/ban`, {
        reason: banReason,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === banDialog.user._id
            ? { ...u, isBanned: data.data.user.isBanned }
            : u,
        ),
      );
      toast.success(data.message);
      setBanDialog({ open: false, user: null });
      setBanReason("");
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const roles = ["user", "author", "editor", "admin"];

  return (
    <>
      <SEO title="Manage Users" />

      <div className="space-y-6 page-enter">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white">
            Users
          </h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">
            {pagination.total || 0} total users
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass
                className="absolute left-3.5 top-1/2 -translate-y-1/2 
                                                    w-4 h-4 text-dark-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, or username..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-50 dark:bg-dark-700 border-0 
                           rounded-xl text-sm text-dark-900 dark:text-dark-100 
                           placeholder:text-dark-400 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-dark-50 dark:bg-dark-700 border-0 rounded-xl text-sm 
                         text-dark-700 dark:text-dark-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              {["user", "author", "editor", "admin"].map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Try a different search term."
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-100 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                    {users.map((u) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={u.avatar?.url}
                              name={u.name}
                              size="md"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 truncate">
                                {u.name}
                              </p>
                              <p className="text-xs text-dark-400 truncate flex items-center gap-1">
                                <HiOutlineEnvelope className="w-3 h-3" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`badge text-2xs ${roleBadge[u.role] || roleBadge.user}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.isBanned ? (
                            <span className="badge badge-danger text-2xs">
                              Banned
                            </span>
                          ) : u.isActive ? (
                            <span className="badge badge-success text-2xs">
                              Active
                            </span>
                          ) : (
                            <span className="badge text-2xs bg-dark-100 text-dark-500">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-dark-400">
                            {formatDate(u.createdAt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-dark-400">
                            {u.lastLogin ? timeAgo(u.lastLogin) : "Never"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu === u._id ? null : u._id,
                                )
                              }
                              className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600 
                                         text-dark-400 transition-colors"
                            >
                              <HiOutlineEllipsisVertical className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                              {activeMenu === u._id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setActiveMenu(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-1 w-44 bg-white dark:bg-dark-700 
                                               rounded-xl shadow-lg border border-dark-100 
                                               dark:border-dark-600 z-20 overflow-hidden"
                                  >
                                    <button
                                      onClick={() => {
                                        setRoleModal({ open: true, user: u });
                                        setSelectedRole(u.role);
                                        setActiveMenu(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm 
                                                 text-dark-700 dark:text-dark-300 
                                                 hover:bg-dark-50 dark:hover:bg-dark-600"
                                    >
                                      <HiOutlineShieldCheck className="w-4 h-4" />
                                      Change Role
                                    </button>
                                    <button
                                      onClick={() => {
                                        setBanDialog({ open: true, user: u });
                                        setActiveMenu(null);
                                      }}
                                      className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm 
                                                  ${
                                                    u.isBanned
                                                      ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                      : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                  }`}
                                    >
                                      <HiOutlineNoSymbol className="w-4 h-4" />
                                      {u.isBanned ? "Unban" : "Ban User"}
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-dark-100 dark:divide-dark-700">
                {users.map((u) => (
                  <div key={u._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={u.avatar?.url} name={u.name} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {u.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`badge text-2xs ${roleBadge[u.role]}`}
                            >
                              {u.role}
                            </span>
                            {u.isBanned && (
                              <span className="badge badge-danger text-2xs">
                                Banned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setRoleModal({ open: true, user: u });
                            setSelectedRole(u.role);
                          }}
                          className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400"
                          title="Change Role"
                        >
                          <HiOutlineShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBanDialog({ open: true, user: u })}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400"
                          title={u.isBanned ? "Unban" : "Ban"}
                        >
                          <HiOutlineNoSymbol className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-dark-100 dark:border-dark-700">
                  <p className="text-sm text-dark-400">
                    Page {pagination.current} of {pagination.pages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-sm text-dark-500 hover:bg-dark-100 
                                 dark:hover:bg-dark-700 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-3 py-1.5 rounded-lg text-sm text-dark-500 hover:bg-dark-100 
                                 dark:hover:bg-dark-700 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModal.open}
        onClose={() => {
          setRoleModal({ open: false, user: null });
          setSelectedRole("");
        }}
        title="Change User Role"
        size="sm"
      >
        {roleModal.user && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
              <Avatar
                src={roleModal.user.avatar?.url}
                name={roleModal.user.name}
                size="md"
              />
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">
                  {roleModal.user.name}
                </p>
                <p className="text-sm text-dark-400">{roleModal.user.email}</p>
              </div>
            </div>

            <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
              Select Role
            </label>
            <div className="space-y-2 mb-6">
              {roles.map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer 
                              transition-all ${
                                selectedRole === role
                                  ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/30"
                                  : "border-dark-200 dark:border-dark-600 hover:border-dark-300"
                              }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white capitalize">
                      {role}
                    </p>
                    <p className="text-xs text-dark-400">
                      {role === "user" && "Can read and comment"}
                      {role === "author" && "Can write and publish posts"}
                      {role === "editor" && "Can manage all content"}
                      {role === "admin" &&
                        "Full access except superadmin features"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRoleModal({ open: false, user: null });
                  setSelectedRole("");
                }}
                className="btn-secondary py-2 px-4 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={selectedRole === roleModal.user.role}
                className="btn-primary py-2 px-4 text-sm"
              >
                <HiOutlineCheckBadge className="w-4 h-4" />
                Update Role
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Ban Dialog */}
      <Modal
        isOpen={banDialog.open}
        onClose={() => {
          setBanDialog({ open: false, user: null });
          setBanReason("");
        }}
        title={banDialog.user?.isBanned ? "Unban User" : "Ban User"}
        size="sm"
      >
        {banDialog.user && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
              <Avatar
                src={banDialog.user.avatar?.url}
                name={banDialog.user.name}
                size="md"
              />
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">
                  {banDialog.user.name}
                </p>
                <p className="text-sm text-dark-400">{banDialog.user.email}</p>
              </div>
            </div>

            {!banDialog.user.isBanned && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Reason for ban (optional)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Violation of community guidelines..."
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
            )}

            {banDialog.user.isBanned ? (
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
                This will restore the user's access to the platform. They can
                login and use all features again.
              </p>
            ) : (
              <p className="text-sm text-red-500 mb-6">
                ⚠️ This user will be immediately logged out and cannot access
                the platform until unbanned.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setBanDialog({ open: false, user: null });
                  setBanReason("");
                }}
                className="btn-secondary py-2 px-4 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className={
                  banDialog.user.isBanned
                    ? "btn-primary py-2 px-4 text-sm"
                    : "btn-danger py-2 px-4 text-sm"
                }
              >
                {banDialog.user.isBanned ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Users;
