import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiCheck,
  HiXMark,
} from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/common/SEO";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordFocus, setPasswordFocus] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    return "Strong";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (passwordStrength < 4)
      newErrors.password = "Password doesn't meet requirements";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

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
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    }
  };

  const InputError = ({ message }) =>
    message ? (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {message}
      </motion.p>
    ) : null;

  return (
    <>
      <SEO title="Sign Up" description="Create your free BlogSpace account" />

      <div className="min-h-screen flex">
        {/* Left - Form */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-16 
                        bg-white dark:bg-dark-950"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
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
                Create your account
              </h2>
              <p className="text-dark-500 dark:text-dark-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 dark:text-primary-400 font-semibold 
                             hover:text-primary-700 transition-colors"
                >
                  Sign in →
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`input-field pl-12 ${errors.name ? "border-red-500" : ""}`}
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                <InputError message={errors.name} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`input-field pl-12 ${errors.email ? "border-red-500" : ""}`}
                    autoComplete="email"
                  />
                </div>
                <InputError message={errors.email} />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    placeholder="Minimum 8 characters"
                    className={`input-field pl-12 pr-12 ${errors.password ? "border-red-500" : ""}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 
                               hover:text-dark-600 dark:hover:text-dark-300"
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    {/* Strength bar */}
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength
                              ? getStrengthColor()
                              : "bg-dark-200 dark:bg-dark-700"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-dark-500">
                        {getStrengthLabel()}
                      </span>
                    </div>

                    {/* Checklist */}
                    {(passwordFocus || errors.password) && (
                      <div className="space-y-1">
                        {[
                          {
                            check: passwordChecks.length,
                            label: "At least 8 characters",
                          },
                          {
                            check: passwordChecks.uppercase,
                            label: "One uppercase letter",
                          },
                          {
                            check: passwordChecks.lowercase,
                            label: "One lowercase letter",
                          },
                          { check: passwordChecks.number, label: "One number" },
                        ].map(({ check, label }) => (
                          <div
                            key={label}
                            className={`flex items-center gap-2 text-xs ${
                              check
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-dark-400 dark:text-dark-500"
                            }`}
                          >
                            {check ? (
                              <HiCheck className="w-3.5 h-3.5" />
                            ) : (
                              <HiXMark className="w-3.5 h-3.5" />
                            )}
                            {label}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`input-field pl-12 pr-12 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    } ${
                      formData.confirmPassword &&
                      formData.password === formData.confirmPassword
                        ? "border-emerald-500 focus:border-emerald-500"
                        : ""
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 
                               hover:text-dark-600 dark:hover:text-dark-300"
                  >
                    {showConfirm ? (
                      <HiOutlineEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <HiCheck className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    )}
                </div>
                <InputError message={errors.confirmPassword} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="sm" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-dark-400 dark:text-dark-500 mt-6">
              By creating an account, you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Terms of Service
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

        {/* Right - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-900" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />

          <div className="absolute top-40 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />

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
                Start your
                <br />
                <span className="text-accent-300">creative journey</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed max-w-md mb-10">
                Join a thriving community of writers, thinkers, and creators.
                Your voice matters here.
              </p>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { emoji: "✍️", text: "Write & publish your stories" },
                  { emoji: "🌍", text: "Reach a global audience" },
                  { emoji: "💬", text: "Engage in meaningful discussions" },
                  { emoji: "📈", text: "Track your growth with analytics" },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <span className="text-xl">{feature.emoji}</span>
                    <span className="text-white/80">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
