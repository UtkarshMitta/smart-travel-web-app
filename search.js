/**
 * Smart Search functionality using Claude AI
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize with empty API key
    let CLAUDE_KE = 'ant-api03-NHTaxo_PLMKOS43y3nnkOeQJXOQ_3RQT-Dw-WmqAwpNAp5FERJyEoW01VgErxwhrtaoH4jGMPjpsOspPJNQ_FA-ZCVJTwAA';
    
    
    
    // Predefined keywords that map to locations in the database
    const PREDEFINED_KEYWORDS = [
        'beach', 'mountain', 'island', 'city', 'adventure', 'cultural', 
        'historical', 'tropical', 'winter', 'summer', 'family', 'romantic',
        'budget', 'luxury', 'food', 'nightlife', 'nature', 'photography'
    ];
    
    // Destinations with associated keywords
    const DESTINATIONS = [
        { name: 'Bali, Indonesia', keywords: ['beach', 'island', 'tropical', 'cultural', 'summer', 'photography'] },
        { name: 'Patagonia, Chile', keywords: ['mountain', 'adventure', 'nature', 'photography'] },
        { name: 'Kyoto, Japan', keywords: ['cultural', 'historical', 'city', 'photography', 'food'] },
        { name: 'Lisbon, Portugal', keywords: ['city', 'historical', 'food', 'summer', 'budget'] },
        { name: 'Barcelona, Spain', keywords: ['city', 'beach', 'cultural', 'food', 'nightlife', 'photography'] },
        { name: 'Santorini, Greece', keywords: ['island', 'beach', 'romantic', 'summer', 'photography'] },
        { name: 'New York City, USA', keywords: ['city', 'food', 'nightlife', 'cultural', 'luxury', 'photography'] },
        { name: 'Bangkok, Thailand', keywords: ['city', 'cultural', 'food', 'budget', 'tropical'] },
        { name: 'Costa Rica', keywords: ['adventure', 'nature', 'beach', 'tropical', 'photography'] },
        { name: 'Italian Alps', keywords: ['mountain', 'winter', 'adventure', 'nature', 'photography'] }
    ];
    
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
            return;
        }
        
        // Set timeout to prevent too many API calls
        searchTimeout = setTimeout(() => {
            // Start the smart search process
            performSmartSearch(query);
        }, 500);
    });
    
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
     * Call Claude API to analyze the search query
     * @param {string} query - The search query
     * @returns {Promise<Object>} - Object with keyword scores
     */
    async function analyzeQueryWithClaude(query) {
        // Check if we have a valid API key

        try {
            // Prepare the request to Claude API
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': "sk-"+CLAUDE_KE,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-7-sonnet-20250219',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'user',
                            content: `I need you to analyze this travel search query: "${query}"
                            
                            Please rank how well it matches each of these travel keywords on a scale from 0-10, where 10 is a perfect match:
                            ${PREDEFINED_KEYWORDS.join(', ')}
                            
                            Return your response as a JSON object with keywords as keys and scores as values. For example:
                            {"beach": 9, "mountain": 0, ...}
                            
                            Only include the JSON in your response with no other text.`
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract the JSON object from Claude's response
            let keywordScores = {};
            try {
                // Try to parse the content directly
                const content = data.content[0].text;
                
                // Use regex to extract the JSON object from the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    keywordScores = JSON.parse(jsonMatch[0]);
                } else {
                    // Fallback to manually scoring based on query keywords
                    keywordScores = fallbackScoring(query);
                }
            } catch (parseError) {
                console.error('Error parsing Claude response:', parseError);
                // Fallback to manual scoring
                keywordScores = fallbackScoring(query);
            }
            
            return keywordScores;
        } catch (error) {
            console.error('Error calling Claude API:', error);
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
            } else if (queryLower.includes(keyword.slice(0, -2))) {
                // Partial match (e.g., "beach" vs "beaches")
                scores[keyword] = 7;
            } else {
                // Default low score
                scores[keyword] = 1;
            }
        });
        
        // Additional heuristics for common travel phrases
        if (queryLower.includes('vacation') || queryLower.includes('holiday')) {
            scores['beach'] += 2;
            scores['tropical'] += 2;
        }
        if (queryLower.includes('hiking') || queryLower.includes('trek')) {
            scores['mountain'] += 3;
            scores['adventure'] += 3;
            scores['nature'] += 3;
        }
        if (queryLower.includes('resort') || queryLower.includes('spa')) {
            scores['luxury'] += 3;
            scores['romantic'] += 2;
        }
        if (queryLower.includes('museum') || queryLower.includes('history')) {
            scores['historical'] += 3;
            scores['cultural'] += 3;
            scores['city'] += 2;
        }
        
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
        
        // Score each destination based on its keywords
        DESTINATIONS.forEach(destination => {
            let totalScore = 0;
            let matchedKeywords = [];
            
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
                    name: destination.name,
                    score: totalScore,
                    matchedKeywords: matchedKeywords.sort((a, b) => b.score - a.score).slice(0, 3)
                });
            }
        });
        
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
        
        // Add destination results
        if (destinations.length > 0) {
            destinations.slice(0, 5).forEach(destination => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                // Get icon based on top keyword
                const topKeyword = destination.matchedKeywords[0]?.keyword || 'city';
                const icon = getIconForKeyword(topKeyword);
                
                // Format matched keywords for display
                const keywordText = destination.matchedKeywords
                    .map(k => `<span class="search-result-match">${k.keyword}</span>`)
                    .join(', ');
                
                resultItem.innerHTML = `
                    <div class="search-result-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${destination.name}</div>
                        <div class="search-result-description">
                            Matches: ${keywordText}
                        </div>
                    </div>
                `;
                
                // Add click handler
                resultItem.addEventListener('click', () => {
                    // We would normally navigate to the destination page
                    // For now, just simulate by clicking on the corresponding trending item
                    const trendingItems = document.querySelectorAll('.trending-item');
                    trendingItems.forEach(item => {
                        if (item.querySelector('h4').textContent === destination.name) {
                            item.click();
                            
                            // Close the search results
                            searchResults.style.display = 'none';
                            searchLoading.style.display = 'none';
                        }
                    });
                    
                    // Alternative: click on the location card if it exists
                    const locationCards = document.querySelectorAll('.location-card');
                    locationCards.forEach(card => {
                        const cardName = card.querySelector('h3').textContent;
                        if (destination.name.includes(cardName) || cardName.includes(destination.name)) {
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
                            
                            // Close the search results
                            searchResults.style.display = 'none';
                            searchLoading.style.display = 'none';
                        }
                    });
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