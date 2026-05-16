import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineEnvelope, HiArrowLeft, HiCheckCircle } from "react-icons/hi2";
import api from "../utils/api";
import SEO from "../components/common/SEO";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Forgot Password" />

      <div className="min-h-screen flex items-center justify-center p-6 gradient-bg-subtle">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 sm:p-10">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 
                         hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 
                                flex items-center justify-center"
                >
                  <HiCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
                  Check your email
                </h2>
                <p className="text-dark-500 dark:text-dark-400 mb-6">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-dark-700 dark:text-dark-200">
                    {email}
                  </span>
                </p>
                <p className="text-sm text-dark-400 dark:text-dark-500 mb-4">
                  Didn't receive the email? Check your spam folder or
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  try again
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
                    Reset your password
                  </h2>
                  <p className="text-dark-500 dark:text-dark-400">
                    Enter your email and we'll send you a link to reset your
                    password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field pl-12"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <LoadingSpinner size="sm" />
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link →"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
