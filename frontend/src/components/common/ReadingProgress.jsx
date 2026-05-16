import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const { pathname } = useLocation();

  const isBlogPost =
    pathname.startsWith("/blog/") && pathname.split("/").length > 2;

  useEffect(() => {
    if (!isBlogPost) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [isBlogPost]);

  if (!isBlogPost || progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all 
                   duration-100 ease-out shadow-sm shadow-primary-500/30"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
