'use client';

import { useEffect } from 'react';

export function useBlogPolling() {
  useEffect(() => {
    const API_URL = 'https://maath-mphepo.onrender.com/api/blog/';
    const INTERVAL = 5 * 60 * 1000; // 5 minutes

    async function fetchBlogData() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log(`[${new Date().toISOString()}] Blog Data:`, data);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Fetch immediately
    fetchBlogData();

    // Then fetch every 5 minutes
    const interval = setInterval(fetchBlogData, INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);
}
