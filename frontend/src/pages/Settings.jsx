import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineBellAlert,
  HiOutlinePaintBrush,
  HiOutlineCamera,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/common/Avatar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SEO from "../components/common/SEO";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, updateProfile, updateAvatar, changePassword } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    social: {
      twitter: user?.social?.twitter || "",
      instagram: user?.social?.instagram || "",
      linkedin: user?.social?.linkedin || "",
      website: user?.social?.website || "",
    },
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    newsletter: user?.preferences?.newsletter ?? true,
    notifications: user?.preferences?.notifications ?? true,
    darkMode: darkMode,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialField = name.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        social: { ...prev.social, [socialField]: value },
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(profileData);
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image must be under 5MB");
    if (!file.type.startsWith("image/"))
      return toast.error("Please select an image file");
    await updateAvatar(file);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (passwordData.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setSaving(true);
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setSaving(false);

    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ preferences });
    setSaving(false);
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: HiOutlineUser },
    { key: "password", label: "Password", icon: HiOutlineLockClosed },
    { key: "preferences", label: "Preferences", icon: HiOutlinePaintBrush },
    { key: "notifications", label: "Notifications", icon: HiOutlineBellAlert },
  ];

  const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-dark-900 dark:text-white">
          {label}
        </p>
        {description && (
          <p className="text-xs text-dark-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-primary-500" : "bg-dark-300 dark:bg-dark-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <>
      <SEO title="Settings" />

      <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
        <div className="container-custom py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 dark:text-white mb-1">
              Settings
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mb-8">
              Manage your account and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div
                className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 
                              dark:border-dark-700 overflow-hidden sticky top-24"
              >
                <nav className="p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm 
                                  font-medium transition-all ${
                                    activeTab === tab.key
                                      ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300"
                                      : "text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700"
                                  }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div
                className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 
                              dark:border-dark-700 p-5 sm:p-8"
              >
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
                      Profile Information
                    </h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-8 p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                      <div className="relative">
                        <Avatar
                          src={user?.avatar?.url}
                          name={user?.name}
                          size="xl"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 
                                     text-white flex items-center justify-center shadow-lg 
                                     hover:bg-primary-700 transition-colors"
                        >
                          <HiOutlineCamera className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark-900 dark:text-white">
                          Profile Photo
                        </p>
                        <p className="text-xs text-dark-400 mt-0.5">
                          JPG, PNG or WebP. Max 5MB.
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1 
                                     hover:text-primary-700"
                        >
                          Upload new photo
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label
                            className="block text-sm font-semibold text-dark-700 
                                           dark:text-dark-300 mb-2"
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-semibold text-dark-700 
                                           dark:text-dark-300 mb-2"
                          >
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={profileData.username}
                            onChange={handleProfileChange}
                            className="input-field"
                            pattern="^[a-zA-Z0-9_]+$"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-semibold text-dark-700 
                                         dark:text-dark-300 mb-2"
                        >
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          className="input-field resize-none"
                          rows={3}
                          maxLength={500}
                          placeholder="Tell the world about yourself..."
                        />
                        <p className="text-xs text-dark-400 mt-1 text-right">
                          {profileData.bio.length}/500
                        </p>
                      </div>

                      {/* Social Links */}
                      <div>
                        <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">
                          Social Links
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              name: "social.twitter",
                              label: "Twitter/X",
                              placeholder: "username",
                            },
                            {
                              name: "social.instagram",
                              label: "Instagram",
                              placeholder: "username",
                            },
                            {
                              name: "social.linkedin",
                              label: "LinkedIn",
                              placeholder: "username",
                            },
                            {
                              name: "social.website",
                              label: "Website",
                              placeholder: "https://yoursite.com",
                            },
                          ].map((field) => (
                            <div key={field.name}>
                              <label className="block text-xs font-medium text-dark-500 mb-1.5">
                                {field.label}
                              </label>
                              <input
                                type="text"
                                name={field.name}
                                value={
                                  field.name
                                    .split(".")
                                    .reduce(
                                      (obj, key) => obj?.[key],
                                      profileData,
                                    ) || ""
                                }
                                onChange={handleProfileChange}
                                placeholder={field.placeholder}
                                className="input-field py-2.5 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-dark-100 dark:border-dark-700">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <LoadingSpinner size="sm" /> Saving...
                            </span>
                          ) : (
                            <>
                              <HiOutlineCheckCircle className="w-5 h-5" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                      Change Password
                    </h2>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
                      Ensure your account stays secure by updating your password
                      regularly.
                    </p>

                    <form
                      onSubmit={handlePasswordSubmit}
                      className="space-y-5 max-w-md"
                    >
                      <div>
                        <label
                          className="block text-sm font-semibold text-dark-700 
                                         dark:text-dark-300 mb-2"
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-semibold text-dark-700 
                                         dark:text-dark-300 mb-2"
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="input-field"
                          minLength={8}
                          required
                        />
                        <p className="text-xs text-dark-400 mt-1">
                          Minimum 8 characters with uppercase, lowercase, and a
                          number
                        </p>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-semibold text-dark-700 
                                         dark:text-dark-300 mb-2"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-dark-100 dark:border-dark-700">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <LoadingSpinner size="sm" /> Updating...
                            </span>
                          ) : (
                            "Update Password"
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
                      Appearance & Preferences
                    </h2>

                    <div className="space-y-1 divide-y divide-dark-100 dark:divide-dark-700">
                      <Toggle
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        label="Dark Mode"
                        description="Switch between light and dark theme"
                      />
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">
                        Theme Preview
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            if (darkMode) toggleDarkMode();
                          }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            !darkMode
                              ? "border-primary-500 ring-2 ring-primary-500/20"
                              : "border-dark-200 dark:border-dark-600"
                          }`}
                        >
                          <div
                            className="h-20 rounded-lg bg-white border border-dark-200 mb-2 
                                          flex items-center justify-center"
                          >
                            <div className="space-y-1">
                              <div className="h-2 w-12 bg-dark-200 rounded" />
                              <div className="h-2 w-8 bg-dark-200 rounded" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-dark-900 dark:text-white">
                            Light
                          </p>
                        </button>
                        <button
                          onClick={() => {
                            if (!darkMode) toggleDarkMode();
                          }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            darkMode
                              ? "border-primary-500 ring-2 ring-primary-500/20"
                              : "border-dark-200 dark:border-dark-600"
                          }`}
                        >
                          <div
                            className="h-20 rounded-lg bg-dark-800 border border-dark-600 mb-2 
                                          flex items-center justify-center"
                          >
                            <div className="space-y-1">
                              <div className="h-2 w-12 bg-dark-600 rounded" />
                              <div className="h-2 w-8 bg-dark-600 rounded" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-dark-900 dark:text-white">
                            Dark
                          </p>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                      Notification Settings
                    </h2>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
                      Choose what you want to be notified about.
                    </p>

                    <form onSubmit={handlePreferencesSubmit}>
                      <div className="space-y-1 divide-y divide-dark-100 dark:divide-dark-700">
                        <Toggle
                          checked={preferences.newsletter}
                          onChange={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              newsletter: !prev.newsletter,
                            }))
                          }
                          label="Newsletter"
                          description="Receive weekly curated articles in your inbox"
                        />
                        <Toggle
                          checked={preferences.notifications}
                          onChange={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              notifications: !prev.notifications,
                            }))
                          }
                          label="Push Notifications"
                          description="Get notified about comments, likes, and followers"
                        />
                      </div>

                      <div className="flex justify-end pt-6 mt-6 border-t border-dark-100 dark:border-dark-700">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <LoadingSpinner size="sm" /> Saving...
                            </span>
                          ) : (
                            "Save Preferences"
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Danger Zone */}
                    <div className="mt-10 pt-8 border-t border-dark-200 dark:border-dark-700">
                      <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                        Once you delete your account, there's no going back.
                      </p>
                      <button className="btn-danger py-2 px-5 text-sm">
                        Delete Account
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
