/* ===== CONFIGURATION ===== */
/*  https://script.google.com/macros/s/AKfycbzCuzX3RgjMuz6OsX1f3mEunxbuxK2xkwOMKdTDYJvVGfKNIcaLtXh-hN008SMn_wvgpQ/exec  */
const CONFIG = {
  SHEETS: {
    USERS: 'Users',
    TRIPS: 'Trips',
    CONNECTIONS: 'Connections',
    INVITES: 'Invites',
    DESTINATIONS: 'Destinations',
    MESSAGES: 'Messages',
    CHANNELS: 'Channels',
    INTERESTS: 'Interests',
    API_KEYS: 'api_keys'  // Sheet for storing API keys
  },
  EMAIL_SETTINGS: {
    SENDER_NAME: 'Cluster - Travel Platform',
    NO_REPLY_EMAIL: 'noreply@clustertravel.com'
  },
  DATETIME_FORMAT: {
    DATE: 'MMM dd, yyyy',
    TIME: 'hh:mm a'
  }
};

/* ===== DATABASE INITIALIZATION ===== */

/**
 * Initialize database (all sheets) if they don't exist
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Initialize Users sheet
  initializeUsersSheet(ss);
  
  // Initialize Trips sheet
  initializeTripsSheet(ss);
  
  // Initialize Connections sheet
  initializeConnectionsSheet(ss);
  
  // Initialize Invites sheet
  initializeInvitesSheet(ss);
  
  // Initialize Destinations sheet
  initializeDestinationsSheet(ss);
  
  // Initialize Messages sheet
  initializeMessagesSheet(ss);
  
  // Initialize Channels sheet
  initializeChannelsSheet(ss);
  
  // Initialize Interests sheet
  initializeInterestsSheet(ss);
  
  // Initialize API Keys sheet
  initializeApiKeysSheet(ss);
  
  return { success: true, message: 'Database initialized successfully' };
}

/**
 * Initialize Users sheet
 */
function initializeUsersSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.USERS);
    
    // Note: Renamed "Bio" to "UserBio" so that it doesn’t conflict with Password.
    const headers = [
      'UserID', 'Email', 'FirstName', 'LastName', 'Avatar', 'Password', 'Phone', 
      'UserBio', 'HomeLocation', 'CreatedAt', 'LastLogin', 'Verified', 'TravelStyle', 
      'Interests', 'Budget', 'Pace', 'Planning', 'AccommodationPrefs', 'PrivacySettings',
      'CountriesVisited', 'UpcomingTrips', 'ShareTravelDates', 'AllowConnectionRequests', 'ShowInSearch'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Trips sheet
 */
function initializeTripsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.TRIPS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.TRIPS);
    
    const headers = [
      'TripID', 'UserID', 'Destination', 'StartDate', 'EndDate', 'CreatedAt', 
      'TravelStyle', 'Description', 'Interests', 'Budget', 'Privacy', 'Status'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Connections sheet
 */
function initializeConnectionsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.CONNECTIONS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.CONNECTIONS);
    
    const headers = [
      'ConnectionID', 'UserID1', 'UserID2', 'Status', 'ConnectedSince', 
      'LastInteraction', 'SharedTrips'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Invites sheet
 */
function initializeInvitesSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.INVITES);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.INVITES);
    
    const headers = [
      'InviteID', 'SenderID', 'ReceiverID', 'TripID', 'Status', 'Message', 
      'SentAt', 'RespondedAt'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Destinations sheet
 */
function initializeDestinationsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.DESTINATIONS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.DESTINATIONS);
    
    const headers = [
      'DestinationID', 'Name', 'Country', 'Region', 'Description', 'ImageURL', 
      'TravellerCount', 'PopularDates', 'TrendingPercentage', 'FeaturedStatus', 'Icon'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Messages sheet
 */
function initializeMessagesSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.MESSAGES);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.MESSAGES);
    
    const headers = [
      'MessageID', 'SenderID', 'ReceiverID', 'ChannelID', 'Content', 'SentAt', 
      'ReadStatus', 'Type'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Channels sheet
 */
function initializeChannelsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.CHANNELS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.CHANNELS);
    
    const headers = [
      'ChannelID', 'Name', 'Description', 'Type', 'Region', 'Icon', 
      'MemberCount', 'CreatedAt', 'LastActivity'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize Interests sheet
 */
function initializeInterestsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.INTERESTS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.INTERESTS);
    
    const headers = [
      'InterestID', 'Name', 'Category', 'Icon'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize API Keys sheet
 */
function initializeApiKeysSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.API_KEYS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.API_KEYS);
    
    const headers = [
      'KeyName', 'ApiKey', 'Description', 'LastUpdated'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // Add a row for the Claude API key
    const timestamp = new Date().toISOString();
    const claudeKeyRow = [
      'CLAUDE_API_KEY', 
      'YOUR_CLAUDE_API_KEY_HERE', 
      'API key for Claude AI used in smart search', 
      timestamp
    ];
    
    sheet.appendRow(claudeKeyRow);
  }
  
  return sheet;
}

/* ===== DATA OPERATIONS ===== */

/**
 * Create a new user (signup function)
 * @param {object} userData - User data
 * @returns {object} - Result object
 */
function createUser(userData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
    
    // Generate a unique user ID
    const userId = 'U-' + new Date().getTime();
    
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Create user row – note that the 8th column is now “UserBio”
    const userRow = [
      userId,
      userData.email,
      userData.firstName,
      userData.lastName,
      userData.avatar || '',
      userData.password || '',  // In a real application, hash the password
      userData.phone || '',
      userData.bio || '',
      userData.homeLocation || '',
      timestamp,
      timestamp,
      userData.verified || false,
      JSON.stringify(userData.travelStyle || []),
      JSON.stringify(userData.interests || []),
      userData.budget || '3',
      userData.pace || '3',
      userData.planning || '3',
      JSON.stringify(userData.accommodationPrefs || []),
      JSON.stringify(userData.privacySettings || {}),
      JSON.stringify(userData.countriesVisited || []),
      userData.upcomingTrips || 0,
      userData.shareTravelDates === undefined ? true : userData.shareTravelDates,
      userData.allowConnectionRequests === undefined ? true : userData.allowConnectionRequests,
      userData.showInSearch === undefined ? true : userData.showInSearch
    ];
    
    // Add to sheet
    sheet.appendRow(userRow);
    
    return {
      success: true,
      userId: userId,
      message: 'User created successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error creating user: ' + error.message
    };
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {object} - User data
 */
function getUserById(userId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        const userData = {};
        headers.forEach((header, index) => {
          let value = data[i][index];
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try { value = JSON.parse(value); } catch (e) {}
          }
          userData[header] = value;
        });
        return { success: true, user: userData };
      }
    }
    
    return { success: false, message: 'User not found' };
  } catch (error) {
    return { success: false, message: 'Error retrieving user: ' + error.message };
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {object} - User data
 */
function getUserByEmail(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).toLowerCase() === String(email).toLowerCase()) {
        const userData = {};
        headers.forEach((header, index) => {
          let value = data[i][index];
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try { value = JSON.parse(value); } catch (e) {}
          }
          userData[header] = value;
        });
        return { success: true, user: userData };
      }
    }
    
    return { success: false, message: 'User not found' };
  } catch (error) {
    return { success: false, message: 'Error retrieving user: ' + error.message };
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} userData - Updated user data (expects keys like email, firstName, bio, etc.)
 * @returns {object} - Result object
 */
function updateUser(userId, userData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    // mapping from sheet header names to input field keys (use lowerCamelCase for incoming data)
    const fieldMap = {
      'UserID': 'userId',
      'Email': 'email',
      'FirstName': 'firstName',
      'LastName': 'lastName',
      'Avatar': 'avatar',
      'Password': 'password',
      'Phone': 'phone',
      'UserBio': 'bio',
      'HomeLocation': 'homeLocation',
      'CreatedAt': 'createdAt',
      'LastLogin': 'lastLogin',
      'Verified': 'verified',
      'TravelStyle': 'travelStyle',
      'Interests': 'interests',
      'Budget': 'budget',
      'Pace': 'pace',
      'Planning': 'planning',
      'AccommodationPrefs': 'accommodationPrefs',
      'PrivacySettings': 'privacySettings',
      'CountriesVisited': 'countriesVisited',
      'UpcomingTrips': 'upcomingTrips',
      'ShareTravelDates': 'shareTravelDates',
      'AllowConnectionRequests': 'allowConnectionRequests',
      'ShowInSearch': 'showInSearch'
    };
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        headers.forEach((header, index) => {
          let inputKey = fieldMap[header];
          if (userData[inputKey] !== undefined) {
            let value = userData[inputKey];
            if (typeof value === 'object') {
              value = JSON.stringify(value);
            }
            sheet.getRange(i + 1, index + 1).setValue(value);
          }
        });
        return { success: true, message: 'User updated successfully' };
      }
    }
    return { success: false, message: 'User not found' };
  } catch (error) {
    return { success: false, message: 'Error updating user: ' + error.message };
  }
}

/**
 * Create a new trip
 * @param {object} tripData - Trip data
 * @returns {object} - Result object
 */
function createTrip(tripData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TRIPS);
    
    const tripId = 'T-' + new Date().getTime();
    const timestamp = new Date().toISOString();
    
    const tripRow = [
      tripId,
      tripData.userId,
      tripData.destination,
      tripData.startDate,
      tripData.endDate,
      timestamp,
      JSON.stringify(tripData.travelStyle || []),
      tripData.description || '',
      JSON.stringify(tripData.interests || []),
      tripData.budget || '3',
      tripData.privacy || 'public',
      tripData.status || 'planned'
    ];
    
    sheet.appendRow(tripRow);
    updateUserTripsCount(tripData.userId);
    
    return { success: true, tripId: tripId, message: 'Trip created successfully' };
  } catch (error) {
    return { success: false, message: 'Error creating trip: ' + error.message };
  }
}

/**
 * Get trips by destination
 * @param {string} destination - Destination name
 * @returns {object} - Trips data
 */
function getTripsByDestination(destination) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TRIPS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const trips = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][2].toLowerCase().includes(destination.toLowerCase())) {
        const tripData = {};
        headers.forEach((header, index) => {
          let value = data[i][index];
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try { value = JSON.parse(value); } catch (e) {}
          }
          tripData[header] = value;
        });
        trips.push(tripData);
      }
    }
    return { success: true, trips: trips };
  } catch (error) {
    return { success: false, message: 'Error retrieving trips: ' + error.message };
  }
}

/**
 * Get trips by user
 * @param {string} userId - User ID
 * @returns {object} - Trips data
 */
function getTripsByUser(userId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TRIPS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const trips = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        const tripData = {};
        headers.forEach((header, index) => {
          let value = data[i][index];
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try { value = JSON.parse(value); } catch (e) {}
          }
          tripData[header] = value;
        });
        trips.push(tripData);
      }
    }
    return { success: true, trips: trips };
  } catch (error) {
    return { success: false, message: 'Error retrieving trips: ' + error.message };
  }
}

/**
 * Update user's trip count
 * @param {string} userId - User ID
 */
function updateUserTripsCount(userId) {
  try {
    const trips = getTripsByUser(userId);
    if (trips.success) {
      const now = new Date();
      const upcomingTrips = trips.trips.filter(trip => {
        const endDate = new Date(trip.EndDate);
        return endDate >= now;
      }).length;
      
      updateUser(userId, { upcomingTrips: upcomingTrips });
    }
  } catch (error) {
    console.error('Error updating user trips count:', error);
  }
}

/**
 * Create a new connection
 * @param {object} connectionData - Connection data
 * @returns {object} - Result object
 */
function createConnection(connectionData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CONNECTIONS);
    
    const connectionId = 'C-' + new Date().getTime();
    const timestamp = new Date().toISOString();
    
    const connectionRow = [
      connectionId,
      connectionData.userId1,
      connectionData.userId2,
      connectionData.status || 'connected',
      timestamp,
      timestamp,
      JSON.stringify(connectionData.sharedTrips || [])
    ];
    
    sheet.appendRow(connectionRow);
    return { success: true, connectionId: connectionId, message: 'Connection created successfully' };
  } catch (error) {
    return { success: false, message: 'Error creating connection: ' + error.message };
  }
}

/**
 * Get user connections
 * @param {string} userId - User ID
 * @returns {object} - Connections data
 */
function getUserConnections(userId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CONNECTIONS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const connections = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId || data[i][2] === userId) {
        const connectionData = {};
        headers.forEach((header, index) => {
          let value = data[i][index];
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try { value = JSON.parse(value); } catch (e) {}
          }
          connectionData[header] = value;
        });
        
        // Add info for the other user in the connection
        const otherUserId = data[i][1] === userId ? data[i][2] : data[i][1];
        const otherUser = getUserById(otherUserId);
        if (otherUser.success) {
          connectionData.otherUser = {
            userId: otherUser.user.UserID,
            firstName: otherUser.user.FirstName,
            lastName: otherUser.user.LastName,
            avatar: otherUser.user.Avatar,
            homeLocation: otherUser.user.HomeLocation
          };
        }
        connections.push(connectionData);
      }
    }
    return { success: true, connections: connections };
  } catch (error) {
    return { success: false, message: 'Error retrieving connections: ' + error.message };
  }
}

/**
 * Create a new invite
 * @param {object} inviteData - Invite data
 * @returns {object} - Result object
 */
function createInvite(inviteData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.INVITES);
    
    const inviteId = 'I-' + new Date().getTime();
    const timestamp = new Date().toISOString();
    
    const inviteRow = [
      inviteId,
      inviteData.senderId,
      inviteData.receiverId,
      inviteData.tripId || '',
      'pending',
      inviteData.message || '',
      timestamp,
      ''
    ];
    
    sheet.appendRow(inviteRow);
    
    if (inviteData.sendEmail) {
      sendInviteNotification(inviteData);
    }
    
    return { success: true, inviteId: inviteId, message: 'Invite sent successfully' };
  } catch (error) {
    return { success: false, message: 'Error sending invite: ' + error.message };
  }
}

/**
 * Send invite notification email
 * @param {object} inviteData - Invite data
 */
function sendInviteNotification(inviteData) {
  try {
    const sender = getUserById(inviteData.senderId);
    const receiver = getUserById(inviteData.receiverId);
    
    if (!sender.success || !receiver.success) {
      console.error('Could not find sender or receiver');
      return;
    }
    
    let tripInfo = '';
    if (inviteData.tripId) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const tripSheet = ss.getSheetByName(CONFIG.SHEETS.TRIPS);
      const tripData = tripSheet.getDataRange().getValues();
      
      for (let i = 1; i < tripData.length; i++) {
        if (tripData[i][0] === inviteData.tripId) {
          const destination = tripData[i][2];
          const startDate = new Date(tripData[i][3]).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
          });
          const endDate = new Date(tripData[i][4]).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
          });
          
          tripInfo = `<p>Trip: ${destination} (${startDate} - ${endDate})</p>`;
          break;
        }
      }
    }
    
    const emailHtml = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin:0 auto;">
        <div style="background-color: #0078ff; padding: 20px; text-align: center; color: white;">
          <h1 style="margin:0;">You have a new connection invite on Cluster!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hello ${receiver.user.FirstName},</p>
          <p><strong>${sender.user.FirstName} ${sender.user.LastName}</strong> has invited you to connect on Cluster.</p>
          ${tripInfo}
          <p>Message: "${inviteData.message || "Let's connect on Cluster!"}"</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="#" style="background-color: #0078ff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Invite</a>
          </div>
          <p>Happy traveling!</p>
          <p>The Cluster Team</p>
        </div>
      </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: receiver.user.Email,
      subject: `${sender.user.FirstName} invited you to connect on Cluster`,
      htmlBody: emailHtml,
      name: CONFIG.EMAIL_SETTINGS.SENDER_NAME,
      replyTo: CONFIG.EMAIL_SETTINGS.NO_REPLY_EMAIL
    });
    
  } catch (error) {
    console.error('Error sending invite notification email:', error);
  }
}

/**
 * Get user invites
 * @param {string} userId - User ID
 * @param {string} type - ('sent', 'received', or 'all')
 * @returns {object} - Invites data
 */
function getUserInvites(userId, type = 'all') {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.INVITES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const invites = [];
    
    for (let i = 1; i < data.length; i++) {
      const isSender = data[i][1] === userId;
      const isReceiver = data[i][2] === userId;
      
      if ((type === 'sent' && isSender) || 
          (type === 'received' && isReceiver) ||
          (type === 'all' && (isSender || isReceiver))) {
        
        const inviteData = {};
        headers.forEach((header, index) => {
          inviteData[header] = data[i][index];
        });
        
        const otherUserId = isSender ? data[i][2] : data[i][1];
        const otherUser = getUserById(otherUserId);
        if (otherUser.success) {
          inviteData.otherUser = {
            userId: otherUser.user.UserID,
            firstName: otherUser.user.FirstName,
            lastName: otherUser.user.LastName,
            avatar: otherUser.user.Avatar
          };
        }
        
        if (inviteData.TripID) {
          const tripSheet = ss.getSheetByName(CONFIG.SHEETS.TRIPS);
          const tripData = tripSheet.getDataRange().getValues();
          for (let j = 1; j < tripData.length; j++) {
            if (tripData[j][0] === inviteData.TripID) {
              inviteData.trip = {
                destination: tripData[j][2],
                startDate: tripData[j][3],
                endDate: tripData[j][4]
              };
              break;
            }
          }
        }
        invites.push(inviteData);
      }
    }
    return { success: true, invites: invites };
  } catch (error) {
    return { success: false, message: 'Error retrieving invites: ' + error.message };
  }
}

/**
 * Respond to invite
 * @param {string} inviteId - Invite ID
 * @param {string} response - ('accept' or 'decline')
 * @returns {object} - Result object
 */
function respondToInvite(inviteId, response) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.INVITES);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === inviteId) {
        const status = response === 'accept' ? 'accepted' : 'declined';
        sheet.getRange(i + 1, 5).setValue(status);
        sheet.getRange(i + 1, 8).setValue(new Date().toISOString());
        
        if (response === 'accept') {
          createConnection({
            userId1: data[i][1],
            userId2: data[i][2],
            status: 'connected',
            sharedTrips: data[i][3] ? [data[i][3]] : []
          });
        }
        return { success: true, message: 'Invite ' + status + ' successfully' };
      }
    }
    return { success: false, message: 'Invite not found' };
  } catch (error) {
    return { success: false, message: 'Error responding to invite: ' + error.message };
  }
}

/**
 * Get all destinations
 * @returns {object} - Destinations data
 */
function getAllDestinations() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DESTINATIONS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const destinations = [];
    
    for (let i = 1; i < data.length; i++) {
      const destData = {};
      headers.forEach((header, index) => {
        destData[header] = data[i][index];
      });
      destinations.push(destData);
    }
    return { success: true, destinations: destinations };
  } catch (error) {
    return { success: false, message: 'Error retrieving destinations: ' + error.message };
  }
}

/**
 * Get trending destinations
 * @param {number} limit - Maximum number of destinations
 * @returns {object} - Trending destinations data
 */
function getTrendingDestinations(limit = 5) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DESTINATIONS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const destinations = [];
    
    for (let i = 1; i < data.length; i++) {
      const dest = {};
      headers.forEach((header, index) => {
        dest[header] = data[i][index];
      });
      destinations.push(dest);
    }
    
    destinations.sort((a, b) => b.TrendingPercentage - a.TrendingPercentage);
    return { success: true, destinations: destinations.slice(0, limit) };
  } catch (error) {
    return { success: false, message: 'Error retrieving trending destinations: ' + error.message };
  }
}

/**
 * Search destinations by name
 * @param {string} query - Search query
 * @returns {object} - Matching destinations
 */
function searchDestinations(query) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DESTINATIONS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const results = [];
    
    for (let i = 1; i < data.length; i++) {
      const name = data[i][1];
      if (name.toLowerCase().includes(query.toLowerCase())) {
        const destData = {};
        headers.forEach((header, index) => {
          destData[header] = data[i][index];
        });
        results.push(destData);
      }
    }
    return { success: true, destinations: results };
  } catch (error) {
    return { success: false, message: 'Error searching destinations: ' + error.message };
  }
}

/**
 * Send a message
 * @param {object} messageData - Message data
 * @returns {object} - Result object
 */
function sendMessage(messageData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.MESSAGES);
    
    const messageId = 'M-' + new Date().getTime();
    const timestamp = new Date().toISOString();
    
    const messageRow = [
      messageId,
      messageData.senderId,
      messageData.receiverId || '',
      messageData.channelId || '',
      messageData.content,
      timestamp,
      'unread',
      messageData.type || 'text'
    ];
    
    sheet.appendRow(messageRow);
    
    if (messageData.receiverId) {
      updateConnectionLastInteraction(messageData.senderId, messageData.receiverId, timestamp);
    }
    
    return { success: true, messageId: messageId, message: 'Message sent successfully' };
  } catch (error) {
    return { success: false, message: 'Error sending message: ' + error.message };
  }
}

/**
 * Update connection's last interaction timestamp
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {string} timestamp - Timestamp
 */
function updateConnectionLastInteraction(userId1, userId2, timestamp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CONNECTIONS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if ((data[i][1] === userId1 && data[i][2] === userId2) ||
          (data[i][1] === userId2 && data[i][2] === userId1)) {
        sheet.getRange(i + 1, 6).setValue(timestamp);
        break;
      }
    }
  } catch (error) {
    console.error('Error updating connection last interaction:', error);
  }
}

/**
 * Get messages by channel
 * @param {string} channelId - Channel ID
 * @param {number} limit - Maximum messages to return
 * @returns {object} - Messages data
 */
function getChannelMessages(channelId, limit = 50) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.MESSAGES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const messages = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === channelId) {
        const messageData = {};
        headers.forEach((header, index) => {
          messageData[header] = data[i][index];
        });
        
        const sender = getUserById(data[i][1]);
        if (sender.success) {
          messageData.sender = {
            name: sender.user.FirstName + ' ' + sender.user.LastName.charAt(0) + '.',
            avatar: sender.user.Avatar
          };
        }
        messages.push(messageData);
      }
    }
    
    messages.sort((a, b) => new Date(a.SentAt) - new Date(b.SentAt));
    const recentMessages = messages.slice(-limit);
    return { success: true, messages: recentMessages };
  } catch (error) {
    return { success: false, message: 'Error retrieving channel messages: ' + error.message };
  }
}

/**
 * Get direct messages between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {number} limit - Maximum messages to return
 * @returns {object} - Messages data
 */
function getDirectMessages(userId1, userId2, limit = 50) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.MESSAGES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const messages = [];
    
    for (let i = 1; i < data.length; i++) {
      if ((data[i][1] === userId1 && data[i][2] === userId2) ||
          (data[i][1] === userId2 && data[i][2] === userId1)) {
        const messageData = {};
        headers.forEach((header, index) => {
          messageData[header] = data[i][index];
        });
        
        const sender = getUserById(data[i][1]);
        if (sender.success) {
          messageData.sender = {
            name: sender.user.FirstName + ' ' + sender.user.LastName.charAt(0) + '.',
            avatar: sender.user.Avatar
          };
        }
        messages.push(messageData);
      }
    }
    
    messages.sort((a, b) => new Date(a.SentAt) - new Date(b.SentAt));
    const recentMessages = messages.slice(-limit);
    return { success: true, messages: recentMessages };
  } catch (error) {
    return { success: false, message: 'Error retrieving direct messages: ' + error.message };
  }
}

/**
 * Get all channels
 * @returns {object} - Channels data
 */
function getAllChannels() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CHANNELS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const channels = [];
    
    for (let i = 1; i < data.length; i++) {
      const channelData = {};
      headers.forEach((header, index) => {
        channelData[header] = data[i][index];
      });
      channels.push(channelData);
    }
    return { success: true, channels: channels };
  } catch (error) {
    return { success: false, message: 'Error retrieving channels: ' + error.message };
  }
}

/* ===== NEW AUTHENTICATION FUNCTIONS ===== */

/**
 * Login (for frontend signup/login)
 * Checks email and password and returns user info if valid.
 * @param {object} params - Contains email and password.
 * @returns {object} - Result object.
 */
function loginUser(params) {
  const email = params.email;
  const password = params.password;
  if (!email || !password) {
    return { success: false, message: 'Email and password required' };
  }
  
  const userResult = getUserByEmail(email);
  if (userResult.success) {
    if (userResult.user.Password === password) { // In production, compare hashed passwords
      let user = userResult.user;
      delete user.Password; // Remove password from response
      // Optionally update last login time
      updateUser(user.UserID, { LastLogin: new Date().toISOString() });
      return { success: true, user: user, message: 'Login successful' };
    } else {
      return { success: false, message: 'Invalid password' };
    }
  } else {
    return { success: false, message: 'User not found' };
  }
}

/**
 * Tester login – bypasses the password check.
 * If no email is provided then the first user in the Users sheet is returned.
 * @param {object} params - Contains an optional email.
 * @returns {object} - Result object.
 */
function testerLogin(params) {
  let email = params.email;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  // If email is not provided, use the first user found (if exists)
  if (!email) {
    if (data.length > 1) { // row 0 is headers
      email = data[1][1]; // second row, column "Email"
    } else {
      return { success: false, message: 'No users available for tester login' };
    }
  }
  
  const userResult = getUserByEmail(email);
  if (userResult.success) {
    let user = userResult.user;
    delete user.Password;
    return { success: true, user: user, message: 'Tester login successful' };
  } else {
    return { success: false, message: 'Tester login failed: User not found' };
  }
}

/**
 * Get API key from the API Keys sheet
 * @param {string} keyName - Name of the API key to retrieve
 * @returns {string} - API key value or empty string if not found
 */
function getApiKey(keyName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.API_KEYS);
    
    if (!sheet) {
      console.error('API Keys sheet not found');
      return '';
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === keyName) {
        return data[i][1] || '';
      }
    }
    
    console.error('API key not found:', keyName);
    return '';
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return '';
  }
}

/**
 * Proxy for Claude API to avoid CORS issues and secure API key
 * @param {object} requestData - Request data to send to Claude API
 * @returns {object} - Response from Claude API
 */
function proxyClaudeApi(requestData) {
  try {
    // Get the API key from the database
    const apiKey = getApiKey('CLAUDE_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        message: 'API key not found or invalid'
      };
    }
    
    // Make the request to Claude API from the server side
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    });
    
    // Return the response
    return {
      success: true,
      status: response.getResponseCode(),
      data: JSON.parse(response.getContentText())
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error proxying request: ' + error.message
    };
  }
}

/* ===== WEB APP ENDPOINTS ===== */

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    let result;
    
    // Check if this is a JSONP request with a callback and possibly data
    const callback = e.parameter.callback;
    const token = e.parameter.token;
    const encodedData = e.parameter.data;
    
    // Parse data parameter if provided (for JSONP POST simulation)
    let data = null;
    if (encodedData) {
      try {
        data = JSON.parse(encodedData);
      } catch (parseError) {
        console.error('Error parsing data parameter:', parseError);
      }
    }
    
    // If data exists, it's a JSONP POST simulation so merge params
    const params = data ? {...e.parameter, ...data} : e.parameter;
    
    // Execute the action
    switch (action) {
      case 'proxyClaudeApi':
        // Extract the request data from the parameters
        const requestData = data || params;
        result = proxyClaudeApi(requestData);
        break;
        
      case 'getApiKey':
        // This endpoint is no longer needed since the API key is now handled by the backend
        result = { success: false, message: 'This endpoint is deprecated. Use proxyClaudeApi instead.' };
        break;
      case 'signup':
        result = createUser(data || params);
        break;
      case 'login':
        result = loginUser(data || params);
        break;
      case 'testerLogin':
        result = testerLogin(data || params || {});
        break;
      case 'updateUser':
        result = updateUser((data || params).userId, data || params);
        break;
      case 'createTrip':
        result = createTrip(data || params);
        break;
      case 'createInvite':
        result = createInvite(data || params);
        break;
      case 'respondToInvite':
        result = respondToInvite((data || params).inviteId, (data || params).response);
        break;
      case 'createConnection':
        result = createConnection(data || params);
        break;
      case 'sendMessage':
        result = sendMessage(data || params);
        break;
      case 'initDatabase':
        result = initializeDatabase();
        break;
      case 'getUser':
        if ((data || params).userId) {
          result = getUserById((data || params).userId);
        } else if ((data || params).email) {
          result = getUserByEmail((data || params).email);
        } else {
          result = { success: false, message: 'No userId or email provided' };
        }
        break;
      case 'getUserTrips':
        result = getTripsByUser((data || params).userId);
        break;
      case 'getTripsByDestination':
        result = getTripsByDestination((data || params).destination);
        break;
      case 'getUserConnections':
        result = getUserConnections((data || params).userId);
        break;
      case 'getUserInvites':
        result = getUserInvites((data || params).userId, (data || params).type || 'all');
        break;
      case 'getAllDestinations':
      case 'getDestinations':
        result = getAllDestinations();
        break;
      case 'getTrendingDestinations':
        result = getTrendingDestinations(parseInt((data || params).limit || 5));
        break;
      case 'searchDestinations':
        result = searchDestinations((data || params).query || '');
        break;
      case 'getChannelMessages':
        result = getChannelMessages((data || params).channelId, parseInt((data || params).limit || 50));
        break;
      case 'getDirectMessages':
        result = getDirectMessages((data || params).userId1, (data || params).userId2, parseInt((data || params).limit || 50));
        break;
      case 'getAllChannels':
        result = getAllChannels();
        break;
      default:
        result = { success: false, message: 'No action specified or invalid action' };
    }
    
    // Return the response - either as JSONP (with callback) or as regular JSON
    if (callback) {
      // JSONP response - wrap the JSON in the callback function
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Regular JSON response
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    const errorResponse = {
      success: false,
      message: 'Error processing request: ' + error.message
    };
    
    // Check if this is a JSONP request with a callback
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(errorResponse) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

/**
 * Handle POST requests
 * For uniformity, reroute to doGet with the same parameters to handle JSONP as well
 */
function doPost(e) {
  return doGet(e);
}

/**
 * Create a custom menu in the Spreadsheet UI
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Cluster Admin')
    .addItem('Initialize Database', 'initializeDatabase')
    .addItem('Seed Sample Data', 'seedSampleData')
    .addSeparator()
    .addItem('View API Documentation', 'showApiDocs')
    .addToUi();
}

/**
 * Show API documentation in a dialog
 */
function showApiDocs() {
  const ui = SpreadsheetApp.getUi();
  
  const htmlOutput = HtmlService
    .createHtmlOutput(`
      <h1>Cluster API Documentation</h1>
      <h2>GET Endpoints</h2>
      <ul>
        <li><code>?action=initDatabase</code> - Initialize the database</li>
        <li><code>?action=getUser&userId=[id]</code> - Get user by ID</li>
        <li><code>?action=getUser&email=[email]</code> - Get user by email</li>
        <li><code>?action=getUserTrips&userId=[id]</code> - Get trips for a user</li>
        <li><code>?action=getTripsByDestination&destination=[name]</code> - Get trips by destination</li>
        <li><code>?action=getUserConnections&userId=[id]</code> - Get connections for a user</li>
        <li><code>?action=getUserInvites&userId=[id]&type=[all|sent|received]</code> - Get invites for a user</li>
        <li><code>?action=getAllDestinations</code> - Get all destinations</li>
        <li><code>?action=getTrendingDestinations&limit=[number]</code> - Get trending destinations</li>
        <li><code>?action=searchDestinations&query=[text]</code> - Search destinations</li>
        <li><code>?action=getChannelMessages&channelId=[id]&limit=[number]</code> - Get channel messages</li>
        <li><code>?action=getDirectMessages&userId1=[id]&userId2=[id]&limit=[number]</code> - Get direct messages between users</li>
        <li><code>?action=getAllChannels</code> - Get all channels</li>
      </ul>
      
      <h2>POST Endpoints</h2>
      <ul>
        <li><code>?action=signup</code> - Create a new user</li>
        <li><code>?action=login&email=[email]&password=[password]</code> - Login a user</li>
        <li><code>?action=testerLogin&email=[email]</code> - Tester login without a password (email is optional)</li>
        <li><code>?action=updateUser&userId=[id]</code> - Update user profile</li>
        <li><code>?action=createTrip</code> - Create a new trip</li>
        <li><code>?action=createInvite</code> - Create a new invite</li>
        <li><code>?action=respondToInvite&inviteId=[id]&response=[accept|decline]</code> - Respond to an invite</li>
        <li><code>?action=createConnection</code> - Create a new connection</li>
        <li><code>?action=sendMessage</code> - Send a message</li>
      </ul>
    `)
    .setWidth(600)
    .setHeight(500);
    
  ui.showModalDialog(htmlOutput, 'Cluster API Documentation');
}

/**
 * Seed sample data for testing purposes
 */
function seedSampleData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create sample users
    const users = [
      {
        email: 'emma@example.com',
        firstName: 'Emma',
        lastName: 'Chen',
        avatar: 'E',
        password: 'password123',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate traveler with a love for photography and cultural experiences.',
        homeLocation: 'San Francisco, CA',
        verified: true,
        travelStyle: ['solo', 'group'],
        interests: ['Photography', 'Food', 'Hiking', 'Culture', 'Museums'],
        countriesVisited: ['Japan', 'Thailand', 'France', 'Spain', 'Italy']
      },
      {
        email: 'alex@example.com',
        firstName: 'Alex',
        lastName: 'Turner',
        avatar: 'A',
        password: 'password123',
        phone: '+1 (555) 234-5678',
        bio: 'Adventure seeker always looking for the next thrill.',
        homeLocation: 'New York, NY',
        verified: true,
        travelStyle: ['backpacking', 'adventure'],
        interests: ['Hiking', 'Diving', 'Photography', 'Food'],
        countriesVisited: ['Thailand', 'Indonesia', 'Mexico', 'Peru', 'Australia']
      },
      {
        email: 'maya@example.com',
        firstName: 'Maya',
        lastName: 'Wong',
        avatar: 'M',
        password: 'password123',
        phone: '+1 (555) 345-6789',
        bio: 'Food enthusiast exploring the world one dish at a time.',
        homeLocation: 'Chicago, IL',
        verified: true,
        travelStyle: ['luxury', 'foodie'],
        interests: ['Food', 'Cooking Classes', 'Markets', 'Architecture'],
        countriesVisited: ['Italy', 'Japan', 'France', 'Morocco', 'Vietnam']
      }
    ];
    
    const userIds = [];
    users.forEach(user => {
      const result = createUser(user);
      if (result.success) {
        userIds.push(result.userId);
      }
    });
    
    // Create sample destinations
    const destSheet = ss.getSheetByName(CONFIG.SHEETS.DESTINATIONS);
    const destinations = [
      ['D-001', 'Bali', 'Indonesia', 'Southeast Asia', "Southeast Asia's tropical paradise", 'bali.jpg', 248, 'Apr - Jun 2025', 15, 'featured', 'fa-umbrella-beach'],
      ['D-002', 'Patagonia', 'Chile', 'South America', 'Epic landscapes and outdoor adventures', 'patagonia.jpg', 186, 'Dec - Feb 2025', 22, 'featured', 'fa-mountain'],
      ['D-003', 'Lisbon', 'Portugal', 'Europe', "Europe's sunniest capital city", 'lisbon.jpg', 312, 'Jun - Aug 2025', 18, 'featured', 'fa-city'],
      ['D-004', 'Kyoto', 'Japan', 'Asia', 'Ancient temples and cultural heritage', 'kyoto.jpg', 205, 'Mar - May 2025', 12, 'featured', 'fa-landmark'],
      ['D-005', 'Santorini', 'Greece', 'Europe', 'Iconic white and blue Aegean views', 'santorini.jpg', 274, 'May - Sep 2025', 20, 'featured', 'fa-water']
    ];
    destinations.forEach(dest => destSheet.appendRow(dest));
    
    // Create sample channels
    const chSheet = ss.getSheetByName(CONFIG.SHEETS.CHANNELS);
    const channels = [
      ['CH-001', 'South East Asia', 'Discuss travel in Thailand, Vietnam, Indonesia, and more', 'region', 'Asia', 'fa-globe-asia', 56, new Date().toISOString(), new Date().toISOString()],
      ['CH-002', 'European Alps', 'For mountain lovers and winter sports enthusiasts', 'region', 'Europe', 'fa-mountain', 32, new Date().toISOString(), new Date().toISOString()],
      ['CH-003', 'Caribbean Islands', 'Beach getaways and island hopping', 'region', 'Caribbean', 'fa-umbrella-beach', 45, new Date().toISOString(), new Date().toISOString()],
      ['CH-004', 'Nordic Cities', "Exploring Scandinavia's urban centers", 'region', 'Europe', 'fa-city', 28, new Date().toISOString(), new Date().toISOString()]
    ];
    channels.forEach(channel => chSheet.appendRow(channel));
    
    // Create sample trips and connections if we have sample users
    if (userIds.length > 0) {
      const trip1 = {
        userId: userIds[0],
        destination: 'Bali, Indonesia',
        startDate: '2025-05-05',
        endDate: '2025-05-20',
        travelStyle: ['solo', 'adventure'],
        description: 'Exploring temples, beaches, and culture in Bali',
        interests: ['Photography', 'Hiking', 'Food'],
        budget: '3',
        privacy: 'public'
      };
      
      const trip2 = {
        userId: userIds[1],
        destination: 'Tokyo, Japan',
        startDate: '2025-04-10',
        endDate: '2025-04-25',
        travelStyle: ['urban', 'cultural'],
        description: 'Experiencing the blend of traditional and modern Japan',
        interests: ['Food', 'Photography', 'Technology'],
        budget: '4',
        privacy: 'public'
      };
      
      createTrip(trip1);
      createTrip(trip2);
      
      createConnection({
        userId1: userIds[0],
        userId2: userIds[1]
      });
      
      createInvite({
        senderId: userIds[0],
        receiverId: userIds[2],
        message: 'Would love to connect with a fellow food enthusiast!'
      });
      
      sendMessage({
        senderId: userIds[0],
        channelId: 'CH-001',
        content: 'Has anyone taken the night train from Bangkok to Chiang Mai recently? How was your experience?'
      });
      
      sendMessage({
        senderId: userIds[1],
        channelId: 'CH-001',
        content: 'I did it last month! Surprisingly comfortable if you book first-class sleeper. Bring snacks!'
      });
      
      sendMessage({
        senderId: userIds[2],
        channelId: 'CH-001',
        content: "I'm planning to visit Thailand next month. Is Chiang Mai worth visiting over Phuket?"
      });
    }
    
    return { success: true, message: 'Sample data created successfully' };
  } catch (error) {
    return { success: false, message: 'Error creating sample data: ' + error.message };
  }
}