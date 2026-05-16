import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/common/SEO";

const NotFound = () => {
  return (
    <>
      <SEO title="404 - Page Not Found" />
      <div className="min-h-screen flex items-center justify-center px-6 gradient-bg-subtle">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-8xl sm:text-9xl font-black gradient-text mb-4">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white mb-4">
            Page not found
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
            <Link to="/blog" className="btn-secondary">
              Browse Posts
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
