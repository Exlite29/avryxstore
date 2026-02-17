import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for skeleton loading with a configurable delay
 * @param {boolean} isLoading - Whether data is currently loading
 * @param {number} delay - Delay in milliseconds before showing skeleton (default: 3000ms)
 * @returns {boolean} - Whether to show skeleton UI
 */
export function useSkeletonLoading(isLoading, delay = 3000) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Show skeleton after the delay
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Reset when loading completes
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);

  return showSkeleton;
}

/**
 * Higher-order function to wrap fetch functions with skeleton loading
 * @param {Function} fetchFn - The async fetch function
 * @param {Function} setState - State setter function
 * @param {number} delay - Delay in milliseconds (default: 3000ms)
 * @returns {Function} - Wrapped fetch function
 */
export function createSkeletonFetcher(fetchFn, setLoading, delay = 3000) {
  return async (...args) => {
    setLoading(true);
    
    // Create a promise that resolves after the delay OR when the fetch completes
    const delayPromise = new Promise(resolve => setTimeout(resolve, delay));
    const fetchPromise = fetchFn(...args);
    
    try {
      // Wait for whichever completes first
      const result = await Promise.race([fetchPromise, delayPromise]);
      
      // If fetch completed first, await the actual result
      if (fetchPromise !== result) {
        // Fetch is still pending, wait for it
        await fetchPromise;
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };
}

export default useSkeletonLoading;
