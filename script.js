/**
 * Enhanced Search Animation System for Cluster
 * Provides smooth, continuous status updates during search process
 */

// Track current search status
let currentSearchStatus = {
  message: '',
  progress: 0,
  isSearching: false
};

/**
 * Initialize search loading UI elements
 */
function initSearchAnimation() {
  // Create progress bar element if it doesn't exist
  const searchLoading = document.getElementById('search-loading');
  if (!searchLoading) return;
  
  // Clear existing content
  searchLoading.innerHTML = '';
  
  // Create text container for smooth transitions
  const textContainer = document.createElement('div');
  textContainer.className = 'search-loading-text';
  
  const statusContainer = document.createElement('div');
  statusContainer.className = 'search-loading-text-container';
  textContainer.appendChild(statusContainer);
  
  // Initial status message
  const initialStatus = document.createElement('div');
  initialStatus.className = 'search-status-message';
  initialStatus.textContent = 'Initializing search...';
  statusContainer.appendChild(initialStatus);
  
  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'search-loading-progress';
  
  // Create actual progress bar that will animate
  const progressBar = document.createElement('div');
  progressBar.className = 'search-progress-bar';
  progressBar.style.width = '0%';
  progressContainer.appendChild(progressBar);
  
  // Create status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'search-loading-status';
  statusIndicator.textContent = 'Processing your query';
  
  // Add all elements to loading container
  searchLoading.appendChild(textContainer);
  searchLoading.appendChild(progressContainer);
  searchLoading.appendChild(statusIndicator);
}

/**
 * Update the search progress with smooth animation
 * @param {string} message - The new status message
 * @param {number} progress - The progress percentage (0-100)
 */
function updateSearchProgress(message, progress) {
  const searchLoading = document.getElementById('search-loading');
  if (!searchLoading) return;
  
  // Get or create container elements
  let statusContainer = searchLoading.querySelector('.search-loading-text-container');
  let progressBar = searchLoading.querySelector('.search-progress-bar');
  let statusIndicator = searchLoading.querySelector('.search-loading-status');
  
  if (!statusContainer || !progressBar || !statusIndicator) {
    initSearchAnimation();
    statusContainer = searchLoading.querySelector('.search-loading-text-container');
    progressBar = searchLoading.querySelector('.search-progress-bar');
    statusIndicator = searchLoading.querySelector('.search-loading-status');
  }
  
  // If this is a new message, animate the transition
  if (currentSearchStatus.message !== message) {
    // Mark the current message as exiting
    const currentMessages = statusContainer.querySelectorAll('.search-status-message');
    currentMessages.forEach(msg => {
      msg.classList.add('exiting');
      
      // Remove after animation completes
      setTimeout(() => {
        msg.remove();
      }, 300);
    });
    
    // Create and add the new message
    const newMessage = document.createElement('div');
    newMessage.className = 'search-status-message';
    newMessage.textContent = message;
    
    // Slight delay to ensure messages don't overlap during animation
    setTimeout(() => {
      statusContainer.appendChild(newMessage);
    }, 150);
    
    // Update current status
    currentSearchStatus.message = message;
  }
  
  // Update progress bar with smooth transition
  progressBar.style.width = `${progress}%`;
  currentSearchStatus.progress = progress;
  
  // Update additional details based on progress
  if (progress < 30) {
    statusIndicator.textContent = 'Processing your query';
  } else if (progress < 60) {
    statusIndicator.textContent = 'Finding matches';
  } else if (progress < 90) {
    statusIndicator.textContent = 'Preparing results';
  } else {
    statusIndicator.textContent = 'Almost done';
  }
}

/**
 * Show the search loading UI
 */
function showSearchLoading() {
  const searchLoading = document.getElementById('search-loading');
  if (searchLoading) {
    initSearchAnimation();
    searchLoading.style.display = 'flex';
    currentSearchStatus.isSearching = true;
  }
}

/**
 * Hide the search loading UI with fade out effect
 */
function hideSearchLoading() {
  const searchLoading = document.getElementById('search-loading');
  if (searchLoading) {
    // Add fade out class
    searchLoading.style.opacity = '0';
    
    // Hide after transition
    setTimeout(() => {
      searchLoading.style.display = 'none';
      searchLoading.style.opacity = '1';
    }, 300);
    
    currentSearchStatus.isSearching = false;
  }
}

/**
 * Get appropriate icon for a keyword or region
 * @param {string} keyword - The keyword or region
 * @returns {string} - The appropriate Font Awesome icon class
 */
function getIconForKeyword(keyword) {
  if (!keyword) return 'fa-search';
  
  const lcKeyword = keyword.toLowerCase();
  
  const iconMap = {
    // Regions
    'asia': 'fa-globe-asia',
    'europe': 'fa-globe-europe',
    'america': 'fa-globe-americas',
    'africa': 'fa-globe-africa',
    'australia': 'fa-globe-oceania',
    
    // Nature
    'beach': 'fa-umbrella-beach',
    'mountain': 'fa-mountain',
    'forest': 'fa-tree',
    'island': 'fa-island-tropical',
    'lake': 'fa-water',
    
    // Activities
    'hiking': 'fa-hiking',
    'food': 'fa-utensils',
    'culture': 'fa-landmark',
    'museum': 'fa-museum',
    'photography': 'fa-camera',
    'adventure': 'fa-compass',
    
    // Accommodation
    'hotel': 'fa-hotel',
    'hostel': 'fa-bed',
    'camping': 'fa-campground',
    
    // Travel style
    'luxury': 'fa-gem',
    'budget': 'fa-money-bill-wave',
    'solo': 'fa-user',
    'group': 'fa-users',
    
    // Default
    'destination': 'fa-map-marker-alt',
    'location': 'fa-map-marker-alt',
    'city': 'fa-city'
  };
  
  // Look for matches in the keyword
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lcKeyword.includes(key)) {
      return icon;
    }
  }
  
  return 'fa-globe'; // Default icon
}

/**
 * Create enhanced search result card with refined design
 * @param {Object} destination - Destination data
 * @returns {HTMLElement} The card element
 */
function createEnhancedSearchResultCard(destination) {
  const card = document.createElement('div');
  card.className = 'destination-card';
  card.dataset.id = destination.id;
  
  // Create icon with better visual treatment
  const icon = getIconForKeyword(destination.matchedKeywords[0]?.keyword || 'location');
  
  // Create confidence indicator based on score
  const confidenceScore = Math.min(100, Math.round((destination.score / 30) * 100));
  const confidenceClass = confidenceScore > 80 ? 'high' : (confidenceScore > 50 ? 'medium' : 'low');
  
  // Format description text
  const description = destination.description || '';
  const shortDesc = description.length > 60 ? description.substring(0, 60) + '...' : description;
  
  // Build card HTML with refined design
  card.innerHTML = `
    <div class="destination-card-header">
      <div class="destination-card-icon">
        <i class="fas ${icon}"></i>
      </div>
      <h4 class="destination-card-title">
        ${destination.name}
        <span class="confidence-score ${confidenceClass}">
          <i class="fas fa-chart-line"></i> ${confidenceScore}%
        </span>
      </h4>
    </div>
    <div class="destination-card-description">${shortDesc}</div>
    <div class="keyword-tags">
      ${destination.matchedKeywords.slice(0, 3).map(k => 
        `<span class="keyword-tag ${k.score > 8 ? 'highlight' : ''}">${k.keyword}</span>`
      ).join('')}
    </div>
    <div class="destination-card-stats">
      <div class="destination-card-stat">
        <i class="fas fa-user"></i> ${destination.travelerCount || '0'} travelers
      </div>
      <div class="destination-card-stat">
        <i class="fas fa-map-marker-alt"></i> ${destination.region || 'Global'}
      </div>
    </div>
  `;
  
  // Add click event
  card.addEventListener('click', (event) => {
    // Add visual feedback
    card.classList.add('selecting');
    
    // Handle selection
    setTimeout(() => {
      handleDestinationSelection(destination);
      card.classList.remove('selecting');
    }, 200);
    
    // Add ripple effect
    addRippleEffect(card, event);
  });
  
  return card;
}

/**
 * Add ripple effect to interactive elements
 * @param {HTMLElement} element - The element to add the effect to
 * @param {Event} event - The click event
 */
function addRippleEffect(element, event) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  // Position the ripple where the click occurred
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  element.appendChild(ripple);
  
  // Remove the ripple after animation completes
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Perform enhanced smart search using Claude AI
 * @param {string} query - The search query
 */
async function performEnhancedSearch(query) {
  // Begin search UI animation
  showSearchLoading();
  
  // Step 1: Initializing the search (0-20%)
  updateSearchProgress('Initializing smart search...', 10);
  
  // Add search mode class to discover section right away to start transition
  const discoverSection = document.querySelector('#discover');
  if (discoverSection) {
    discoverSection.classList.add('search-active');
  }
  
  // Step 2: Analyzing query (20-40%)
  setTimeout(() => {
    updateSearchProgress('Analyzing your query with AI...', 30);
  }, 400);
  
  try {
    // Step 3: Call Claude API (40-60%)
    setTimeout(() => {
      updateSearchProgress('Processing semantic meaning...', 50);
    }, 800);
    
    // Step 4: Mapping to database keywords (60-80%)
    setTimeout(() => {
      updateSearchProgress('Mapping to destination database...', 70);
    }, 1200);
    
    // Call Claude API or other search functionality here
    const keywordScores = await analyzeQueryWithClaude(query);
    
    // Find matching destinations based on keyword scores
    const matchedDestinations = findMatchingDestinations(keywordScores);
    
    // Step 5: Finalizing results (80-100%)
    setTimeout(() => {
      updateSearchProgress('Finalizing results...', 90);
    }, 1600);
    
    // Display the results with final animation
    setTimeout(() => {
      hideSearchLoading();
      displaySearchResults(matchedDestinations, query, keywordScores);
    }, 2000);
    
  } catch (error) {
    console.error('Error in enhanced search:', error);
    
    // Show error state
    updateSearchProgress('Search error occurred', 100);
    
    // Hide error after delay
    setTimeout(() => {
      hideSearchLoading();
      clearSearchMode();
    }, 2000);
  }
}

/**
 * Clear search mode and reset the UI
 */
function clearSearchMode() {
  // Find discover section and remove search-active class
  const discoverSection = document.querySelector('#discover');
  if (discoverSection) {
    discoverSection.classList.remove('search-active');
  }
  
  // Hide search results container
  const searchResultsContainer = document.querySelector('.search-results-container');
  if (searchResultsContainer) {
    searchResultsContainer.classList.remove('active');
    // Hide after animation completes
    setTimeout(() => {
      searchResultsContainer.style.display = 'none';
    }, 400);
  }
  
  // Restore trending list to center position
  const trendingList = document.querySelector('.trending-list');
  if (trendingList) {
    trendingList.style.transform = '';
  }
}

/**
 * Analyze search query with Claude AI (or simulated for demo)
 * @param {string} query - The search query
 * @returns {Object} - Keyword scores object
 */
async function analyzeQueryWithClaude(query) {
  // In a real implementation, this would call the Claude API
  // For demo purposes, we'll simulate the response with a delay
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate some keyword extraction based on query
      const lcQuery = query.toLowerCase();
      const keywordScores = {};
      
      // List of possible keywords to match against
      const possibleKeywords = [
        'beach', 'mountain', 'city', 'rural', 'adventure', 'relaxation', 
        'culture', 'food', 'nature', 'history', 'photography', 'hiking',
        'asia', 'europe', 'africa', 'north america', 'south america',
        'luxury', 'budget', 'family', 'solo', 'couples', 'backpacking',
        'summer', 'winter', 'spring', 'fall'
      ];
      
      // Simple algorithm to score keywords based on query
      possibleKeywords.forEach(keyword => {
        if (lcQuery.includes(keyword)) {
          // Direct match gets high score
          keywordScores[keyword] = 10;
        } else {
          // Check for partial matches or related concepts
          const words = lcQuery.split(/\s+/);
          let score = 0;
          
          // Check word by word
          words.forEach(word => {
            // Check similarity
            if (word.length > 3 && keyword.includes(word)) {
              score += 5;
            }
            
            // Add some related concept matching
            const relatedConcepts = {
              'beach': ['ocean', 'sea', 'sand', 'swim', 'coast', 'shore', 'tropical'],
              'mountain': ['peak', 'hiking', 'trek', 'climb', 'altitude', 'valley', 'hill'],
              'city': ['urban', 'metropolitan', 'downtown', 'skyline', 'architecture'],
              'culture': ['history', 'tradition', 'heritage', 'art', 'museum', 'local'],
              'food': ['cuisine', 'restaurant', 'culinary', 'gastronomy', 'eat', 'dining'],
              'photography': ['photo', 'camera', 'picture', 'instagram', 'scenic', 'view']
            };
            
            if (relatedConcepts[keyword] && relatedConcepts[keyword].includes(word)) {
              score += 7;
            }
          });
          
          if (score > 0) {
            keywordScores[keyword] = score;
          }
        }
      });
      
      // Add some random scores if no match found to avoid empty results
      if (Object.keys(keywordScores).length < 3) {
        const randomKeywords = ['beach', 'mountain', 'culture', 'food', 'adventure'];
        randomKeywords.forEach(keyword => {
          if (!keywordScores[keyword]) {
            keywordScores[keyword] = Math.floor(Math.random() * 6) + 3;
          }
        });
      }
      
      resolve(keywordScores);
    }, 800); // Simulate some processing time
  });
}

/**
 * Find matching destinations based on keyword scores
 * @param {Object} keywordScores - Keywords and their relevance scores
 * @returns {Array} - Matched destinations
 */
async function findMatchingDestinations(keywordScores) {
  // In a real implementation, this would query your database
  // For demo purposes, we'll use a sample dataset
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sample destinations data
      const destinationsData = [
        {
          id: 'bali-indonesia',
          name: 'Bali, Indonesia',
          description: 'Tropical paradise with stunning beaches, rice terraces, and vibrant culture.',
          region: 'Southeast Asia',
          travelerCount: 248,
          trendingPercentage: 15,
          keywords: ['beach', 'culture', 'nature', 'food', 'photography', 'spiritual'],
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'
        },
        {
          id: 'tokyo-japan',
          name: 'Tokyo, Japan',
          description: 'Modern metropolis blending traditional culture with futuristic innovation.',
          region: 'Asia',
          travelerCount: 212,
          trendingPercentage: 12,
          keywords: ['city', 'culture', 'food', 'technology', 'shopping', 'photography'],
          image: 'https://images.unsplash.com/photo-1528164344705-47542687000d'
        },
        {
          id: 'barcelona-spain',
          name: 'Barcelona, Spain',
          description: 'Vibrant coastal city famous for Gaudí architecture and Mediterranean beaches.',
          region: 'Europe',
          travelerCount: 186,
          trendingPercentage: 8,
          keywords: ['beach', 'city', 'culture', 'food', 'architecture', 'art'],
          image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216'
        },
        {
          id: 'kyoto-japan',
          name: 'Kyoto, Japan',
          description: 'Ancient capital with thousands of temples, shrines, and traditional gardens.',
          region: 'Asia',
          travelerCount: 154,
          trendingPercentage: 9,
          keywords: ['culture', 'history', 'temples', 'nature', 'tradition', 'photography'],
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'
        },
        {
          id: 'santorini-greece',
          name: 'Santorini, Greece',
          description: 'Stunning volcanic island with white-washed buildings and blue domes.',
          region: 'Europe',
          travelerCount: 198,
          trendingPercentage: 14,
          keywords: ['beach', 'island', 'photography', 'luxury', 'couples', 'architecture'],
          image: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713'
        },
        {
          id: 'machu-picchu-peru',
          name: 'Machu Picchu, Peru',
          description: 'Ancient Incan citadel set high in the Andes Mountains.',
          region: 'South America',
          travelerCount: 143,
          trendingPercentage: 7,
          keywords: ['history', 'mountain', 'hiking', 'adventure', 'ruins', 'photography'],
          image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377'
        },
        {
          id: 'reykjavik-iceland',
          name: 'Reykjavik, Iceland',
          description: 'Gateway to dramatic landscapes of volcanoes, geysers, and hot springs.',
          region: 'Europe',
          travelerCount: 136,
          trendingPercentage: 18,
          keywords: ['nature', 'adventure', 'photography', 'hiking', 'winter', 'northern lights'],
          image: 'https://images.unsplash.com/photo-1490198562595-d43e959ba64a'
        },
        {
          id: 'new-york-usa',
          name: 'New York City, USA',
          description: 'Iconic metropolis known for skyscrapers, Broadway, and cultural diversity.',
          region: 'North America',
          travelerCount: 225,
          trendingPercentage: 6,
          keywords: ['city', 'culture', 'food', 'art', 'shopping', 'architecture'],
          image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'
        },
        {
          id: 'marrakech-morocco',
          name: 'Marrakech, Morocco',
          description: 'Historic city with vibrant markets, gardens, and palaces.',
          region: 'Africa',
          travelerCount: 128,
          trendingPercentage: 11,
          keywords: ['culture', 'food', 'history', 'shopping', 'architecture', 'photography'],
          image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43'
        },
        {
          id: 'costa-rica',
          name: 'Costa Rica',
          description: 'Tropical paradise known for rainforests, beaches, and abundant wildlife.',
          region: 'Central America',
          travelerCount: 162,
          trendingPercentage: 16,
          keywords: ['nature', 'beach', 'adventure', 'wildlife', 'hiking', 'photography'],
          image: 'https://images.unsplash.com/photo-1623866530982-3b26e0b17b6d'
        }
      ];
      
      // Score each destination based on keyword matches
      const scoredDestinations = destinationsData.map(destination => {
        let totalScore = 0;
        const matchedKeywords = [];
        
        // Check each destination keyword against our scored keywords
        destination.keywords.forEach(destKeyword => {
          for (const [queryKeyword, score] of Object.entries(keywordScores)) {
            if (destKeyword.includes(queryKeyword) || queryKeyword.includes(destKeyword)) {
              totalScore += score;
              matchedKeywords.push({
                keyword: destKeyword,
                score: score
              });
            }
          }
        });
        
        // Add regional biases if applicable
        for (const [queryKeyword, score] of Object.entries(keywordScores)) {
          if (destination.region.toLowerCase().includes(queryKeyword)) {
            totalScore += score * 1.5; // Region matches are weighted higher
            matchedKeywords.push({
              keyword: destination.region,
              score: score * 1.5
            });
          }
        }
        
        // Sort matched keywords by score (highest first)
        matchedKeywords.sort((a, b) => b.score - a.score);
        
        return {
          ...destination,
          score: totalScore,
          matchedKeywords
        };
      });
      
      // Filter destinations with non-zero scores and sort by score
      const matchedDestinations = scoredDestinations
        .filter(dest => dest.score > 0)
        .sort((a, b) => b.score - a.score);
      
      resolve(matchedDestinations);
    }, 600); // Simulate database query time
  });
}

/**
 * Update the search results display in map overlay
 * @param {Array} destinations - Array of matching destinations
 * @param {string} query - The original search query
 * @param {Object} keywordScores - The keyword scores from Claude
 */
function updateMapOverlayWithSearchResults(destinations, query, keywordScores) {
  // Get the containers
  const discoverSection = document.querySelector('#discover');
  const discoverGrid = document.querySelector('.discover-grid');
  
  // Remove any existing search results containers
  const existingContainer = document.querySelector('.search-results-container');
  if (existingContainer) {
    existingContainer.classList.remove('active');
    setTimeout(() => {
      existingContainer.remove();
    }, 300);
  }
  
  // Create new search results container
  const searchResultsContainer = document.createElement('div');
  searchResultsContainer.className = 'search-results-container';
  
  // Add title
  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'section-title';
  sectionTitle.textContent = `Search Results for "${query}"`;
  searchResultsContainer.appendChild(sectionTitle);
  
  // Create destination cards container
  const searchDestinationCards = document.createElement('div');
  searchDestinationCards.id = 'search-destination-cards';
  searchResultsContainer.appendChild(searchDestinationCards);
  
  // Add the new container to the discover grid
  discoverGrid.prepend(searchResultsContainer);
  
  // Ensure search-active class is applied to discover section
  if (discoverSection) {
    discoverSection.classList.add('search-active');
  }
  
  // Clear previous cards
  searchDestinationCards.innerHTML = '';
  
  // Show the search results container with active class
  searchResultsContainer.style.display = 'block';
  
  // Use setTimeout to trigger the transition after the container is added to the DOM
  setTimeout(() => {
    searchResultsContainer.classList.add('active');
  }, 10);
  
  // No results case
  if (destinations.length === 0) {
    const noResultsCard = document.createElement('div');
    noResultsCard.className = 'destination-card no-results';
    noResultsCard.innerHTML = `
      <div class="destination-card-header">
        <div class="destination-card-icon">
          <i class="fas fa-search"></i>
        </div>
        <h4 class="destination-card-title">No matches found</h4>
      </div>
      <div class="destination-card-description">Try different search terms or explore trending destinations</div>
    `;
    searchDestinationCards.appendChild(noResultsCard);
    return;
  }
  
  // Add destination cards for each search result with staggered animation
  destinations.forEach((destination, index) => {
    setTimeout(() => {
      const card = createEnhancedSearchResultCard(destination);
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      searchDestinationCards.appendChild(card);
      
      // Trigger animation after a brief delay
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, index * 100); // Stagger the cards
  });
}

/**
 * Display search results throughout the UI
 * @param {Array} destinations - Array of matching destinations
 * @param {string} query - The original search query
 * @param {Object} keywordScores - The keyword scores from Claude
 */
function displaySearchResults(destinations, query, keywordScores) {
  // Log detailed search results for debugging
  console.log('Search results for:', query);
  console.log('Keyword scores:', keywordScores);
  console.log('Matched destinations:', destinations);
  
  // Update map overlay UI with search results
  updateMapOverlayWithSearchResults(destinations, query, keywordScores);
  
  // Get top keywords for explanation
  const topKeywords = Object.entries(keywordScores)
    .sort((a, b) => b[1] - a[1])
    .filter(entry => entry[1] > 5)
    .slice(0, 3)
    .map(entry => entry[0]);
  
  // Also update the dropdown search results if available
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    // Clear previous results
    searchResults.innerHTML = '';
    
    // Create a dynamic header explaining the search results
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header';
    searchHeader.innerHTML = `
      <div class="search-header-title">
        <i class="fas fa-search-location"></i> Search Results
        <span class="search-query">${query}</span>
      </div>
    `;
    searchResults.appendChild(searchHeader);
    
    // Show explanation if we have top keywords
    if (topKeywords.length > 0) {
      const explanationItem = document.createElement('div');
      explanationItem.className = 'search-result-item search-explanation';
      explanationItem.innerHTML = `
        <div class="search-result-icon">
          <i class="fas fa-brain"></i>
        </div>
        <div class="search-result-info">
          <div class="search-result-title">AI-Powered Search</div>
          <div class="search-result-description">
            Your query matches best with: 
            <div class="keyword-tags">
              ${topKeywords.map(keyword => 
                `<span class="search-result-match"><i class="fas fa-tag"></i> ${keyword}</span>`
              ).join('')}
            </div>
          </div>
        </div>
      `;
      searchResults.appendChild(explanationItem);
    }
    
    // Add destination results to dropdown with staggered animation
    if (destinations.length > 0) {
      destinations.slice(0, 5).forEach((destination, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.style.animationDelay = `${index * 0.05}s`;
        
        // Get icon based on top keyword or use the destination's icon
        const topKeyword = destination.matchedKeywords[0]?.keyword || 'city';
        const icon = getIconForKeyword(topKeyword);
        
        // Format matched keywords for display
        const keywordText = destination.matchedKeywords
          .slice(0, 3)
          .map(k => {
            // Use different styling for high-scoring matches
            const highScore = k.score > 8;
            return `<span class="search-result-match ${highScore ? 'high-score' : ''}">
              ${k.keyword}${highScore ? ' <i class="fas fa-star"></i>' : ''}
            </span>`;
          })
          .join('');
        
        // Create HTML for the result item with enhanced visual display
        resultItem.innerHTML = `
          <div class="search-result-icon" data-region="${destination.region || 'unknown'}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="search-result-info">
            <div class="search-result-title">${destination.name}</div>
            <div class="search-result-description">
              ${destination.description ? 
                `<div class="destination-description">${destination.description.substring(0, 60)}${destination.description.length > 60 ? '...' : ''}</div>` 
                : ''}
              <div class="keyword-container">
                ${keywordText}
              </div>
              ${destination.region ? 
                `<div class="destination-region"><i class="fas fa-map-marker-alt"></i> ${destination.region}</div>` 
                : ''}
            </div>
          </div>
          ${destination.image ? 
            `<div class="search-result-image" style="background-image: url('${destination.image}');"></div>` 
            : ''}
        `;
        
        // Add click handler
        resultItem.addEventListener('click', () => {
          // Add selection effect
          resultItem.classList.add('selecting');
          
          // Handle the actual selection
          setTimeout(() => {
            handleDestinationSelection(destination);
            // Hide the dropdown
            searchResults.style.display = 'none';
          }, 300);
        });
        
        searchResults.appendChild(resultItem);
      });
    } else {
      // No results found
      const noResultsItem = document.createElement('div');
      noResultsItem.className = 'search-result-item no-results';
      noResultsItem.innerHTML = `
        <div class="search-result-icon">
          <i class="fas fa-search-minus"></i>
        </div>
        <div class="search-result-info">
          <div class="search-result-title">No matches found</div>
          <div class="search-result-description">
            <p>Try using broader terms or check trending destinations</p>
          </div>
        </div>
      `;
      searchResults.appendChild(noResultsItem);
    }
    
    // Show results container
    searchResults.style.display = 'block';
  }
}

/**
 * Handle destination selection
 * @param {Object} destination - The selected destination
 */
function handleDestinationSelection(destination) {
  console.log('Selected destination:', destination);
  
  // In a real app, this would navigate to the destination page
  // or open a destination detail modal
  
  // For demo, we'll show an alert
  alert(`You selected ${destination.name}. In a real app, this would take you to the destination page.`);
  
  // Clear search mode
  clearSearchMode();
}

// Initialize search UI when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Set up search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        performEnhancedSearch(this.value.trim());
      }
    });
    
    // Add focus listener to show dropdown
    searchInput.addEventListener('focus', function() {
      const searchResults = document.getElementById('search-results');
      if (searchResults && this.value.trim().length > 0) {
        searchResults.style.display = 'block';
      }
    });
  }
  
  // Add click outside listener to hide dropdown
  document.addEventListener('click', function(e) {
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('search-input');
    
    if (searchResults && 
        !searchResults.contains(e.target) && 
        searchInput && 
        !searchInput.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
  
  // Initialize search loading container
  initSearchAnimation();
  
  // Initialize trending destinations
  populateTrendingDestinations();
  
  // Override the original search function
  window.performSmartSearch = performEnhancedSearch;
  
  // Modify the search input to only search when Enter key is pressed
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    // Remove the existing event listeners that might trigger search on input
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Add a keydown event listener for Enter key
    newSearchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim().length > 0) {
        e.preventDefault();
        performEnhancedSearch(this.value.trim());
      }
    });
  }
});

/**
 * Populate trending destinations in the UI
 */
function populateTrendingDestinations() {
  const trendingList = document.querySelector('.trending-list');
  if (!trendingList) return;
  
  // Sample destinations data (in a real app, this would come from the API)
  const trendingDestinations = [
    {
      id: 'bali-indonesia',
      name: 'Bali, Indonesia',
      description: 'Tropical paradise with beaches, rice terraces and spiritual retreats',
      icon: 'fa-umbrella-beach',
      travelerCount: 248,
      trendingPercentage: 15
    },
    {
      id: 'patagonia-chile',
      name: 'Patagonia, Chile',
      description: 'Epic landscapes and outdoor adventures in southern South America',
      icon: 'fa-mountain',
      travelerCount: 186,
      trendingPercentage: 22
    },
    {
      id: 'kyoto-japan',
      name: 'Kyoto, Japan',
      description: 'Ancient temples, traditional gardens and cultural heritage',
      icon: 'fa-landmark',
      travelerCount: 205,
      trendingPercentage: 12
    },
    {
      id: 'santorini-greece',
      name: 'Santorini, Greece',
      description: 'Iconic white and blue buildings with stunning Aegean views',
      icon: 'fa-water',
      travelerCount: 274,
      trendingPercentage: 20
    },
    {
      id: 'lisbon-portugal',
      name: 'Lisbon, Portugal',
      description: 'Europe\'s sunniest capital with historic charm and coastal beauty',
      icon: 'fa-city',
      travelerCount: 312,
      trendingPercentage: 18
    }
  ];
  
  // We'll handle clearing in the next steps
  
  // Create and append destination items
  // First clear existing items, keeping the heading
  const heading = trendingList.querySelector('h3');
  if (heading) {
    trendingList.innerHTML = '';
    trendingList.appendChild(heading);
  } else {
    trendingList.innerHTML = '<h3>Trending Destinations</h3>';
  }
  
  trendingDestinations.forEach(destination => {
    const trendingItem = document.createElement('div');
    trendingItem.className = 'trending-item';
    trendingItem.dataset.id = destination.id;
    
    trendingItem.innerHTML = `
      <div class="trending-icon">
        <i class="fas ${destination.icon}"></i>
      </div>
      <div class="trending-info">
        <h4>${destination.name}</h4>
        <p>${destination.description}</p>
        <div class="stat-badges">
          <div class="stat-badge">
            <i class="fas fa-user"></i> ${destination.travelerCount} travelers
          </div>
          <div class="stat-badge">
            <i class="fas fa-arrow-trend-up"></i> +${destination.trendingPercentage}%
          </div>
        </div>
      </div>
    `;
    
    // Add click event
    trendingItem.addEventListener('click', () => {
      console.log(`Selected trending destination: ${destination.name}`);
      alert(`You selected ${destination.name}. In a real app, this would take you to the destination details.`);
    });
    
    trendingList.appendChild(trendingItem);
  });
}
