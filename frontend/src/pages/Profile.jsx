import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCalendar,
  HiOutlineLink,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineUserPlus,
  HiOutlineUserMinus,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import PostCard from "../components/blog/PostCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import SEO from "../components/common/SEO";
import { formatDate, formatNumber } from "../utils/helpers";
import toast from "react-hot-toast";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfileUser(data.data.user);
        setPosts(data.data.posts);
        setFollowersCount(data.data.user.followers?.length || 0);
        setIsFollowing(
          currentUser && data.data.user.followers?.includes(currentUser._id),
        );
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) return toast.error("Please login first");
    setIsFollowing(!isFollowing);
    setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    toast.success(isFollowing ? "Unfollowed" : "Following!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState title="User not found" />
      </div>
    );
  }

  const socialLinks = profileUser.social || {};
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = posts.reduce((acc, p) => acc + (p.likesCount || 0), 0);

  return (
    <>
      <SEO
        title={profileUser.name}
        description={
          profileUser.bio || `${profileUser.name}'s profile on BlogSpace`
        }
      />

      <div className="min-h-screen bg-white dark:bg-dark-950">
        {/* Cover */}
        <div className="h-28 sm:h-44 lg:h-56 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        </div>

        {/* Profile Header */}
        <div className="container-custom">
          <div className="relative -mt-12 sm:-mt-16 mb-6">
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Avatar
                  src={profileUser.avatar?.url}
                  name={profileUser.name}
                  size="3xl"
                  className="border-4 border-white dark:border-dark-950 shadow-xl"
                />
              </motion.div>

              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-8">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-dark-900 dark:text-white">
                    {profileUser.name}
                  </h1>
                  {["admin", "superadmin", "author"].includes(
                    profileUser.role,
                  ) && (
                    <HiOutlineCheckBadge className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                  )}
                </div>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  @{profileUser.username}
                  {profileUser.role !== "user" && (
                    <span className="ml-2 badge-primary text-2xs capitalize">
                      {profileUser.role}
                    </span>
                  )}
                </p>

                {/* Mobile Actions */}
                <div className="mt-3 flex justify-center sm:justify-start gap-2">
                  {!isOwnProfile ? (
                    <button
                      onClick={handleFollow}
                      className={`${isFollowing ? "btn-secondary" : "btn-primary"} py-2 px-5 text-sm`}
                    >
                      {isFollowing ? (
                        <>
                          <HiOutlineUserMinus className="w-4 h-4" /> Following
                        </>
                      ) : (
                        <>
                          <HiOutlineUserPlus className="w-4 h-4" /> Follow
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/settings"
                      className="btn-secondary py-2 px-5 text-sm"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom pb-12">
          {/* Stats Row - Always visible */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 p-3 sm:p-4 bg-dark-50 dark:bg-dark-800 rounded-2xl">
            {[
              {
                icon: HiOutlineDocumentText,
                label: "Posts",
                value: posts.length,
              },
              { icon: HiOutlineEye, label: "Views", value: totalViews },
              { icon: HiOutlineHeart, label: "Likes", value: totalLikes },
              {
                icon: HiOutlineUserPlus,
                label: "Followers",
                value: followersCount,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-2 sm:p-3">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-dark-400 mx-auto mb-1" />
                <p className="text-base sm:text-lg font-bold text-dark-900 dark:text-white">
                  {formatNumber(value)}
                </p>
                <p className="text-[10px] sm:text-xs text-dark-400 uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Bio + Social */}
          {(profileUser.bio || socialLinks.website || socialLinks.twitter) && (
            <div className="mb-6 p-4 bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700">
              {profileUser.bio && (
                <p className="text-sm text-dark-600 dark:text-dark-300 leading-relaxed mb-3">
                  {profileUser.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-dark-500">
                <span className="flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4" />
                  Joined {formatDate(profileUser.createdAt)}
                </span>
                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <HiOutlineLink className="w-4 h-4" />
                    {socialLinks.website
                      .replace(/^https?:\/\//, "")
                      .slice(0, 25)}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Posts */}
          <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-4">
            Posts ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <EmptyState
              icon={HiOutlineDocumentText}
              title="No posts yet"
              description={
                isOwnProfile
                  ? "You haven't published any posts yet."
                  : `${profileUser.name} hasn't published yet.`
              }
              action={
                isOwnProfile
                  ? () => (window.location.href = "/admin/posts/create")
                  : undefined
              }
              actionText="Write Your First Post"
            />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {posts.map((post, i) => (
                <PostCard key={post._id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
