import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the provided value that only updates
 * after the specified delay has elapsed without further changes.
 */
export const useDebouncedValue = <T>(value: T, delay = 750) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
