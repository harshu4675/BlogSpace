import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/common/SEO";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      <SEO title="Login" description="Log in to your BlogSpace account" />

      <div className="min-h-screen flex">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />

          {/* Floating shapes */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-center p-16 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/" className="inline-flex items-center gap-3 mb-12">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl font-black">B</span>
                </div>
                <span className="text-2xl font-bold">BlogSpace</span>
              </Link>

              <h1 className="text-5xl font-extrabold leading-tight mb-6">
                Welcome back to
                <br />
                <span className="text-accent-300">your creative space</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed max-w-md">
                Continue your journey. Read, write, and connect with thousands
                of creators worldwide.
              </p>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                {[
                  { label: "Active Users", value: "50K+" },
                  { label: "Articles", value: "100K+" },
                  { label: "Categories", value: "25+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-white/50 text-sm mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-16 
                        bg-white dark:bg-dark-950"
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <span className="text-xl font-black text-white">B</span>
                </div>
                <span className="text-xl font-bold text-dark-900 dark:text-white">
                  BlogSpace
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-dark-900 dark:text-white mb-2">
                Sign in
              </h2>
              <p className="text-dark-500 dark:text-dark-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary-600 dark:text-primary-400 font-semibold 
                             hover:text-primary-700 transition-colors"
                >
                  Create one free →
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineEnvelope
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
                                                 text-dark-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`input-field pl-12 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                        : ""
                    }`}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 dark:text-primary-400 
                               hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <HiOutlineLockClosed
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
                                                   text-dark-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-field pl-12 pr-12 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                        : ""
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 
                               hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="sm" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-200 dark:border-dark-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-dark-950 text-dark-400">
                  New to BlogSpace?
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="btn-secondary w-full justify-center py-4 text-base"
            >
              Create your account — it's free
            </Link>

            <p className="text-center text-xs text-dark-400 dark:text-dark-500 mt-6">
              By signing in, you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
