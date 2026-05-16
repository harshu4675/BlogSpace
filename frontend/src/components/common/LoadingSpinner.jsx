import { motion } from "framer-motion";

const LoadingSpinner = ({
  size = "md",
  className = "",
  fullScreen = false,
}) => {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-dark-200 dark:border-dark-600 
                    border-t-primary-500 rounded-full animate-spin`}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center 
                   bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-12 h-12 border-4 border-dark-200 dark:border-dark-600 
                        border-t-primary-500 rounded-full animate-spin`}
          />
          <p className="text-dark-500 dark:text-dark-400 font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </motion.div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
