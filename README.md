# Smart Travel Web App

A web application for travelers to connect with each other and plan their trips together.

## CORS Issues Solution

This application uses a Google Apps Script backend that has CORS (Cross-Origin Resource Sharing) restrictions when accessed from different domains (like GitHub Pages). To overcome this, we've implemented a JSONP approach:

### What is JSONP?

JSONP (JSON with Padding) is a technique for bypassing the Same-Origin Policy by using script tags to make cross-domain requests. Since `<script>` tags can load content from any domain, we use this to our advantage.

### Implementation Details

1. **Frontend Changes**:
   - Modified API calls to use the JSONP approach instead of fetch
   - Created callback functions to handle responses
   - Added support for passing credentials via URL parameters

2. **Backend Changes**:
   - The backend needs to support JSONP callbacks
   - The backend-proxy.js file shows the needed changes to the Apps Script
   - If implementing yourself, make sure your backend can handle both JSON and JSONP responses

### How to Use

#### For Users
Simply use the application normally - the JSONP communication happens behind the scenes.

#### For Developers
If you're making changes to the API communication:

1. Use the `apiCall` function in index.html for all backend communication
2. Make sure new endpoints added to the backend also support JSONP
3. Be aware of URL length limitations when passing large data objects

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

## Security Note

The JSONP approach has some inherent security limitations:
- Sensitive data in URLs might be logged by servers
- Callback injection attacks are possible if callbacks aren't validated
- Only GET requests are possible (though we simulate POST through query parameters)

For a production application, proper CORS support on the backend is recommended.