document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!Session.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get current user data
    const currentUser = Session.getUser();
    
    // Fetch trending destinations to use throughout the app
    let destinations = [];
    try {
        const destinationsResponse = await API.getTrendingDestinations(8);
        if (destinationsResponse.success) {
            destinations = destinationsResponse.destinations;
            // Load trending destinations into the map overlay cards
            loadTrendingDestinationCards(destinations);
        }
    } catch (error) {
        console.error('Error fetching destinations:', error);
    }
    
    // Function to load trending destination cards in the map overlay
    function loadTrendingDestinationCards(destinations) {
        const trendingCardsContainer = document.getElementById('trending-destination-cards');
        if (!trendingCardsContainer) return;
        
        // Clear any existing cards
        trendingCardsContainer.innerHTML = '';
        
        // Add destination cards to the trending container
        destinations.forEach(dest => {
            const card = createDestinationCard(dest);
            trendingCardsContainer.appendChild(card);
        });
    }
    
    // Function to create a destination card element
    function createDestinationCard(destination) {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.dataset.destinationId = destination.DestinationID;
        
        const icon = destination.Icon || 'fa-map-marker-alt';
        const description = destination.Description || destination.Region || 'Amazing destination';
        
        card.innerHTML = `
            <div class="destination-card-header">
                <div class="destination-card-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <h4 class="destination-card-title">${destination.Name}</h4>
            </div>
            <div class="destination-card-description">${description}</div>
            <div class="destination-card-stats">
                <div class="destination-card-stat">
                    <i class="fas fa-user"></i> ${destination.TravellerCount || 'N/A'} travelers
                </div>
                <div class="destination-card-stat">
                    <i class="fas fa-arrow-trend-up"></i> +${destination.TrendingPercentage || 'N/A'}%
                </div>
            </div>
        `;
        
        // Add click handler for the card
        card.addEventListener('click', () => {
            // Find and click the corresponding trending item or location card to reuse existing logic
            const trendingItems = document.querySelectorAll('.trending-item');
            let clicked = false;
            
            trendingItems.forEach(item => {
                const itemTitle = item.querySelector('h4')?.textContent;
                if (itemTitle && destination.Name.includes(itemTitle) || (itemTitle && itemTitle.includes(destination.Name.split(',')[0]))) {
                    item.click();
                    clicked = true;
                }
            });
            
            if (!clicked) {
                const locationCards = document.querySelectorAll('.location-card');
                locationCards.forEach(card => {
                    const cardName = card.querySelector('h3')?.textContent;
                    if (cardName && (destination.Name.includes(cardName) || cardName.includes(destination.Name.split(',')[0]))) {
                        setTimeout(() => {
                            // First switch to connect tab if needed
                            const connectTab = document.querySelector('[data-tab="connect"]');
                            if (connectTab && !connectTab.classList.contains('active')) {
                                connectTab.click();
                            }
                            
                            // Then click the card after tab transition
                            setTimeout(() => {
                                card.click();
                            }, 300);
                        }, 100);
                        clicked = true;
                    }
                });
            }
            
            if (!clicked) {
                // Just show an alert for now
                alert(`Selected destination: ${destination.Name}\nDetails coming soon!`);
            }
        });
        
        return card;
    }
    
    // Object to store travelers by destination
    const travelers = {};
    
    // Tab Navigation
    const tabs = document.querySelectorAll('.tab');
    const tabHighlight = document.querySelector('.tab-highlight');
    const contentSections = document.querySelectorAll('.content-section');
    
    function setActiveTab(tab) {
        // Update active tab state
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Move highlight
        const tabWidth = tab.offsetWidth;
        const tabLeft = tab.offsetLeft;
        tabHighlight.style.width = `${tabWidth}px`;
        tabHighlight.style.transform = `translateX(${tabLeft}px)`;
        
        // Show corresponding content
        const targetId = tab.getAttribute('data-tab');
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                setTimeout(() => {
                    section.classList.add('active');
                }, 50);
            }
        });
    }
    
    // Set initial highlight position
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;
        tabHighlight.style.width = `${tabWidth}px`;
        tabHighlight.style.transform = `translateX(${tabLeft}px)`;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveTab(tab);
        });
    });
    
    // Load trending destinations to display in the trending list
    const trendingList = document.querySelector('.trending-list');
    if (trendingList) {
        try {
            // Get trending destinations if not already loaded
            if (destinations.length === 0) {
                const destinationsResponse = await API.getTrendingDestinations(5);
                if (destinationsResponse.success) {
                    destinations = destinationsResponse.destinations;
                }
            }
            
            // Clear default content
            trendingList.innerHTML = '<h3>Trending Destinations</h3>';
            
            // Add destinations to the trending list
            if (destinations.length > 0) {
                destinations.forEach(dest => {
                    const item = document.createElement('div');
                    item.className = 'trending-item';
                    item.innerHTML = `
                        <div class="trending-icon">
                            <i class="fas ${dest.Icon || 'fa-map-marker-alt'}"></i>
                        </div>
                        <div class="trending-info">
                            <h4>${dest.Name}</h4>
                            <p>${dest.Description || dest.Region}</p>
                            <div class="stat-badges">
                                <div class="stat-badge">
                                    <i class="fas fa-user"></i> ${dest.TravellerCount || 'N/A'} travelers
                                </div>
                                <div class="stat-badge">
                                    <i class="fas fa-arrow-trend-up"></i> +${dest.TrendingPercentage || 'N/A'}%
                                </div>
                            </div>
                        </div>
                    `;
                    trendingList.appendChild(item);
                });
            }
        } catch (error) {
            console.error('Error displaying trending destinations:', error);
        }
    }
    
    // Create hotspots on the map (use destination data if available)
    const mapHotspots = document.querySelector('.map-hotspots');
    let hotspotPositions = [
        { x: 30, y: 40 }, // Southeast Asia
        { x: 48, y: 28 }, // Europe
        { x: 20, y: 60 }, // South America
        { x: 75, y: 45 }, // Japan
        { x: 60, y: 65 }  // Australia
    ];
    
    // Generate random positions based on destinations if available
    if (destinations.length > 0) {
        // Use fixed positions for known regions for better visual appeal
        const regionPositions = {
            'Asia': { x: 70, y: 40 },
            'Southeast Asia': { x: 72, y: 50 },
            'Europe': { x: 48, y: 28 },
            'North America': { x: 20, y: 30 },
            'South America': { x: 30, y: 60 },
            'Africa': { x: 50, y: 45 },
            'Oceania': { x: 80, y: 65 }
        };
        
        hotspotPositions = destinations.slice(0, 5).map(dest => {
            // Use region positions or generate random position
            if (dest.Region && regionPositions[dest.Region]) {
                return {
                    ...regionPositions[dest.Region],
                    name: dest.Name,
                    id: dest.DestinationID
                };
            } else {
                return {
                    x: 30 + Math.random() * 50,
                    y: 20 + Math.random() * 50,
                    name: dest.Name,
                    id: dest.DestinationID
                };
            }
        });
    }
    
    if (mapHotspots) {
        mapHotspots.innerHTML = '';
        hotspotPositions.forEach(pos => {
            const hotspot = document.createElement('div');
            hotspot.className = 'hotspot';
            hotspot.style.left = `${pos.x}%`;
            hotspot.style.top = `${pos.y}%`;
            
            // Add random delay to pulse animation
            const delay = Math.random() * 2;
            hotspot.style.animationDelay = `${delay}s`;
            
            if (pos.name) {
                hotspot.title = pos.name;
                hotspot.dataset.id = pos.id;
                
                // Add click event to hotspot if it has a name
                hotspot.addEventListener('click', () => {
                    const locationCards = document.querySelectorAll('.location-card');
                    // Find and click the corresponding location card if it exists
                    locationCards.forEach(card => {
                        if (card.querySelector('h3').textContent.includes(pos.name)) {
                            card.click();
                        }
                    });
                });
            }
            
            mapHotspots.appendChild(hotspot);
        });
    }
    
    // Connect tab inner navigation
    const connectTabs = document.querySelectorAll('.connect-tab');
    const connectTabHighlight = document.querySelector('.connect-tab-highlight');
    const connectContentSections = document.querySelectorAll('.connect-content-section');
    
    function setActiveConnectTab(tab) {
        // Update active tab state
        connectTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Move highlight
        const tabWidth = tab.offsetWidth;
        const tabLeft = tab.offsetLeft;
        connectTabHighlight.style.width = `${tabWidth}px`;
        connectTabHighlight.style.transform = `translateX(${tabLeft}px)`;
        
        // Show corresponding content
        const targetId = tab.getAttribute('data-connect-tab');
        connectContentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId + '-travelers') {
                setTimeout(() => {
                    section.classList.add('active');
                }, 50);
            }
        });
    }
    
    // Set initial highlight position for connect tabs
    const activeConnectTab = document.querySelector('.connect-tab.active');
    if (activeConnectTab) {
        const tabWidth = activeConnectTab.offsetWidth;
        const tabLeft = activeConnectTab.offsetLeft;
        connectTabHighlight.style.width = `${tabWidth}px`;
        connectTabHighlight.style.transform = `translateX(${tabLeft}px)`;
    }
    
    connectTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveConnectTab(tab);
        });
    });
    
    // Location cards click handling
    const locationCards = document.querySelectorAll('.location-card');
    const locationDetail = document.getElementById('location-detail');
    const backButton = document.querySelector('.back-button');
    const detailLocationName = document.querySelector('.detail-location-name');
    const travelersList = document.querySelector('.travelers-list');
    
    // Add click handler for location cards
    locationCards.forEach(card => {
        card.addEventListener('click', async () => {
            const locationId = card.getAttribute('data-location');
            const locationName = card.querySelector('h3').textContent;
            
            // Set location name in detail view
            detailLocationName.textContent = locationName;
            
            // Clear previous travelers list
            travelersList.innerHTML = '';
            
            // Show loading indicator
            travelersList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <div style="width: 50px; height: 50px; border: 3px solid rgba(0, 120, 255, 0.2); border-top-color: var(--primary); border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite;"></div>
                    <p>Loading travelers...</p>
                </div>
            `;
            
            // Show detail page with animation
            locationDetail.style.display = 'block';
            setTimeout(() => {
                locationDetail.classList.add('active');
            }, 10);
            
            // Fetch trips for this destination if not already loaded
            if (!travelers[locationId]) {
                try {
                    // Clean up the locationName to create a search term
                    const searchTerm = locationName.split(',')[0].trim();
                    const response = await API.getTripsByDestination(searchTerm);
                    
                    if (response.success && response.trips && response.trips.length > 0) {
                        const tripUserIds = response.trips.map(trip => trip.UserID);
                        
                        // Fetch user details for each trip
                        const userPromises = tripUserIds.map(userId => API.getUserById(userId));
                        const userResponses = await Promise.all(userPromises);
                        
                        const locationTravelers = [];
                        
                        userResponses.forEach((userResp, index) => {
                            if (userResp.success) {
                                const trip = response.trips[index];
                                const user = userResp.user;
                                
                                // Format dates
                                const startDate = new Date(trip.StartDate);
                                const endDate = new Date(trip.EndDate);
                                const formattedDates = `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()} - ${endDate.toLocaleDateString('en-US', { month: 'short' })} ${endDate.getDate()}, ${endDate.getFullYear()}`;
                                
                                // Parse interests
                                let interests;
                                try {
                                    interests = typeof trip.Interests === 'string' ? 
                                        JSON.parse(trip.Interests) : 
                                        trip.Interests || [];
                                } catch(e) {
                                    interests = [];
                                }
                                
                                locationTravelers.push({
                                    userId: user.UserID,
                                    name: `${user.FirstName} ${user.LastName.charAt(0)}.`,
                                    avatar: user.Avatar || user.FirstName.charAt(0),
                                    verified: user.Verified,
                                    dates: formattedDates,
                                    interests: interests,
                                    status: 'Solo traveler'
                                });
                            }
                        });
                        
                        travelers[locationId] = locationTravelers;
                    } else {
                        travelers[locationId] = [];
                    }
                } catch (error) {
                    console.error('Error fetching travelers:', error);
                    travelers[locationId] = [];
                }
            }
            
            // Clear loading indicator
            travelersList.innerHTML = '';
            
            // Display travelers
            if (travelers[locationId] && travelers[locationId].length > 0) {
                travelers[locationId].forEach(traveler => {
                    const travelerCard = document.createElement('div');
                    travelerCard.className = 'traveler-card';
                    
                    const interestsHTML = traveler.interests.map(interest => `
                        <div class="traveler-interest">${interest}</div>
                    `).join('');
                    
                    travelerCard.innerHTML = `
                        <div class="traveler-header">
                            <div class="traveler-avatar">${traveler.avatar}</div>
                            <div>
                                <div class="traveler-name">${traveler.name}</div>
                                <div class="traveler-status">${traveler.status} · ${traveler.verified ? 'Verified' : 'Basic'}</div>
                            </div>
                        </div>
                        <div class="traveler-dates">
                            <i class="fas fa-calendar"></i> ${traveler.dates}
                        </div>
                        <div class="traveler-interests">
                            ${interestsHTML}
                        </div>
                        <button class="connect-btn" data-user-id="${traveler.userId}">
                            <i class="fas fa-user-plus"></i> Connect
                        </button>
                    `;
                    
                    travelersList.appendChild(travelerCard);
                });
                
                // Add event listeners to connect buttons
                document.querySelectorAll('.connect-btn[data-user-id]').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const userId = btn.getAttribute('data-user-id');
                        
                        // Prevent connecting to self
                        if (userId === currentUser.UserID) {
                            alert('You cannot connect with yourself.');
                            return;
                        }
                        
                        // Show loading state
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
                        btn.disabled = true;
                        
                        try {
                            const response = await API.createInvite({
                                senderId: currentUser.UserID,
                                receiverId: userId,
                                message: 'I noticed we\'ll be in the same destination. Would you like to connect?',
                                sendEmail: true
                            });
                            
                            if (response.success) {
                                btn.innerHTML = '<i class="fas fa-check"></i> Invite Sent';
                                btn.style.backgroundColor = '#4ade80';
                            } else {
                                alert('Error sending invitation: ' + response.message);
                                btn.innerHTML = originalText;
                                btn.disabled = false;
                            }
                        } catch (error) {
                            console.error('Error sending invitation:', error);
                            alert('Network error. Please try again.');
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    });
                });
                
                // Animation for traveler cards
                setTimeout(() => {
                    const travelerCards = document.querySelectorAll('.traveler-card');
                    travelerCards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100 + (index * 100));
                    });
                }, 300);
            } else {
                // Show a message if no travelers are found
                travelersList.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                        <i class="fas fa-user-slash" style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 1rem; display: block;"></i>
                        <p>No travelers available for this location yet.</p>
                    </div>
                `;
            }
        });
    });
    
    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', () => {
            locationDetail.classList.remove('active');
            setTimeout(() => {
                locationDetail.style.display = 'none';
            }, 300);
        });
    }
    
    // Add animation for location cards
    const cards = document.querySelectorAll('.location-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        // Add event for Connect tab to animate cards entry
        if (tabs.length > 1) {
            tabs[1].addEventListener('click', () => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (index * 100));
            });
        }
    });
    
    // Camera tool hover effect
    const cameraTool = document.querySelector('.camera-tool');
    
    if (cameraTool) {
        cameraTool.addEventListener('mouseenter', () => {
            cameraTool.style.transform = 'scale(1.1)';
            cameraTool.style.boxShadow = '0 8px 25px rgba(0, 120, 255, 0.5)';
        });
        
        cameraTool.addEventListener('mouseleave', () => {
            cameraTool.style.transform = 'scale(1)';
            cameraTool.style.boxShadow = '0 5px 20px rgba(0, 120, 255, 0.4)';
        });
        
        cameraTool.addEventListener('click', () => {
            // Camera tool animation
            cameraTool.style.transform = 'scale(0.9)';
            setTimeout(() => {
                cameraTool.style.transform = 'scale(1.1)';
            }, 100);
            setTimeout(() => {
                cameraTool.style.transform = 'scale(1)';
            }, 200);
            
            // Show camera scan overlay - this would be implemented in a real app
            // Simply showing an alert for demonstration
            alert("Camera Recognition Tool activated! Take a photo of a landmark or location to identify it and find nearby travelers.");
        });
    }
    
    // Load channels and set up chat functionality
    const channelsList = document.querySelector('.channels-list');
    const chatContainer = document.querySelector('.chat-container');
    const chatTitle = document.querySelector('.chat-title');
    const onlineIndicator = document.querySelector('.online-indicator');
    const messagesContainer = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send');
    
    let currentChannelId = '';
    
    // Load all channels
    async function loadChannels() {
        if (!channelsList) return;
        
        try {
            const response = await API.getAllChannels();
            
            if (response.success && response.channels && response.channels.length > 0) {
                // Clear out the template channels except for the heading
                channelsList.innerHTML = '<h3>Destination Channels</h3>';
                
                // Add each channel
                response.channels.forEach((channel, index) => {
                    const channelItem = document.createElement('div');
                    channelItem.className = 'channel-item';
                    if (index === 0) channelItem.classList.add('active');
                    
                    // Fix for missing channel name - use Region as fallback or a generic name
                    const channelName = channel.Name || channel.Region || `Channel ${index + 1}`;
                    // Get appropriate icon based on region
                    const iconClass = getIconForRegion(channel.Region);
                    
                    channelItem.dataset.channelId = channel.ChannelID;
                    channelItem.innerHTML = `
                        <div class="channel-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="channel-name">${channelName}</div>
                        <div class="channel-count">${channel.MemberCount || '0'}</div>
                    `;
                    
                    channelItem.addEventListener('click', () => {
                        // Update active channel
                        document.querySelectorAll('.channel-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        channelItem.classList.add('active');
                        
                        // Load channel messages
                        loadChannelMessages(channel.ChannelID);
                        
                        // Update channel title and online indicator
                        if (chatTitle) chatTitle.textContent = channelName;
                        if (onlineIndicator) {
                            onlineIndicator.innerHTML = `
                                <div class="indicator-dot"></div>
                                ${channel.MemberCount || '0'} travelers online
                            `;
                        }
                    });
                    
                    channelsList.appendChild(channelItem);
                    
                    // Load messages for the first channel
                    if (index === 0) {
                        currentChannelId = channel.ChannelID;
                        if (chatTitle) chatTitle.textContent = channelName;
                        if (onlineIndicator) {
                            onlineIndicator.innerHTML = `
                                <div class="indicator-dot"></div>
                                ${channel.MemberCount || '0'} travelers online
                            `;
                        }
                        loadChannelMessages(channel.ChannelID);
                    }
                });
            } else {
                // Show empty state
                channelsList.innerHTML = `
                    <h3>Destination Channels</h3>
                    <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                        <i class="fas fa-globe" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>No channels available</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading channels:', error);
            // Show error state
            channelsList.innerHTML = `
                <h3>Destination Channels</h3>
                <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Error loading channels. Please try again.</p>
                </div>
            `;
        }
    }
    
    // Helper function to determine icon based on region
    function getIconForRegion(region) {
        if (!region) return 'fa-globe';
        
        region = region.toLowerCase();
        
        if (region.includes('asia') || region.includes('china') || region.includes('japan') || region.includes('korea')) {
            return 'fa-globe-asia';
        } else if (region.includes('europe')) {
            return 'fa-globe-europe';
        } else if (region.includes('america') || region.includes('usa') || region.includes('canada')) {
            return 'fa-globe-americas';
        } else if (region.includes('africa')) {
            return 'fa-globe-africa';
        } else if (region.includes('australia') || region.includes('oceania')) {
            return 'fa-globe-oceania';
        } else if (region.includes('caribbean')) {
            return 'fa-umbrella-beach';
        } else if (region.includes('mountain')) {
            return 'fa-mountain';
        } else if (region.includes('city')) {
            return 'fa-city';
        }
        
        return 'fa-globe';
    }
    
    // Load messages for a specific channel
    async function loadChannelMessages(channelId) {
        if (!messagesContainer) return;
        
        currentChannelId = channelId;
        
        // Show loading indicator
        messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                <div style="width: 30px; height: 30px; border: 2px solid rgba(255, 255, 255, 0.1); border-top-color: var(--text-secondary); border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite;"></div>
                <p>Loading messages...</p>
            </div>
        `;
        
        try {
            const response = await API.getChannelMessages(channelId, 50);
            
            // Clear the messages container
            messagesContainer.innerHTML = '';
            
            if (response.success && response.messages && response.messages.length > 0) {
                // Add each message
                response.messages.forEach(message => {
                    // Format time
                    const messageTime = new Date(message.Timestamp || message.SentAt);
                    const hours = messageTime.getHours();
                    const minutes = messageTime.getMinutes();
                    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
                    
                    // Determine if this is the current user's message
                    const isSentByCurrentUser = message.SenderID === currentUser.UserID;
                    
                    // Create message element
                    const messageEl = document.createElement('div');
                    messageEl.className = `message ${isSentByCurrentUser ? 'sent' : 'received'}`;
                    
                    if (isSentByCurrentUser) {
                        messageEl.innerHTML = `
                            <div class="message-content">
                                <p>${message.Content}</p>
                                <div class="message-time">${formattedTime}</div>
                            </div>
                        `;
                    } else {
                        // Get sender information
                        let senderName = 'Unknown User';
                        // Try to get sender name from message or sender object
                        if (message.sender && message.sender.name) {
                            senderName = message.sender.name;
                        } else if (message.SenderName) {
                            senderName = message.SenderName;
                        }
                        
                        messageEl.innerHTML = `
                            <div class="message-content">
                                <div class="message-sender">${senderName}</div>
                                <p>${message.Content}</p>
                                <div class="message-time">${formattedTime}</div>
                            </div>
                        `;
                    }
                    
                    messagesContainer.appendChild(messageEl);
                });
                
                // Scroll to the bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                // Show empty state
                messagesContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                        <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>No messages yet. Be the first to start the conversation!</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Error loading messages. Please try again.</p>
                </div>
            `;
        }
    }
    
    // Send a message
    async function sendMessage() {
        if (!chatInput || !currentChannelId) return;
        
        const messageContent = chatInput.value.trim();
        if (!messageContent) return;
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'message sent';
        
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
        
        messageEl.innerHTML = `
            <div class="message-content">
                <p>${messageContent}</p>
                <div class="message-time">${formattedTime}</div>
            </div>
        `;
        
        // Add the message to the UI
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(10px)';
        
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
            messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 10);
        
        // Clear the input
        chatInput.value = '';
        
        // Send the message to the API
        try {
            const response = await API.sendMessage({
                senderId: currentUser.UserID,
                channelId: currentChannelId,
                content: messageContent,
                type: 'text'
            });
            
            if (!response.success) {
                // Show error indication on the message
                messageEl.querySelector('.message-time').innerHTML += ' <i class="fas fa-exclamation-circle" title="Failed to send"></i>';
                console.error('Error sending message:', response.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Show an error indication on the message
            messageEl.querySelector('.message-time').innerHTML += ' <i class="fas fa-exclamation-circle" title="Failed to send"></i>';
        }
    }
    
    // Set up event listeners for sending messages
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Load channels on page load if on community tab
    if (document.querySelector('#community.content-section.active')) {
        loadChannels();
    }
    
    // Load channels when community tab is clicked
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === 'community') {
            tab.addEventListener('click', loadChannels);
        }
    });
    
    // Profile overlay functionality
    const profileTrigger = document.getElementById('profile-trigger');
    const profileOverlay = document.getElementById('profile-overlay');
    const closeProfile = document.querySelector('.close-profile');
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profileContentSections = document.querySelectorAll('.profile-content-section');
    
    // Open profile overlay
    if (profileTrigger && profileOverlay) {
        profileTrigger.addEventListener('click', () => {
            profileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }
    
    // Close profile overlay
    if (closeProfile && profileOverlay) {
        closeProfile.addEventListener('click', () => {
            profileOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Enable scrolling
        });
    }
    
    // Close overlay when clicking outside of content
    if (profileOverlay) {
        profileOverlay.addEventListener('click', (e) => {
            if (e.target === profileOverlay) {
                profileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Profile tab switching
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            profileTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding content
            const targetId = tab.getAttribute('data-profile-tab') + '-tab';
            profileContentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    setTimeout(() => {
                        section.classList.add('active');
                    }, 50);
                }
            });
        });
    });
    
    // Form handling
    const profileForm = document.getElementById('profile-form');
    const preferencesForm = document.getElementById('preferences-form');
    
    // Fill profile form with user data
    const user = Session.getUser();
    if (user && profileForm) {
        // Update avatar display
        const profileAvatar = document.querySelector('.profile-avatar-large');
        if (profileAvatar) {
            profileAvatar.textContent = user.FirstName ? user.FirstName.charAt(0) : 'U';
        }
        
        // Set form values
        if (user.FirstName) document.getElementById('firstName').value = user.FirstName;
        if (user.LastName) document.getElementById('lastName').value = user.LastName;
        if (user.Email) document.getElementById('email').value = user.Email;
        if (user.Phone) document.getElementById('phone').value = user.Phone;
        if (user.UserBio) document.getElementById('bio').value = user.UserBio;
        if (user.HomeLocation) document.getElementById('location').value = user.HomeLocation;
        
        // Set verification status
        const verificationStatus = document.querySelector('.verification-status');
        if (verificationStatus) {
            verificationStatus.innerHTML = user.Verified ? 
                '<i class="fas fa-check-circle"></i> Your profile is verified' : 
                '<i class="fas fa-info-circle"></i> Your profile is not verified';
            
            if (user.Verified) {
                verificationStatus.classList.add('verified');
            } else {
                verificationStatus.classList.remove('verified');
            }
        }
        
        // Set travel preferences
        if (preferencesForm) {
            // Set travel style checkboxes
            if (user.TravelStyle) {
                let travelStyles;
                try {
                    travelStyles = typeof user.TravelStyle === 'string' ? 
                        JSON.parse(user.TravelStyle) : user.TravelStyle;
                    
                    if (Array.isArray(travelStyles)) {
                        travelStyles.forEach(style => {
                            const checkbox = preferencesForm.querySelector(`input[name="travelStyle"][value="${style}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } catch (e) {
                    console.error('Error parsing travel style:', e);
                }
            }
            
            // Set accommodation preferences
            if (user.AccommodationPrefs) {
                let accommodationPrefs;
                try {
                    accommodationPrefs = typeof user.AccommodationPrefs === 'string' ? 
                        JSON.parse(user.AccommodationPrefs) : user.AccommodationPrefs;
                    
                    if (Array.isArray(accommodationPrefs)) {
                        accommodationPrefs.forEach(pref => {
                            const checkbox = preferencesForm.querySelector(`input[name="accommodation"][value="${pref}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } catch (e) {
                    console.error('Error parsing accommodation preferences:', e);
                }
            }
            
            // Set interests
            if (user.Interests) {
                let interests;
                try {
                    interests = typeof user.Interests === 'string' ? 
                        JSON.parse(user.Interests) : user.Interests;
                    
                    if (Array.isArray(interests) && interests.length > 0) {
                        const interestTagsEditor = document.querySelector('.interest-tags-editor');
                        const addInterestInput = document.querySelector('.add-interest-input');
                        
                        // Remove existing interest tags
                        const existingTags = interestTagsEditor.querySelectorAll('.interest-tag');
                        existingTags.forEach(tag => tag.remove());
                        
                        // Add interests from user profile
                        interests.forEach(interest => {
                            const newTag = document.createElement('div');
                            newTag.className = 'interest-tag';
                            newTag.innerHTML = `${interest} <i class="fas fa-times remove-tag"></i>`;
                            
                            // Insert before the input
                            if (addInterestInput) {
                                interestTagsEditor.insertBefore(newTag, addInterestInput);
                                
                                // Add event listener to new remove button
                                newTag.querySelector('.remove-tag').addEventListener('click', function() {
                                    this.parentElement.remove();
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing interests:', e);
                }
            }
            
            // Set sliders
            if (user.Budget) document.getElementById('budget').value = user.Budget;
            if (user.Pace) document.getElementById('pace').value = user.Pace;
            if (user.Planning) document.getElementById('planning').value = user.Planning;
            
            // Set privacy toggles
            if (user.ShareTravelDates !== undefined) {
                const shareToggle = preferencesForm.querySelector('input[name="shareTravelDates"]');
                if (shareToggle) shareToggle.checked = user.ShareTravelDates;
            }
            
            if (user.AllowConnectionRequests !== undefined) {
                const connectionsToggle = preferencesForm.querySelector('input[name="allowConnectionRequests"]');
                if (connectionsToggle) connectionsToggle.checked = user.AllowConnectionRequests;
            }
            
            if (user.ShowInSearch !== undefined) {
                const searchToggle = preferencesForm.querySelector('input[name="showInSearch"]');
                if (searchToggle) searchToggle.checked = user.ShowInSearch;
            }
        }
    }
    
    // Profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(profileForm);
            const profileData = {
                userId: user.UserID,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                bio: formData.get('bio'),
                homeLocation: formData.get('location')
            };
            
            // Show loading state
            const saveBtn = profileForm.querySelector('.save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
            
            try {
                const response = await API.updateUser(user.UserID, profileData);
                
                if (response.success) {
                    // Update user data in session
                    const updatedUser = { ...user };
                    updatedUser.FirstName = profileData.firstName;
                    updatedUser.LastName = profileData.lastName;
                    updatedUser.Email = profileData.email;
                    updatedUser.Phone = profileData.phone;
                    updatedUser.UserBio = profileData.bio;
                    updatedUser.HomeLocation = profileData.homeLocation;
                    
                    Session.setUser(updatedUser);
                    
                    // Update header avatar
                    document.getElementById('user-avatar-header').textContent = 
                        profileData.firstName.charAt(0);
                    
                    // Show success notification
                    showNotification('Profile updated successfully!');
                } else {
                    showNotification('Error updating profile: ' + response.message, true);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showNotification('Network error. Please try again.', true);
            } finally {
                // Restore button
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }
        });
    }
    
    // Preferences form submission
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(preferencesForm);
            const preferencesData = {
                userId: user.UserID,
                travelStyle: formData.getAll('travelStyle'),
                accommodationPrefs: formData.getAll('accommodation'),
                interests: Array.from(document.querySelectorAll('.interest-tag')).map(tag => 
                    tag.textContent.trim().replace(' ×', '')
                ),
                budget: formData.get('budget'),
                pace: formData.get('pace'),
                planning: formData.get('planning'),
                shareTravelDates: document.querySelector('input[name="shareTravelDates"]')?.checked || true,
                allowConnectionRequests: document.querySelector('input[name="allowConnectionRequests"]')?.checked || true,
                showInSearch: document.querySelector('input[name="showInSearch"]')?.checked || true
            };
            
            // Show loading state
            const saveBtn = preferencesForm.querySelector('.save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
            
            try {
                const response = await API.updateUser(user.UserID, preferencesData);
                
                if (response.success) {
                    // Update user data in session
                    const updatedUser = { ...user };
                    updatedUser.TravelStyle = JSON.stringify(preferencesData.travelStyle);
                    updatedUser.AccommodationPrefs = JSON.stringify(preferencesData.accommodationPrefs);
                    updatedUser.Interests = JSON.stringify(preferencesData.interests);
                    updatedUser.Budget = preferencesData.budget;
                    updatedUser.Pace = preferencesData.pace;
                    updatedUser.Planning = preferencesData.planning;
                    updatedUser.ShareTravelDates = preferencesData.shareTravelDates;
                    updatedUser.AllowConnectionRequests = preferencesData.allowConnectionRequests;
                    updatedUser.ShowInSearch = preferencesData.showInSearch;
                    
                    Session.setUser(updatedUser);
                    
                    // Show success notification
                    showNotification('Preferences updated successfully!');
                } else {
                    showNotification('Error updating preferences: ' + response.message, true);
                }
            } catch (error) {
                console.error('Error updating preferences:', error);
                showNotification('Network error. Please try again.', true);
            } finally {
                // Restore button
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }
        });
    }
    
    // Interest tags functionality
    const interestTagsEditor = document.querySelector('.interest-tags-editor');
    const addInterestInput = document.querySelector('.add-interest-input');
    
    if (interestTagsEditor && addInterestInput) {
        // Add new interest tag when Enter is pressed
        addInterestInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && addInterestInput.value.trim()) {
                const newTag = document.createElement('div');
                newTag.className = 'interest-tag';
                newTag.innerHTML = `${addInterestInput.value.trim()} <i class="fas fa-times remove-tag"></i>`;
                
                // Insert before the input
                interestTagsEditor.insertBefore(newTag, addInterestInput);
                
                // Clear input
                addInterestInput.value = '';
                
                // Add event listener to new remove button
                newTag.querySelector('.remove-tag').addEventListener('click', function() {
                    this.parentElement.remove();
                });
            }
        });
        
        // Remove interest tag when X is clicked
        document.querySelectorAll('.remove-tag').forEach(removeBtn => {
            removeBtn.addEventListener('click', function() {
                this.parentElement.remove();
            });
        });
    }
    
    // Load connections tab and invites
    const connectionsList = document.querySelector('.connections-list');
    const connectionsStats = document.querySelector('.connections-stats');
    const invitesContainer = document.querySelector('.invites-container');
    
    // Load user connections
    async function loadUserConnections() {
        if (!connectionsList) return;
        
        try {
            const response = await API.getUserConnections(user.UserID);
            
            // Clear existing connections
            connectionsList.innerHTML = '';
            
            if (response.success && response.connections && response.connections.length > 0) {
                response.connections.forEach(connection => {
                    // Get the other user from the connection
                    const otherUser = connection.otherUser || {};
                    
                    // Format the connection date
                    const connectedSince = new Date(connection.ConnectedSince);
                    const formattedDate = connectedSince.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                    });
                    
                    // Create connection item
                    const connectionItem = document.createElement('div');
                    connectionItem.className = 'connection-item';
                    connectionItem.innerHTML = `
                        <div class="connection-avatar">${otherUser.avatar || otherUser.firstName?.charAt(0) || 'U'}</div>
                        <div class="connection-info">
                            <h4>${otherUser.firstName || ''} ${otherUser.lastName || ''}</h4>
                            <p>Connected since ${formattedDate}</p>
                            <div class="connection-location">
                                <i class="fas fa-map-marker-alt"></i> ${otherUser.homeLocation || 'Location not specified'}
                            </div>
                        </div>
                        <div class="connection-actions">
                            <button class="message-btn" data-user-id="${otherUser.userId}">
                                <i class="fas fa-comment"></i>
                            </button>
                            <button class="more-options-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    `;
                    
                    connectionsList.appendChild(connectionItem);
                });
                
                // Add event listeners to message buttons
                document.querySelectorAll('.message-btn[data-user-id]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const userId = btn.getAttribute('data-user-id');
                        // TODO: Implement direct messaging
                        alert('Direct messaging will be implemented in a future update.');
                    });
                });
            } else {
                // Show empty state
                connectionsList.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                        <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>No connections yet. Find travelers in your destination to connect!</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading connections:', error);
            connectionsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Error loading connections. Please try again.</p>
                </div>
            `;
        }
    }
    
    // Load user invites
    async function loadUserInvites() {
        if (!invitesContainer) return;
        
        const receivedInvitesList = invitesContainer.querySelector('.invites-section:first-child .invites-list');
        const sentInvitesList = invitesContainer.querySelector('.invites-section:last-child .invites-list');
        
        if (!receivedInvitesList || !sentInvitesList) return;
        
        try {
            // Load received invites
            const receivedResponse = await API.getUserInvites(user.UserID, 'received');
            
            // Clear existing invites
            receivedInvitesList.innerHTML = '';
            
            if (receivedResponse.success && receivedResponse.invites && receivedResponse.invites.length > 0) {
                receivedResponse.invites.forEach(invite => {
                    // Skip invites that have already been responded to
                    if (invite.Status !== 'pending') return;
                    
                    // Get the other user from the invite
                    const otherUser = invite.otherUser || {};
                    
                    // Create invite item
                    const inviteItem = document.createElement('div');
                    inviteItem.className = 'invite-item';
                    inviteItem.dataset.inviteId = invite.InviteID;
                    
                    let tripInfo = '';
                    if (invite.trip) {
                        const startDate = new Date(invite.trip.startDate);
                        const endDate = new Date(invite.trip.endDate);
                        
                        const formattedStartDate = startDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        });
                        
                        const formattedEndDate = endDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        tripInfo = `
                            <span><i class="fas fa-map-marker-alt"></i> ${invite.trip.destination}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${formattedStartDate} - ${formattedEndDate}</span>
                        `;
                    }
                    
                    inviteItem.innerHTML = `
                        <div class="invite-avatar">${otherUser.avatar || otherUser.firstName?.charAt(0) || 'U'}</div>
                        <div class="invite-info">
                            <h4>${otherUser.firstName || ''} ${otherUser.lastName || ''} invited you to join their trip</h4>
                            <div class="invite-details">
                                ${tripInfo}
                            </div>
                            <p class="invite-message">"${invite.Message || 'Would you like to connect?'}"</p>
                        </div>
                        <div class="invite-actions">
                            <button class="accept-btn" data-invite-id="${invite.InviteID}">Accept</button>
                            <button class="decline-btn" data-invite-id="${invite.InviteID}">Decline</button>
                        </div>
                    `;
                    
                    receivedInvitesList.appendChild(inviteItem);
                });
                
                // Add event listeners to accept/decline buttons
                document.querySelectorAll('.accept-btn[data-invite-id]').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const inviteId = btn.getAttribute('data-invite-id');
                        const inviteItem = btn.closest('.invite-item');
                        
                        // Show loading state
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        btn.disabled = true;
                        const declineBtn = inviteItem.querySelector('.decline-btn');
                        if (declineBtn) declineBtn.disabled = true;
                        
                        try {
                            const response = await API.respondToInvite(inviteId, 'accept');
                            
                            if (response.success) {
                                // Update UI to show accepted state
                                inviteItem.style.opacity = '0.5';
                                setTimeout(() => {
                                    // In a real app, this would send data to backend
                                    inviteItem.innerHTML = `
                                        <div class="invite-avatar">${inviteItem.querySelector('.invite-avatar').textContent}</div>
                                        <div class="invite-info">
                                            <h4>${inviteItem.querySelector('h4').textContent}</h4>
                                            <div class="invite-details">
                                                ${inviteItem.querySelector('.invite-details').innerHTML}
                                            </div>
                                            <div class="invite-status accepted">
                                                <i class="fas fa-check-circle"></i> You have accepted this invite
                                            </div>
                                        </div>
                                        <div class="invite-actions">
                                            <button class="message-btn" style="width: auto; padding: 0.6rem 1rem;">
                                                <i class="fas fa-comment"></i> Message
                                            </button>
                                        </div>
                                    `;
                                    inviteItem.style.opacity = '1';
                                    
                                    // Reload connections
                                    loadUserConnections();
                                    loadConnectionStats();
                                }, 300);
                            } else {
                                alert('Error accepting invitation: ' + response.message);
                                // Restore buttons
                                btn.innerHTML = 'Accept';
                                btn.disabled = false;
                                if (declineBtn) declineBtn.disabled = false;
                            }
                        } catch (error) {
                            console.error('Error accepting invitation:', error);
                            alert('Network error. Please try again.');
                            // Restore buttons
                            btn.innerHTML = 'Accept';
                            btn.disabled = false;
                            if (declineBtn) declineBtn.disabled = false;
                        }
                    });
                });
                
                document.querySelectorAll('.decline-btn[data-invite-id]').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const inviteId = btn.getAttribute('data-invite-id');
                        const inviteItem = btn.closest('.invite-item');
                        
                        // Show loading state
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        btn.disabled = true;
                        const acceptBtn = inviteItem.querySelector('.accept-btn');
                        if (acceptBtn) acceptBtn.disabled = true;
                        
                        try {
                            const response = await API.respondToInvite(inviteId, 'decline');
                            
                            if (response.success) {
                                // Remove the invite with animation
                                inviteItem.style.opacity = '0.5';
                                setTimeout(() => {
                                    inviteItem.style.height = '0';
                                    inviteItem.style.padding = '0';
                                    inviteItem.style.margin = '0';
                                    inviteItem.style.overflow = 'hidden';
                                    setTimeout(() => {
                                        inviteItem.remove();
                                    }, 300);
                                }, 300);
                            } else {
                                alert('Error declining invitation: ' + response.message);
                                // Restore buttons
                                btn.innerHTML = 'Decline';
                                btn.disabled = false;
                                if (acceptBtn) acceptBtn.disabled = false;
                            }
                        } catch (error) {
                            console.error('Error declining invitation:', error);
                            alert('Network error. Please try again.');
                            // Restore buttons
                            btn.innerHTML = 'Decline';
                            btn.disabled = false;
                            if (acceptBtn) acceptBtn.disabled = false;
                        }
                    });
                });
            } else {
                // Show empty state
                receivedInvitesList.innerHTML = `
                    <div style="text-align: center; padding: 1rem; color: var(--text-tertiary);">
                        <p>No received invites</p>
                    </div>
                `;
            }
            
            // Load sent invites
            const sentResponse = await API.getUserInvites(user.UserID, 'sent');
            
            // Clear existing invites
            sentInvitesList.innerHTML = '';
            
            if (sentResponse.success && sentResponse.invites && sentResponse.invites.length > 0) {
                sentResponse.invites.forEach(invite => {
                    // Get the other user from the invite
                    const otherUser = invite.otherUser || {};
                    
                    // Create invite item
                    const inviteItem = document.createElement('div');
                    inviteItem.className = 'invite-item';
                    inviteItem.dataset.inviteId = invite.InviteID;
                    
                    let tripInfo = '';
                    if (invite.trip) {
                        const startDate = new Date(invite.trip.startDate);
                        const endDate = new Date(invite.trip.endDate);
                        
                        const formattedStartDate = startDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        });
                        
                        const formattedEndDate = endDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        tripInfo = `
                            <span><i class="fas fa-map-marker-alt"></i> ${invite.trip.destination}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${formattedStartDate} - ${formattedEndDate}</span>
                        `;
                    }
                    
                    // Determine status class and icon
                    let statusClass = 'pending';
                    let statusIcon = 'fa-clock';
                    let statusText = 'Pending response';
                    
                    if (invite.Status === 'accepted') {
                        statusClass = 'accepted';
                        statusIcon = 'fa-check-circle';
                        statusText = 'Accepted';
                    } else if (invite.Status === 'declined') {
                        statusClass = 'declined';
                        statusIcon = 'fa-times-circle';
                        statusText = 'Declined';
                    }
                    
                    inviteItem.innerHTML = `
                        <div class="invite-avatar">${otherUser.avatar || otherUser.firstName?.charAt(0) || 'U'}</div>
                        <div class="invite-info">
                            <h4>You invited ${otherUser.firstName || ''} ${otherUser.lastName || ''} to join your trip</h4>
                            <div class="invite-details">
                                ${tripInfo}
                            </div>
                            <p class="invite-message">"${invite.Message || 'Would you like to connect?'}"</p>
                            <div class="invite-status ${statusClass}">
                                <i class="fas ${statusIcon}"></i> ${statusText}
                            </div>
                        </div>
                        <div class="invite-actions">
                            ${invite.Status === 'pending' ? 
                                '<button class="cancel-btn" data-invite-id="' + invite.InviteID + '">Cancel</button>' : 
                                (invite.Status === 'accepted' ? 
                                    '<button class="message-btn" style="width: auto; padding: 0.6rem 1rem;"><i class="fas fa-comment"></i> Message</button>' : 
                                    '')}
                        </div>
                    `;
                    
                    sentInvitesList.appendChild(inviteItem);
                });
                
                // Add event listeners to cancel buttons
                document.querySelectorAll('.cancel-btn[data-invite-id]').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const inviteItem = this.closest('.invite-item');
                        inviteItem.style.opacity = '0.5';
                        setTimeout(() => {
                            inviteItem.style.height = '0';
                            inviteItem.style.padding = '0';
                            inviteItem.style.margin = '0';
                            inviteItem.style.overflow = 'hidden';
                            setTimeout(() => {
                                inviteItem.remove();
                            }, 300);
                        }, 300);
                    });
                });
            } else {
                // Show empty state
                sentInvitesList.innerHTML = `
                    <div style="text-align: center; padding: 1rem; color: var(--text-tertiary);">
                        <p>No sent invites</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading invites:', error);
        }
    }
    
    // Update connections stats
    async function loadConnectionStats() {
        if (!connectionsStats) return;
        
        const statCards = connectionsStats.querySelectorAll('.stat-card');
        
        try {
            // Get user connections and trips
            const connectionsResponse = await API.getUserConnections(user.UserID);
            const tripsResponse = await API.getUserTrips(user.UserID);
            
            // Count connections
            const activeConnections = connectionsResponse.success ? 
                connectionsResponse.connections.length : 0;
            
            // Count upcoming trips
            const now = new Date();
            const upcomingTrips = tripsResponse.success ? 
                tripsResponse.trips.filter(trip => new Date(trip.EndDate) >= now).length : 0;
            
            // Get countries visited from user profile
            let countriesVisited = 0;
            if (user.CountriesVisited) {
                try {
                    if (typeof user.CountriesVisited === 'string') {
                        const countries = JSON.parse(user.CountriesVisited);
                        countriesVisited = countries.length;
                    } else if (Array.isArray(user.CountriesVisited)) {
                        countriesVisited = user.CountriesVisited.length;
                    }
                } catch (e) {
                    console.error('Error parsing countries visited:', e);
                }
            }
            
            // Update stat cards
            statCards.forEach((card, index) => {
                const statNumber = card.querySelector('.stat-number');
                if (statNumber) {
                    if (index === 0) statNumber.textContent = activeConnections;
                    if (index === 1) statNumber.textContent = upcomingTrips;
                    if (index === 2) statNumber.textContent = countriesVisited;
                }
            });
        } catch (error) {
            console.error('Error loading connection stats:', error);
        }
    }
    
    // Load connections and invites when profile tabs are clicked
    if (profileTabs.length > 0) {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-profile-tab');
                
                if (tabId === 'connections') {
                    loadUserConnections();
                    loadConnectionStats();
                } else if (tabId === 'invites') {
                    loadUserInvites();
                }
            });
        });
    }
    
    // Connect filter tabs functionality
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // In a real app, this would filter the travelers list
            // For demo, just show a visual effect
            const travelers = document.querySelectorAll('.traveler-card');
            travelers.forEach(traveler => {
                traveler.style.opacity = '0.5';
                traveler.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    traveler.style.opacity = '1';
                    traveler.style.transform = 'scale(1)';
                }, 300);
            });
        });
    });
    
    // Function to show a notification
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.background = isError ? 'var(--secondary)' : 'var(--primary)';
        notification.style.color = 'white';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        notification.style.zIndex = '3000';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '0.5rem';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        notification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Animate notification in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Add keyframes for animations
    if (!document.querySelector('#animation-keyframes')) {
        const keyframes = document.createElement('style');
        keyframes.id = 'animation-keyframes';
        keyframes.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(keyframes);
    }
});