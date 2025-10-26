import { useEffect, useState } from 'react';

// useDebounce: returns a debounced value that updates after delay ms
// input: value (any), delay: milliseconds (default 300)
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
