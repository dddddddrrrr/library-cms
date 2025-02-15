import { useState, useEffect } from "react";

export function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);

  useEffect(() => {
    console.log("useDebounce value changed:", value);
    const timer = setTimeout(() => {
      console.log("Setting debounced value:", value);
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
