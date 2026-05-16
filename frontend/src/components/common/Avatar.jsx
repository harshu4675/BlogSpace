const Avatar = ({
  src,
  name,
  size = "md",
  className = "",
  onClick,
  ring = false,
}) => {
  const sizes = {
    xs: "w-6 h-6 text-[8px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl",
    "3xl": "w-24 h-24 text-2xl",
  };

  const ringStyles = ring
    ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-dark-900"
    : "";

  const getInitials = (n) => {
    if (!n) return "?";
    return n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Always show fallback-safe component
  return (
    <div
      onClick={onClick}
      className={`${sizes[size]} rounded-full flex-shrink-0 overflow-hidden
                  ${ringStyles} ${onClick ? "cursor-pointer hover:opacity-80" : ""}
                  transition-all duration-200 ${className}`}
      style={{ minWidth: "auto" }}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // On error, replace with initials
            e.target.style.display = "none";
            e.target.parentElement.classList.add(
              "bg-gradient-to-br",
              "from-primary-500",
              "to-accent-500",
              "flex",
              "items-center",
              "justify-center",
            );
            const span = document.createElement("span");
            span.className = "text-white font-bold";
            span.textContent = getInitials(name);
            e.target.parentElement.appendChild(span);
          }}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <span className="text-white font-bold">{getInitials(name)}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
