const PostCardSkeleton = ({ variant = "default", count = 6 }) => {
  const cards = Array.from({ length: count });

  if (variant === "horizontal") {
    return cards.map((_, i) => (
      <div key={i} className="flex gap-3 sm:gap-4 animate-pulse">
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-dark-200 dark:bg-dark-700 flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-16 bg-dark-200 dark:bg-dark-700 rounded" />
          <div className="h-4 w-full bg-dark-200 dark:bg-dark-700 rounded" />
          <div className="h-3 w-24 bg-dark-200 dark:bg-dark-700 rounded" />
        </div>
      </div>
    ));
  }

  return cards.map((_, i) => (
    <div
      key={i}
      className="bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl overflow-hidden 
                            border border-dark-100 dark:border-dark-700 animate-pulse"
    >
      <div className="aspect-[4/3] bg-dark-200 dark:bg-dark-700" />
      <div className="p-2.5 sm:p-4 space-y-2">
        <div className="h-3 w-16 bg-dark-200 dark:bg-dark-700 rounded-full" />
        <div className="h-3 sm:h-4 w-full bg-dark-200 dark:bg-dark-700 rounded" />
        <div className="h-3 w-3/4 bg-dark-200 dark:bg-dark-700 rounded hidden sm:block" />
        <div className="flex items-center gap-2 pt-1">
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-dark-200 dark:bg-dark-700" />
          <div className="h-2.5 w-14 bg-dark-200 dark:bg-dark-700 rounded hidden sm:block" />
        </div>
      </div>
    </div>
  ));
};

export default PostCardSkeleton;
