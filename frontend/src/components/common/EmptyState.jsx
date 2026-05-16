import { motion } from "framer-motion";
import { HiOutlineDocumentText } from "react-icons/hi2";

const EmptyState = ({
  icon: Icon = HiOutlineDocumentText,
  title = "Nothing here yet",
  description = "Check back later or try a different filter.",
  action,
  actionText = "Get Started",
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-dark-400 dark:text-dark-500" />
      </div>
      <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">
        {title}
      </h3>
      <p className="text-dark-500 dark:text-dark-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button onClick={action} className="btn-primary">
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
