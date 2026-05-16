import { useState, useEffect, useCallback, useRef } from "react";

const useInfiniteScroll = (fetchFn, options = {}) => {
  const { threshold = 300, enabled = true } = options;
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const isFetching = useRef(false);

  const fetchData = useCallback(
    async (pageNum, reset = false) => {
      if (isFetching.current || (!hasMore && !reset)) return;
      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn(pageNum);
        const newItems = result.data || [];

        setData((prev) => (reset ? newItems : [...prev, ...newItems]));
        setHasMore(result.hasMore ?? newItems.length > 0);
        setPage(pageNum);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        isFetching.current = false;
      }
    },
    [fetchFn, hasMore],
  );

  // Initial load
  useEffect(() => {
    fetchData(1, true);
  }, []);

  // Scroll handler
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - threshold
      ) {
        if (hasMore && !loading) {
          fetchData(page + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, hasMore, loading, page, threshold, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
    isFetching.current = false;
    fetchData(1, true);
  }, [fetchData]);

  return { data, loading, hasMore, error, initialLoad, reset, page };
};

export default useInfiniteScroll;
