/**
 * Backend Proxy for dealing with CORS issues
 * 
 * This file demonstrates how the Google Apps Script backend should be modified
 * to support JSONP calls from the frontend.
 */

/**
 * doGet handler function for the Apps Script
 */
function doGet(e) {
  // Get the parameters
  var action = e.parameter.action;
  var callback = e.parameter.callback;
  var token = e.parameter.token;
  var data = e.parameter.data ? JSON.parse(e.parameter.data) : null;
  
  // Prepare response object
  var responseObj;
  
  // Process based on action
  switch(action) {
    case 'signup':
      responseObj = handleSignup(data);
      break;
    case 'login':
      responseObj = handleLogin(data);
      break;
    case 'testerLogin':
      responseObj = handleTesterLogin();
      break;
    case 'getUserProfile':
      responseObj = getUserProfile(token || (data && data.token));
      break;
    case 'updateProfile':
      responseObj = updateUserProfile(data);
      break;
    case 'updatePreferences':
      responseObj = updateUserPreferences(data);
      break;
    case 'getDestinations':
      responseObj = getDestinations();
      break;
    case 'getTravelers':
      responseObj = getTravelers(data.destinationId);
      break;
    case 'connectTraveler':
      responseObj = connectWithTraveler(data.travelerId, token || data.token);
      break;
    case 'getConnections':
      responseObj = getConnections(token || data.token);
      break;
    case 'getInvites':
      responseObj = getInvites(token || data.token);
      break;
    case 'respondToInvite':
      responseObj = respondToInvite(data.inviteId, data.accept, token || data.token);
      break;
    case 'sendMessage':
      responseObj = sendMessage(data.channelId, data.message, token || data.token);
      break;
    case 'getChannelMessages':
      responseObj = getChannelMessages(data.channelId, token || data.token);
      break;
    default:
      responseObj = { success: false, message: 'Unknown action: ' + action };
  }
  
  // If a callback is provided, wrap the response in the callback function (JSONP)
  if (callback) {
    // JSONP response
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(responseObj) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Regular JSON response
    return ContentService.createTextOutput(JSON.stringify(responseObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doPost handler function for the Apps Script
 * This will simply call doGet to support both GET and POST methods
 */
function doPost(e) {
  return doGet(e);
}

/*
 * IMPORTANT INSTRUCTIONS FOR THE BACKEND DEVELOPER:
 * 
 * 1. Modify your Google Apps Script to include the JSONP handling code shown above
 * 2. Make sure to process both direct JSON requests and JSONP callbacks
 * 3. When processing data from the URL parameters, make sure to parse JSON strings
 * 4. Set appropriate MIME types for the responses
 * 5. Test the API with both direct calls and JSONP calls
 */