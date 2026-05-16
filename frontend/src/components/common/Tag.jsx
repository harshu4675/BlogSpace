import { Link } from "react-router-dom";

const Tag = ({
  name,
  href,
  size = "sm",
  removable = false,
  onRemove,
  active = false,
}) => {
  const sizes = {
    xs: "px-2 py-0.5 text-2xs",
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-1.5 text-sm",
  };

  const baseClass = `inline-flex items-center gap-1.5 rounded-lg font-medium transition-all 
                     ${sizes[size]} ${
                       active
                         ? "bg-primary-600 text-white"
                         : "bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700"
                     }`;

  const content = (
    <>
      <span>#</span>
      {name}
      {removable && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.(name);
          }}
          className="ml-0.5 hover:text-red-500 transition-colors"
        >
          ×
        </button>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return <span className={baseClass}>{content}</span>;
};

export default Tag;
