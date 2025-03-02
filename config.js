/**
 * Configuration file for the Smart Travel Web App
 * Set your API keys and other configuration here
 */

// THIS FILE SHOULD NOT BE COMMITTED WITH REAL API KEYS
// In production, load these values from environment variables or a secure backend

// Configuration object
const CONFIG = {
    // API keys - REPLACE WITH YOUR OWN KEYS
    CLAUDE_API_KEY: 'YOUR_CLAUDE_API_KEY_HERE', // Put your API key here for local development only
    
    // API endpoints
    BASE_API_URL: 'https://script.google.com/macros/s/AKfycbzy-16q66fpIfhYci9L8j0iHh53HNoc9_yU5K4BJzlRfeg2hCxKrC35pWQnK7YaBVnXgA/exec',
    
    // Feature flags
    ENABLE_SMART_SEARCH: true,
    ENABLE_ANALYTICS: false
};

// Make config available to the window object
window.APP_CONFIG = CONFIG;

// You can also securely load the API key from localStorage if previously set by a secure backend
// This is just a fallback - not recommended for production
if (!CONFIG.CLAUDE_API_KEY || CONFIG.CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY_HERE') {
    CONFIG.CLAUDE_API_KEY = localStorage.getItem('CLAUDE_API_KEY') || '';
}