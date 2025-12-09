/**
 * Simple Blog API Polling Script
 * Fetches blog data every 5 minutes and logs to console
 */

const API_URL = 'https://maath-mphepo.onrender.com/api/blog/';
const INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function fetchBlogData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(`[${new Date().toISOString()}] Blog Data:`, data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error instanceof Error ? error.message : String(error));
  }
}

// Fetch immediately on start
fetchBlogData();

// Then fetch every 5 minutes
setInterval(fetchBlogData, INTERVAL);

console.log('Blog polling started - fetching every 5 minutes');
