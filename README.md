# Smart Travel Web App

A web application for travelers to connect with each other and plan their trips together.

## CORS Issues Solution

This application uses a Google Apps Script backend that has CORS (Cross-Origin Resource Sharing) restrictions when accessed from different domains (like GitHub Pages). To overcome this, we've implemented a JSONP approach:

### What is JSONP?

JSONP (JSON with Padding) is a technique for bypassing the Same-Origin Policy by using script tags to make cross-domain requests. Since `<script>` tags can load content from any domain, we use this to our advantage.

### Implementation Details

1. **Frontend Changes**:
   - Modified API calls to use the JSONP approach instead of fetch
   - Created dynamic callback functions to handle responses
   - Added support for passing credentials and data via URL parameters

2. **Backend Changes**:
   - Modified backend.js to support JSONP callbacks 
   - Added capability to handle data parameters for simulating POST requests
   - Ensured responses are returned with the appropriate MIME type

### Integration Approach

The approach we used to integrate the frontend with the backend:

1. **JSONP Communication Pattern**:
   - Frontend creates a unique callback function for each request
   - Data is URL-encoded and passed as a parameter
   - Request is made by dynamically adding a script tag to the page
   - Backend wraps the response in the callback function
   - The callback function receives the data and resolves a Promise

2. **Auth Token Handling**:
   - Authentication tokens are passed as URL parameters
   - Token verification happens on the backend side

3. **Error Handling**:
   - Both backend and frontend have robust error handling
   - Backend returns errors with appropriate HTTP status codes
   - Frontend displays user-friendly error messages

### How to Use

#### For Users
The application works seamlessly with the JSONP implementation - users don't need to do anything special.

#### For Developers
If you're making changes to the API communication:

1. Use the `apiCall` function in index.html for all backend communication
2. Make sure new endpoints added to the backend also support JSONP
3. Be aware of URL length limitations when passing large data objects
4. For POST-like operations, data should be JSON-stringified and URL-encoded

## Backend API

The backend API is available at: `https://script.google.com/macros/s/AKfycbxUdsoSMawsnWvS7DNy9IeGEssK5SU2zAUMhUkz_N2aTU4fk3Q7R_S6kJqs9bQAW5DnfQ/exec`

### Available Endpoints

- `signup` - Register a new user
- `login` - Authenticate a user
- `testerLogin` - Special login for testers
- `getUserProfile` - Get the current user's profile
- `updateProfile` - Update user profile information
- `updatePreferences` - Update user travel preferences
- `getDestinations` - Get list of travel destinations
- `getTravelers` - Get travelers for a specific destination
- `connectTraveler` - Connect with another traveler
- `getConnections` - Get user's connections
- `getInvites` - Get received and sent invites
- `respondToInvite` - Accept or decline an invite
- `sendMessage` - Send a message in a channel
- `getChannelMessages` - Get messages from a channel

### JSONP Format

All endpoints support the JSONP format with the following parameters:

- `callback` - The JavaScript function name to wrap the response in
- `data` - URL-encoded JSON string containing request data
- `token` - Authentication token (if applicable)
- `action` - The API endpoint to call

Example URL format:
```
https://script.google.com/macros/s/.../exec?action=login&callback=jsonp_12345&data=%7B%22email%22%3A%22user%40example.com%22%2C%22password%22%3A%22p%22%7D
```

## Security Note

The JSONP approach has some inherent security limitations:
- Sensitive data in URLs might be logged by servers
- Callback injection attacks are possible if callbacks aren't validated
- Only GET requests are possible (though we simulate POST through query parameters)
- Password and other sensitive data should be handled with extreme care

For a production application, proper CORS support on the backend is recommended.