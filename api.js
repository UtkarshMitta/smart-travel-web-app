/**
 * API Service for communicating with the backend
 */
const API = {
    BASE_URL: 'https://script.google.com/macros/s/AKfycbzFXCo8N4pnmRbF4Kp1pbgGr_y5av4UAFfIietDhP8OAKbVJ48hIdD3vBxR0o10XUnIUQ/exec',
    
    /**
     * Get API key from the backend
     * @param {string} keyName - The name of the API key to retrieve
     * @returns {Promise} - Promise that resolves with the API key
     */
    getApiKey: function(keyName) {
        return this.get('getApiKey', { keyName: keyName });
    },
    
    /**
     * Call Claude API via the backend
     * @param {object} requestData - Request data to send to Claude API
     * @returns {Promise} - Promise that resolves with the API response
     */
    callClaudeApi: function(requestData) {
        return this.post('callClaudeApi', requestData);
    },
    
    /**
     * Send an image to Claude API for location identification
     * @param {string} imageData - Base64 encoded image data
     * @param {string} description - User's description of the image
     * @returns {Promise} - Promise that resolves with the API response
     */
    identifyLocationFromImage: function(imageData, description) {
        return this.post('identifyLocation', { 
            imageData: imageData,
            description: description 
        });
    },
    
    /**
     * Make a GET request to the API
     * @param {string} action - The API action to call
     * @param {object} params - Additional parameters
     * @returns {Promise} - Promise that resolves with the API response
     */
    get: async function(action, params = {}) {
        try {
            const queryParams = new URLSearchParams({ action, ...params });
            const response = await fetch(`${this.BASE_URL}?${queryParams.toString()}`);
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            return { success: false, message: 'Network error: ' + error.message };
        }
    },
    
    /**
     * Make a JSONP request to simulate POST (to avoid CORS issues)
     * @param {string} action - The API action to call
     * @param {object} data - The data to send
     * @returns {Promise} - Promise that resolves with the API response
     */
    post: function(action, data = {}) {
        return new Promise((resolve, reject) => {
            // Create a unique callback name
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            
            // Create the script element
            const script = document.createElement('script');
            
            // Setup the callback function
            window[callbackName] = function(response) {
                // Clean up: remove the script and delete the callback
                document.body.removeChild(script);
                delete window[callbackName];
                resolve(response);
            };
            
            // Setup timeout to handle cases where the API doesn't respond
            const timeoutId = setTimeout(function() {
                // Clean up
                if (script.parentNode) document.body.removeChild(script);
                delete window[callbackName];
                
                // For image recognition, provide a fallback response
                if (action === 'identifyLocation') {
                    console.warn('Image recognition API timed out, providing fallback response');
                    resolve({
                        success: false,
                        message: 'API request timed out. The server may be unavailable.'
                    });
                } else {
                    reject(new Error('JSONP request timed out'));
                }
            }, 10000); // 10 second timeout
            
            // Encode the data as a JSON string
            const encodedData = encodeURIComponent(JSON.stringify(data));
            
            // Build the URL with the action, callback, and data parameters
            script.src = `${this.BASE_URL}?action=${action}&callback=${callbackName}&data=${encodedData}`;
            
            // Add error handling
            script.onerror = function() {
                clearTimeout(timeoutId);
                if (script.parentNode) document.body.removeChild(script);
                delete window[callbackName];
                reject(new Error('JSONP request failed'));
            };
            
            // Add the script to the page to start the request
            document.body.appendChild(script);
        });
    },
    
    // ===== User Authentication =====
    
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise} - Promise that resolves with the API response
     */
    signup: function(userData) {
        return this.post('signup', userData);
    },
    
    /**
     * Log in a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Promise that resolves with the API response
     */
    login: function(email, password) {
        return this.post('login', { email, password });
    },
    
    /**
     * Login for testers (no password required)
     * @param {string} email - Optional email
     * @returns {Promise} - Promise that resolves with the API response
     */
    testerLogin: function(email = null) {
        const params = email ? { email } : {};
        return this.post('testerLogin', params);
    },
    
    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getUserById: function(userId) {
        return this.get('getUser', { userId });
    },
    
    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {object} userData - Updated user data
     * @returns {Promise} - Promise that resolves with the API response
     */
    updateUser: function(userId, userData) {
        return this.post('updateUser', { userId, ...userData });
    },
    
    // ===== Trips =====
    
    /**
     * Create a new trip
     * @param {object} tripData - Trip data
     * @returns {Promise} - Promise that resolves with the API response
     */
    createTrip: function(tripData) {
        return this.post('createTrip', tripData);
    },
    
    /**
     * Get trips by user
     * @param {string} userId - User ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getUserTrips: function(userId) {
        return this.get('getUserTrips', { userId });
    },
    
    /**
     * Get trips by destination
     * @param {string} destination - Destination name
     * @returns {Promise} - Promise that resolves with the API response
     */
    getTripsByDestination: function(destination) {
        return this.get('getTripsByDestination', { destination });
    },
    
    // ===== Connections =====
    
    /**
     * Create a new connection between users
     * @param {object} connectionData - Connection data
     * @returns {Promise} - Promise that resolves with the API response
     */
    createConnection: function(connectionData) {
        return this.post('createConnection', connectionData);
    },
    
    /**
     * Get user connections
     * @param {string} userId - User ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getUserConnections: function(userId) {
        return this.get('getUserConnections', { userId });
    },
    
    // ===== Invites =====
    
    /**
     * Create a new invite
     * @param {object} inviteData - Invite data
     * @returns {Promise} - Promise that resolves with the API response
     */
    createInvite: function(inviteData) {
        return this.post('createInvite', inviteData);
    },
    
    /**
     * Get user invites
     * @param {string} userId - User ID
     * @param {string} type - Invite type ('sent', 'received', or 'all')
     * @returns {Promise} - Promise that resolves with the API response
     */
    getUserInvites: function(userId, type = 'all') {
        return this.get('getUserInvites', { userId, type });
    },
    
    /**
     * Respond to an invite
     * @param {string} inviteId - Invite ID
     * @param {string} response - Response ('accept' or 'decline')
     * @returns {Promise} - Promise that resolves with the API response
     */
    respondToInvite: function(inviteId, response) {
        return this.post('respondToInvite', { inviteId, response });
    },
    
    // ===== Destinations =====
    
    /**
     * Get all destinations
     * @returns {Promise} - Promise that resolves with the API response
     */
    getAllDestinations: function() {
        return this.get('getAllDestinations');
    },
    
    /**
     * Get trending destinations
     * @param {number} limit - Maximum number of destinations to return
     * @returns {Promise} - Promise that resolves with the API response
     */
    getTrendingDestinations: function(limit = 5) {
        return this.get('getTrendingDestinations', { limit });
    },
    
    /**
     * Get featured destinations
     * @param {number} limit - Maximum number of destinations to return
     * @returns {Promise} - Promise that resolves with the API response
     */
    getFeaturedDestinations: function(limit = 3) {
        return this.get('getFeaturedDestinations', { limit });
    },
    
    /**
     * Search destinations
     * @param {string} query - Search query
     * @returns {Promise} - Promise that resolves with the API response
     */
    searchDestinations: function(query) {
        return this.get('searchDestinations', { query });
    },
    
    // ===== Messages =====
    
    /**
     * Send a message
     * @param {object} messageData - Message data
     * @returns {Promise} - Promise that resolves with the API response
     */
    sendMessage: function(messageData) {
        return this.post('sendMessage', messageData);
    },
    
    /**
     * Get channel messages
     * @param {string} channelId - Channel ID
     * @param {number} limit - Maximum number of messages to return
     * @returns {Promise} - Promise that resolves with the API response
     */
    getChannelMessages: function(channelId, limit = 50) {
        return this.get('getChannelMessages', { channelId, limit });
    },
    
    /**
     * Get direct messages between two users
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @param {number} limit - Maximum number of messages to return
     * @returns {Promise} - Promise that resolves with the API response
     */
    getDirectMessages: function(userId1, userId2, limit = 50) {
        return this.get('getDirectMessages', { userId1, userId2, limit });
    },
    
    // ===== Channels =====
    
    /**
     * Get all channels
     * @returns {Promise} - Promise that resolves with the API response
     */
    getAllChannels: function() {
        return this.get('getAllChannels');
    }
};

/**
 * Session management
 */
const Session = {
    /**
     * Set user data in session
     * @param {object} userData - User data to store
     */
    setUser: function(userData) {
        localStorage.setItem('clusterUser', JSON.stringify(userData));
    },
    
    /**
     * Get user data from session
     * @returns {object|null} - User data or null if not logged in
     */
    getUser: function() {
        const userData = localStorage.getItem('clusterUser');
        return userData ? JSON.parse(userData) : null;
    },
    
    /**
     * Check if user is logged in
     * @returns {boolean} - True if logged in, false otherwise
     */
    isLoggedIn: function() {
        return !!this.getUser();
    },
    
    /**
     * Log out user
     */
    logout: function() {
        localStorage.removeItem('clusterUser');
        window.location.href = 'login.html';
    }
};
