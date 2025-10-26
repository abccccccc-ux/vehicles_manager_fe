import { useRef, useEffect, useCallback } from 'react';

const useRebounce = (fn, delay = 300) => {
  const timerRef = useRef(null);
  const savedFn = useRef(fn);

  // keep latest callback
  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debounced = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        savedFn.current?.(...args);
      } finally {
        timerRef.current = null;
      }
    }, delay);
  }, [delay]);

  return debounced;
};

export default useRebounce;
