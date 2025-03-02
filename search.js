/**
 * Smart Search functionality using Claude AI
 */
document.addEventListener('DOMContentLoaded', async function() {
    // This will hold unique keywords extracted from all destinations
    let PREDEFINED_KEYWORDS = [];
    
    // Destinations with associated keywords (will be populated from database)
    let DESTINATIONS = [];
    
    // Fetch destinations from the database
    try {
        const response = await API.getAllDestinations();
        if (response.success && response.destinations) {
            // Create a Set to store unique keywords
            const uniqueKeywordsSet = new Set();
            
            // Transform the destinations into the format we need
            DESTINATIONS = response.destinations.map(dest => {
                let keywords = [];
                
                // Try to parse the Keywords field from JSON string
                if (dest.Keywords) {
                    try {
                        keywords = JSON.parse(dest.Keywords);
                        
                        // Add each keyword to our unique keywords set
                        if (Array.isArray(keywords)) {
                            keywords.forEach(keyword => {
                                if (keyword && typeof keyword === 'string') {
                                    uniqueKeywordsSet.add(keyword.trim().toLowerCase());
                                }
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing keywords for destination:', dest.Name, e);
                    }
                }
                
                return {
                    id: dest.DestinationID,
                    name: `${dest.Name}${dest.Country ? ', ' + dest.Country : ''}`,
                    keywords: keywords,
                    image: dest.ImageURL || '',
                    description: dest.Description || '',
                    region: dest.Region || '',
                    icon: dest.Icon || 'fa-map-marker-alt'
                };
            });
            
            // Convert our Set to an array for PREDEFINED_KEYWORDS
            PREDEFINED_KEYWORDS = Array.from(uniqueKeywordsSet);
            
            console.log('Loaded destinations from database:', DESTINATIONS.length);
            console.log('Extracted unique keywords:', PREDEFINED_KEYWORDS.length);
            console.log('Sample keywords:', PREDEFINED_KEYWORDS.slice(0, 10));
        } else {
            console.error('Failed to load destinations from database:', response.message);
            // Fallback to some default destinations and keywords if database loading fails
            DESTINATIONS = [
                { id: 'D-001', name: 'Bali, Indonesia', keywords: ['beach', 'island', 'tropical', 'cultural', 'summer', 'photography'], icon: 'fa-umbrella-beach' },
                { id: 'D-002', name: 'Patagonia, Chile', keywords: ['mountain', 'adventure', 'nature', 'photography'], icon: 'fa-mountain' },
                { id: 'D-003', name: 'Kyoto, Japan', keywords: ['cultural', 'historical', 'city', 'photography', 'food'], icon: 'fa-landmark' },
                { id: 'D-004', name: 'Lisbon, Portugal', keywords: ['city', 'historical', 'food', 'summer', 'budget'], icon: 'fa-city' },
                { id: 'D-005', name: 'Santorini, Greece', keywords: ['island', 'beach', 'romantic', 'summer', 'photography'], icon: 'fa-water' }
            ];
            
            // Extract unique keywords from our fallback destinations
            const uniqueKeywordsSet = new Set();
            DESTINATIONS.forEach(dest => {
                if (Array.isArray(dest.keywords)) {
                    dest.keywords.forEach(keyword => uniqueKeywordsSet.add(keyword));
                }
            });
            PREDEFINED_KEYWORDS = Array.from(uniqueKeywordsSet);
        }
    } catch (error) {
        console.error('Error fetching destinations:', error);
        // Fallback to some default destinations and keywords if there's an error
        DESTINATIONS = [
            { id: 'D-001', name: 'Bali, Indonesia', keywords: ['beach', 'island', 'tropical', 'cultural', 'summer', 'photography'], icon: 'fa-umbrella-beach' },
            { id: 'D-002', name: 'Patagonia, Chile', keywords: ['mountain', 'adventure', 'nature', 'photography'], icon: 'fa-mountain' },
            { id: 'D-003', name: 'Kyoto, Japan', keywords: ['cultural', 'historical', 'city', 'photography', 'food'], icon: 'fa-landmark' },
            { id: 'D-004', name: 'Lisbon, Portugal', keywords: ['city', 'historical', 'food', 'summer', 'budget'], icon: 'fa-city' },
            { id: 'D-005', name: 'Santorini, Greece', keywords: ['island', 'beach', 'romantic', 'summer', 'photography'], icon: 'fa-water' }
        ];
        
        // Extract unique keywords from our fallback destinations
        const uniqueKeywordsSet = new Set();
        DESTINATIONS.forEach(dest => {
            if (Array.isArray(dest.keywords)) {
                dest.keywords.forEach(keyword => uniqueKeywordsSet.add(keyword));
            }
        });
        PREDEFINED_KEYWORDS = Array.from(uniqueKeywordsSet);
    }
    
    // Search input and results elements
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchLoading = document.getElementById('search-loading');
    
    if (!searchInput || !searchResults || !searchLoading) return;
    
    // Add event listener for search input
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        // Hide results container
        searchResults.style.display = 'none';
        
        // Don't search if query is too short
        if (query.length < 2) {
            searchLoading.style.display = 'none';
            
            // Clear search mode if input is cleared
            if (query.length === 0) {
                clearSearchMode();
            }
            return;
        }
        
        // Set timeout to prevent too many API calls
        searchTimeout = setTimeout(() => {
            // Start the smart search process
            performSmartSearch(query);
        }, 500);
    });
    
    /**
     * Clear search mode and reset the UI
     */
    function clearSearchMode() {
        const mapOverlay = document.querySelector('.map-overlay');
        const searchResultsContainer = document.querySelector('.search-results-container');
        const trendingList = document.querySelector('.trending-list');
        
        if (mapOverlay) {
            mapOverlay.classList.remove('search-mode');
        }
        
        if (searchResultsContainer) {
            searchResultsContainer.style.display = 'none';
        }
        
        // Restore trending list to center position
        if (trendingList) {
            trendingList.style.transform = 'translateX(0)';
        }
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-bar')) {
            searchResults.style.display = 'none';
            searchLoading.style.display = 'none';
        }
    });
    
    /**
     * Perform smart search using Claude AI to categorize the query
     * @param {string} query - The search query
     */
    async function performSmartSearch(query) {
        // Show loading animation
        searchLoading.style.display = 'block';
        searchLoading.innerHTML = '';
        
        // Step 1: Starting search
        updateLoadingStatus('Initializing smart search...', 10);
        
        // Step 2: Analyzing query
        setTimeout(() => {
            updateLoadingStatus('Analyzing your query with AI...', 30);
        }, 500);
        
        try {
            // Step 3: Call Claude API
            setTimeout(() => {
                updateLoadingStatus('Processing semantic meaning...', 50);
            }, 1000);
            
            // Call Claude API to analyze the query
            const keywordScores = await analyzeQueryWithClaude(query);
            
            // Step 4: Mapping to database keywords
            setTimeout(() => {
                updateLoadingStatus('Mapping to destination database...', 70);
            }, 1500);
            
            // Find matching destinations based on keyword scores
            const matchedDestinations = findMatchingDestinations(keywordScores);
            
            // Step 5: Finalizing results
            setTimeout(() => {
                updateLoadingStatus('Finalizing results...', 90);
            }, 2000);
            
            // Display the results
            setTimeout(() => {
                displaySearchResults(matchedDestinations, query, keywordScores);
                searchLoading.style.display = 'none';
            }, 2500);
            
        } catch (error) {
            console.error('Error in smart search:', error);
            
            // Show error in loading container
            searchLoading.innerHTML = `
                <div class="search-loading-text" style="color: var(--secondary);">Search Error</div>
                <div class="search-loading-status">Unable to complete search. Please try again.</div>
            `;
            
            // Hide error after 3 seconds
            setTimeout(() => {
                searchLoading.style.display = 'none';
            }, 3000);
        }
    }
    
    /**
     * Update the loading status with text and progress bar
     * @param {string} statusText - The status text to display
     * @param {number} progress - The progress percentage (0-100)
     */
    function updateLoadingStatus(statusText, progress) {
        // Create terminal-style loading text
        const loadingText = document.createElement('div');
        loadingText.className = 'search-loading-text';
        loadingText.textContent = '> ' + statusText;
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'search-loading-progress';
        
        // Create status text
        const statusElement = document.createElement('div');
        statusElement.className = 'search-loading-status';
        statusElement.textContent = `Processing | ${progress}% complete`;
        
        // Add elements to loading container
        searchLoading.appendChild(loadingText);
        searchLoading.appendChild(progressBar);
        searchLoading.appendChild(statusElement);
        
        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = `${progress}%`;
        }, 100);
    }
    
    /**
     * Call Claude API to analyze the search query (via backend proxy)
     * @param {string} query - The search query
     * @returns {Promise<Object>} - Object with keyword scores
     */
    async function analyzeQueryWithClaude(query) {
        try {
            // For performance reasons, limit the number of keywords we send to Claude
            // If we have more than 50 keywords, select the most relevant ones based on the query
            let keywordsToAnalyze = PREDEFINED_KEYWORDS;
            
            if (PREDEFINED_KEYWORDS.length > 50) {
                const queryLower = query.toLowerCase();
                
                // First, include any keywords that directly appear in the query
                const directMatches = PREDEFINED_KEYWORDS.filter(keyword => 
                    queryLower.includes(keyword.toLowerCase()));
                
                // Then add keywords from common travel themes related to the query
                const commonThemes = {
                    'relaxation': ['beach', 'tropical', 'resort', 'island', 'spa', 'relaxing'],
                    'adventure': ['hiking', 'trek', 'mountain', 'adventure', 'outdoor', 'climbing', 'safari'],
                    'luxury': ['resort', 'spa', 'luxury', 'exclusive', 'premium', 'five-star'],
                    'culture': ['museum', 'history', 'historical', 'cultural', 'architecture', 'heritage'],
                    'family': ['family', 'kid', 'children', 'theme park', 'amusement'],
                    'food': ['cuisine', 'gastronomy', 'food', 'restaurant', 'dining', 'culinary'],
                    'nature': ['nature', 'wildlife', 'park', 'natural', 'forest', 'eco', 'landscape']
                };
                
                const themeRelatedKeywords = [];
                Object.entries(commonThemes).forEach(([theme, themeWords]) => {
                    if (themeWords.some(word => queryLower.includes(word))) {
                        // Find keywords related to this theme
                        PREDEFINED_KEYWORDS.forEach(keyword => {
                            if (themeWords.some(word => keyword.includes(word))) {
                                themeRelatedKeywords.push(keyword);
                            }
                        });
                    }
                });
                
                // Combine direct matches and theme matches, then add random selections to reach 50
                keywordsToAnalyze = Array.from(new Set([...directMatches, ...themeRelatedKeywords]));
                
                // If we still need more keywords, add random ones up to 50
                if (keywordsToAnalyze.length < 50) {
                    const remainingKeywords = PREDEFINED_KEYWORDS.filter(
                        keyword => !keywordsToAnalyze.includes(keyword)
                    );
                    
                    // Shuffle the remaining keywords and take enough to reach 50
                    const shuffled = remainingKeywords.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 50 - keywordsToAnalyze.length);
                    
                    keywordsToAnalyze = [...keywordsToAnalyze, ...selected];
                }
            }
            
            // Prepare the Claude API request
            const requestData = {
                messages: [
                    {
                        role: 'user',
                        content: `I need you to analyze this travel search query: "${query}"
                        
                        Please rank how well it matches each of these travel keywords on a scale from 0-10, where 10 is a perfect match:
                        ${keywordsToAnalyze.join(', ')}
                        
                        Return your response as a JSON object with keywords as keys and scores as values. For example:
                        {"beach": 9, "mountain": 0, ...}
                        
                        Only include the JSON in your response with no other text.`
                    }
                ]
            };
            
            // Use direct fetch with JSONP approach as shown in the working example
            const apiUrl = API.BASE_URL;
            
            // Send the request directly as JSONP
            const response = await fetch(`${apiUrl}?action=callClaudeApi&callback=handleResponse&data=${encodeURIComponent(JSON.stringify(requestData))}`);
            
            const text = await response.text();
            
            // Extract the JSON from JSONP response
            const jsonStart = text.indexOf('(') + 1;
            const jsonEnd = text.lastIndexOf(')');
            const jsonStr = text.substring(jsonStart, jsonEnd);
            
            const data = JSON.parse(jsonStr);
            
            // Extract the JSON object from Claude's response
            let keywordScores = {};
            try {
                if (data.success && data.data && data.data.content) {
                    // Try to parse the content directly
                    const content = data.data.content[0].text;
                    
                    // Use regex to extract the JSON object from the response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        keywordScores = JSON.parse(jsonMatch[0]);
                    } else {
                        // Fallback to manually scoring based on query keywords
                        keywordScores = fallbackScoring(query);
                    }
                } else {
                    throw new Error(data.message || 'Unable to get response from Claude');
                }
            } catch (parseError) {
                console.error('Error parsing Claude response:', parseError);
                // Fallback to manual scoring
                keywordScores = fallbackScoring(query);
            }
            
            return keywordScores;
            
        } catch (error) {
            console.error('Error calling Claude API via backend:', error);
            // Return fallback scoring if API call fails
            return fallbackScoring(query);
        }
    }
    
    /**
     * Fallback method to score keywords if Claude API fails
     * @param {string} query - The search query
     * @returns {Object} - Object with keyword scores
     */
    function fallbackScoring(query) {
        const queryLower = query.toLowerCase();
        const scores = {};
        
        // Score each keyword based on presence in query
        PREDEFINED_KEYWORDS.forEach(keyword => {
            if (queryLower.includes(keyword)) {
                scores[keyword] = 9;
            } else if (keyword.length > 3 && queryLower.includes(keyword.slice(0, -2))) {
                // Partial match (e.g., "beach" vs "beaches")
                scores[keyword] = 7;
            } else {
                // Default low score
                scores[keyword] = 1;
            }
        });
        
        // Additional heuristics for common travel themes
        // Check if our extracted keywords have certain travel themes
        const commonThemes = {
            'relaxation': ['beach', 'tropical', 'resort', 'island', 'spa', 'relaxing'],
            'adventure': ['hiking', 'trek', 'mountain', 'adventure', 'outdoor', 'climbing', 'safari'],
            'luxury': ['resort', 'spa', 'luxury', 'exclusive', 'premium', 'five-star'],
            'culture': ['museum', 'history', 'historical', 'cultural', 'architecture', 'heritage'],
            'family': ['family', 'kid', 'children', 'theme park', 'amusement'],
            'food': ['cuisine', 'gastronomy', 'food', 'restaurant', 'dining', 'culinary'],
            'nature': ['nature', 'wildlife', 'park', 'natural', 'forest', 'eco', 'landscape']
        };
        
        // Boost scores for related keywords based on query themes
        Object.entries(commonThemes).forEach(([theme, relatedKeywords]) => {
            const themeInQuery = relatedKeywords.some(word => queryLower.includes(word));
            
            if (themeInQuery) {
                // Find all keywords in our PREDEFINED_KEYWORDS that match the theme's related keywords
                PREDEFINED_KEYWORDS.forEach(keyword => {
                    if (relatedKeywords.some(word => keyword.includes(word))) {
                        scores[keyword] = (scores[keyword] || 0) + 3;
                    }
                });
            }
        });
        
        // Cap scores at 10
        Object.keys(scores).forEach(key => {
            scores[key] = Math.min(scores[key], 10);
        });
        
        return scores;
    }
    
    /**
     * Find matching destinations based on keyword scores
     * @param {Object} keywordScores - Object with keyword scores
     * @returns {Array} - Array of matching destinations with scores
     */
    function findMatchingDestinations(keywordScores) {
        const results = [];
        
        console.log('Finding matches among', DESTINATIONS.length, 'destinations');
        console.log('Keyword scores:', keywordScores);
        
        // Score each destination based on its keywords
        DESTINATIONS.forEach(destination => {
            let totalScore = 0;
            let matchedKeywords = [];
            
            // Skip if destination has no keywords
            if (!destination.keywords || !Array.isArray(destination.keywords) || destination.keywords.length === 0) {
                console.warn('Destination has no keywords:', destination.name);
                return;
            }
            
            // Calculate score based on matching keywords
            destination.keywords.forEach(keyword => {
                if (keywordScores[keyword] && keywordScores[keyword] > 5) {
                    totalScore += keywordScores[keyword];
                    matchedKeywords.push({
                        keyword: keyword,
                        score: keywordScores[keyword]
                    });
                }
            });
            
            // Only include destinations with some match
            if (totalScore > 0) {
                results.push({
                    id: destination.id,
                    name: destination.name,
                    score: totalScore,
                    matchedKeywords: matchedKeywords.sort((a, b) => b.score - a.score).slice(0, 3),
                    // Include additional useful fields
                    image: destination.image,
                    description: destination.description,
                    region: destination.region,
                    icon: destination.icon
                });
            }
        });
        
        console.log('Found', results.length, 'matching destinations');
        
        // If no matches found, make a second pass with a lower threshold
        if (results.length === 0) {
            DESTINATIONS.forEach(destination => {
                if (!destination.keywords || !Array.isArray(destination.keywords)) return;
                
                let totalScore = 0;
                let matchedKeywords = [];
                
                destination.keywords.forEach(keyword => {
                    if (keywordScores[keyword] && keywordScores[keyword] > 3) { // Lower threshold
                        totalScore += keywordScores[keyword];
                        matchedKeywords.push({
                            keyword: keyword,
                            score: keywordScores[keyword]
                        });
                    }
                });
                
                if (totalScore > 0) {
                    results.push({
                        id: destination.id,
                        name: destination.name,
                        score: totalScore,
                        matchedKeywords: matchedKeywords.sort((a, b) => b.score - a.score).slice(0, 3),
                        image: destination.image,
                        description: destination.description,
                        region: destination.region,
                        icon: destination.icon
                    });
                }
            });
            
            console.log('After lowering threshold, found', results.length, 'destinations');
        }
        
        // Sort by score (highest first)
        return results.sort((a, b) => b.score - a.score);
    }
    
    /**
     * Display search results in the results container
     * @param {Array} destinations - Array of matching destinations
     * @param {string} query - The original search query
     * @param {Object} keywordScores - The keyword scores from Claude
     */
    function displaySearchResults(destinations, query, keywordScores) {
        // Clear previous results
        searchResults.innerHTML = '';
        
        // Get top keywords for explanation
        const topKeywords = Object.entries(keywordScores)
            .sort((a, b) => b[1] - a[1])
            .filter(entry => entry[1] > 5)
            .slice(0, 3)
            .map(entry => entry[0]);
        
        // Show explanation if we have top keywords
        if (topKeywords.length > 0) {
            const explanationItem = document.createElement('div');
            explanationItem.className = 'search-result-item';
            explanationItem.innerHTML = `
                <div class="search-result-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="search-result-info">
                    <div class="search-result-title">Smart Search Results</div>
                    <div class="search-result-description">
                        Your query matched best with: <span class="search-result-match">${topKeywords.join(', ')}</span>
                    </div>
                </div>
            `;
            searchResults.appendChild(explanationItem);
        }
        
        // Update map overlay UI with search results
        updateMapOverlayWithSearchResults(destinations, query, keywordScores);
        
        // Add destination results to dropdown
        if (destinations.length > 0) {
            destinations.slice(0, 5).forEach(destination => {
                // No need to find destination data again, we now include it in the search results
                const destData = destination;
                
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                // Get icon based on top keyword or use the destination's icon
                const topKeyword = destination.matchedKeywords[0]?.keyword || 'city';
                const icon = destData.icon || getIconForKeyword(topKeyword);
                
                // Format matched keywords for display
                const keywordText = destination.matchedKeywords
                    .map(k => `<span class="search-result-match">${k.keyword}</span>`)
                    .join(', ');
                
                // Create HTML for the result item with more destination details
                resultItem.innerHTML = `
                    <div class="search-result-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${destination.name}</div>
                        <div class="search-result-description">
                            ${destData.description ? `<div class="destination-description">${destData.description.substring(0, 60)}${destData.description.length > 60 ? '...' : ''}</div>` : ''}
                            <div>Matches: ${keywordText}</div>
                            ${destData.region ? `<div class="destination-region"><i class="fas fa-map-marker-alt"></i> ${destData.region}</div>` : ''}
                        </div>
                    </div>
                    ${destData.image ? `<div class="search-result-image" style="background-image: url('${destData.image}');"></div>` : ''}
                `;
                
                // Add click handler
                resultItem.addEventListener('click', () => {
                    handleDestinationSelection(destination);
                });
                
                searchResults.appendChild(resultItem);
            });
        } else {
            // No results found
            const noResultsItem = document.createElement('div');
            noResultsItem.className = 'search-result-item';
            noResultsItem.innerHTML = `
                <div class="search-result-icon">
                    <i class="fas fa-search"></i>
                </div>
                <div class="search-result-info">
                    <div class="search-result-title">No results found</div>
                    <div class="search-result-description">
                        Try different keywords or browse the trending destinations
                    </div>
                </div>
            `;
            searchResults.appendChild(noResultsItem);
        }
        
        // Show results container
        searchResults.style.display = 'block';
    }
    
    /**
     * Update the map overlay with search results
     * @param {Array} destinations - Array of matching destinations
     * @param {string} query - The original search query
     * @param {Object} keywordScores - The keyword scores from Claude
     */
    function updateMapOverlayWithSearchResults(destinations, query, keywordScores) {
        // Get the containers
        const mapOverlay = document.querySelector('.map-overlay');
        const searchResultsContainer = document.querySelector('.search-results-container');
        const searchDestinationCards = document.getElementById('search-destination-cards');
        const trendingList = document.querySelector('.trending-list');
        
        if (!mapOverlay || !searchResultsContainer || !searchDestinationCards) return;
        
        // Add search-mode class to the map overlay to trigger the CSS transition
        mapOverlay.classList.add('search-mode');
        
        // Adjust layout - shift trending destinations to the right
        if (trendingList) {
            trendingList.style.transform = 'translateX(10%)';
            trendingList.style.transition = 'transform 0.4s ease';
        }
        
        // Clear previous cards
        searchDestinationCards.innerHTML = '';
        
        // Show the search results container
        searchResultsContainer.style.display = 'block';
        
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
        
        // Add destination cards for each search result
        destinations.forEach(destination => {
            const card = createSearchResultCard(destination);
            searchDestinationCards.appendChild(card);
        });
    }
    
    /**
     * Create a destination card for search results
     * @param {Object} destination - The destination data
     * @returns {HTMLElement} - The card element
     */
    function createSearchResultCard(destination) {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.dataset.destinationId = destination.id;
        
        // Get icon based on top keyword or use the destination's icon
        const topKeyword = destination.matchedKeywords[0]?.keyword || 'city';
        const icon = destination.icon || getIconForKeyword(topKeyword);
        
        // Format matched keywords for display
        const keywordText = destination.matchedKeywords
            .map(k => k.keyword)
            .join(', ');
        
        card.innerHTML = `
            <div class="destination-card-header">
                <div class="destination-card-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <h4 class="destination-card-title">${destination.name}</h4>
            </div>
            <div class="destination-card-description">${destination.description || ''}</div>
            <div class="destination-card-stats">
                <div class="destination-card-stat">
                    <i class="fas fa-tag"></i> ${keywordText}
                </div>
            </div>
        `;
        
        // Add click handler
        card.addEventListener('click', () => {
            handleDestinationSelection(destination);
        });
        
        return card;
    }
    
    /**
     * Handle destination selection from search results
     * @param {Object} destination - The selected destination
     */
    function handleDestinationSelection(destination) {
        // First try clicking on the corresponding trending item
        const trendingItems = document.querySelectorAll('.trending-item');
        let clicked = false;
        
        trendingItems.forEach(item => {
            const itemTitle = item.querySelector('h4')?.textContent;
            if (itemTitle && destination.name.includes(itemTitle) || (itemTitle && itemTitle.includes(destination.name.split(',')[0]))) {
                item.click();
                clicked = true;
                
                // Close the search results
                searchResults.style.display = 'none';
                searchLoading.style.display = 'none';
            }
        });
        
        // If no trending item matched, try location cards
        if (!clicked) {
            const locationCards = document.querySelectorAll('.location-card');
            locationCards.forEach(card => {
                const cardName = card.querySelector('h3')?.textContent;
                if (cardName && (destination.name.includes(cardName) || cardName.includes(destination.name.split(',')[0]))) {
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
                    
                    // Close the search results
                    searchResults.style.display = 'none';
                    searchLoading.style.display = 'none';
                }
            });
        }
        
        // If no match found, just close the search results
        if (!clicked) {
            // Just show an alert for now
            alert(`You selected ${destination.name}. View details coming soon!`);
            searchResults.style.display = 'none';
            searchLoading.style.display = 'none';
        }
    }
    
    /**
     * Get Font Awesome icon class for a keyword
     * @param {string} keyword - The keyword
     * @returns {string} - The icon class
     */
    function getIconForKeyword(keyword) {
        const iconMap = {
            'beach': 'fa-umbrella-beach',
            'mountain': 'fa-mountain',
            'island': 'fa-island-tropical',
            'city': 'fa-city',
            'adventure': 'fa-hiking',
            'cultural': 'fa-landmark',
            'historical': 'fa-monument',
            'tropical': 'fa-sun',
            'winter': 'fa-snowflake',
            'summer': 'fa-sun',
            'family': 'fa-users',
            'romantic': 'fa-heart',
            'budget': 'fa-wallet',
            'luxury': 'fa-gem',
            'food': 'fa-utensils',
            'nightlife': 'fa-cocktail',
            'nature': 'fa-leaf',
            'photography': 'fa-camera'
        };
        
        return iconMap[keyword] || 'fa-map-marker-alt';
    }
});
