const Skeleton = ({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
}) => {
  const variants = {
    text: "h-4 rounded",
    title: "h-6 rounded",
    avatar: "rounded-full",
    image: "rounded-xl",
    card: "rounded-2xl",
    button: "h-10 rounded-xl",
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton ${variants[variant]} ${className}`}
      style={{
        width: width || (variant === "avatar" ? "40px" : "100%"),
        height:
          height ||
          (variant === "avatar"
            ? "40px"
            : variant === "image"
              ? "200px"
              : undefined),
      }}
    />
  ));

  return count === 1 ? (
    elements[0]
  ) : (
    <div className="space-y-3">{elements}</div>
  );
};

// Pre-made card skeleton
export const PostCardSkeleton = () => (
  <div className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-dark-100 dark:border-dark-700">
    <Skeleton variant="image" height="200px" />
    <div className="p-5 space-y-3">
      <Skeleton width="80px" height="24px" className="rounded-full" />
      <Skeleton variant="title" />
      <Skeleton variant="text" count={2} />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton variant="avatar" width="32px" height="32px" />
        <div className="space-y-1.5 flex-1">
          <Skeleton width="100px" height="14px" />
          <Skeleton width="60px" height="12px" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
