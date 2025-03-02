/**
 * Image to Location Recognition Feature
 * This module handles image uploads and uses Claude Vision to identify travel destinations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!Session.isLoggedIn()) {
        return;
    }

    // Initialize the image recognition feature
    initImageRecognition();

    /**
     * Initialize the image recognition feature
     */
    function initImageRecognition() {
        // Find and initialize the camera tool button in the UI
        const cameraButton = document.querySelector('.camera-tool');
        if (!cameraButton) return;

        // Create the image recognition modal
        createImageRecognitionModal();

        // Add click event to camera button
        cameraButton.addEventListener('click', function() {
            showImageRecognitionModal();
        });
    }

    /**
     * Create the image recognition modal
     */
    function createImageRecognitionModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'image-recognition-modal';
        modal.className = 'image-recognition-modal';
        
        // Modal content
        modal.innerHTML = `
            <div class="image-recognition-container">
                <div class="image-recognition-header">
                    <h3>Identify Location from Image</h3>
                    <button class="image-recognition-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="image-recognition-body">
                    <div class="image-upload-area" id="image-upload-area">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag & drop your travel image here or click to upload</p>
                        <p class="upload-note">Claude Vision will analyze the image and identify the location</p>
                        <input type="file" id="image-upload-input" accept="image/*" style="display: none;">
                    </div>
                    
                    <div class="image-preview-area" id="image-preview-area" style="display: none;">
                        <img id="uploaded-image-preview" src="" alt="Uploaded image">
                        <button class="remove-image-btn">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                    
                    <div class="image-description-area">
                        <label for="image-description">Add context about the image (optional):</label>
                        <textarea id="image-description" placeholder="Example: 'This is a photo I took during summer vacation', 'Can you identify this historical landmark?', etc."></textarea>
                    </div>
                    
                    <div class="image-recognition-actions">
                        <button class="analyze-image-btn" id="analyze-image-btn" disabled>
                            <i class="fas fa-search-location"></i> Identify Location
                        </button>
                    </div>
                </div>
                
                <div class="image-recognition-results" id="image-recognition-results" style="display: none;">
                    <div class="results-header">
                        <h4>Location Analysis</h4>
                    </div>
                    <div class="results-content" id="results-content">
                        <!-- Results will be inserted here -->
                    </div>
                    <div class="results-actions">
                        <button class="search-location-btn" id="search-location-btn">
                            <i class="fas fa-search"></i> Search This Destination
                        </button>
                        <button class="new-analysis-btn" id="new-analysis-btn">
                            <i class="fas fa-redo"></i> Analyze New Image
                        </button>
                    </div>
                </div>
                
                <div class="image-recognition-loading" id="image-recognition-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Claude Vision is analyzing your image...</div>
                </div>
            </div>
        `;
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Add event listeners to close button
        const closeButton = modal.querySelector('.image-recognition-close');
        closeButton.addEventListener('click', hideImageRecognitionModal);
        
        // Close modal when clicking outside the content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideImageRecognitionModal();
            }
        });
        
        // Initialize file upload functionality
        initFileUpload();
        
        // Initialize analyze button
        const analyzeButton = document.getElementById('analyze-image-btn');
        analyzeButton.addEventListener('click', analyzeImage);
        
        // Initialize new analysis button
        const newAnalysisButton = document.getElementById('new-analysis-btn');
        newAnalysisButton.addEventListener('click', resetImageRecognition);
        
        // Initialize search location button
        const searchLocationButton = document.getElementById('search-location-btn');
        searchLocationButton.addEventListener('click', searchIdentifiedLocation);
    }

    /**
     * Initialize file upload functionality
     */
    function initFileUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const uploadInput = document.getElementById('image-upload-input');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const removeButton = document.querySelector('.remove-image-btn');
        const analyzeButton = document.getElementById('analyze-image-btn');
        
        // Click on upload area to trigger file input
        uploadArea.addEventListener('click', function() {
            uploadInput.click();
        });
        
        // Handle file selection
        uploadInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files[0]);
        });
        
        // Handle drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
        
        // Handle remove button
        removeButton.addEventListener('click', function() {
            uploadInput.value = '';
            previewArea.style.display = 'none';
            uploadArea.style.display = 'flex';
            analyzeButton.disabled = true;
        });
    }

    /**
     * Handle file upload
     * @param {File} file - The uploaded file
     */
    function handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            showNotification('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }
        
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const analyzeButton = document.getElementById('analyze-image-btn');
        
        // Create file reader to preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewArea.style.display = 'block';
            analyzeButton.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Analyze the uploaded image using Claude Vision
     */
    function analyzeImage() {
        const imagePreview = document.getElementById('uploaded-image-preview');
        const description = document.getElementById('image-description').value;
        const resultsArea = document.getElementById('image-recognition-results');
        const loadingArea = document.getElementById('image-recognition-loading');
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview-area');
        const descriptionArea = document.querySelector('.image-description-area');
        const actionsArea = document.querySelector('.image-recognition-actions');
        
        // Check if image is uploaded
        if (!imagePreview.src || imagePreview.src === '') {
            showNotification('Please upload an image to analyze');
            return;
        }
        
        // Show loading state
        loadingArea.style.display = 'flex';
        previewArea.style.display = 'none';
        descriptionArea.style.display = 'none';
        actionsArea.style.display = 'none';
        
        // Get base64 image data (remove the data URL prefix)
        const imageData = imagePreview.src.split(',')[1];
        
        // Call the API to identify the location
        API.identifyLocationFromImage(imageData, description)
            .then(response => {
                // Hide loading
                loadingArea.style.display = 'none';
                
                if (response.success) {
                    // Display results
                    displayAnalysisResults(response.results, imagePreview.src);
                    // Show results area
                    resultsArea.style.display = 'block';
                } else {
                    // Show error
                    showNotification('Error analyzing image: ' + response.message);
                    // Reset to upload state
                    resetToUploadState();
                }
            })
            .catch(error => {
                console.error('Error during image analysis:', error);
                loadingArea.style.display = 'none';
                showNotification('Error analyzing image. Please try again.');
                resetToUploadState();
            });
    }

    /**
     * Display the analysis results
     * @param {Object} results - The analysis results from Claude
     * @param {string} imageSrc - The source of the analyzed image
     */
    function displayAnalysisResults(results, imageSrc) {
        const resultsContent = document.getElementById('results-content');
        
        // Create HTML content for results
        let html = `
            <div class="results-summary">
                <div class="results-image">
                    <img src="${imageSrc}" alt="Analyzed image">
                </div>
                <div class="results-details">
                    <h4 class="location-name">${results.location || 'Unknown Location'}</h4>
                    <div class="confidence-level ${getConfidenceClass(results.confidence)}">
                        <span class="confidence-label">Confidence:</span>
                        <span class="confidence-value">${results.confidence || 'Low'}</span>
                    </div>
                    ${results.region ? `<div class="location-region"><i class="fas fa-map-marker-alt"></i> ${results.region}</div>` : ''}
                </div>
            </div>
            <div class="results-description">
                ${results.description || 'No detailed information available about this location.'}
            </div>
        `;
        
        // If there are alternatives, show them
        if (results.alternatives && results.alternatives.length > 0) {
            html += `
                <div class="alternative-locations">
                    <h5>Alternative Possibilities:</h5>
                    <ul>
                        ${results.alternatives.map(alt => `
                            <li>
                                <span class="alt-name">${alt.location}</span>
                                ${alt.region ? `<span class="alt-region">(${alt.region})</span>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        // If there are travel tips, show them
        if (results.travelTips && results.travelTips.length > 0) {
            html += `
                <div class="travel-tips">
                    <h5>Travel Tips:</h5>
                    <ul>
                        ${results.travelTips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Set the HTML content
        resultsContent.innerHTML = html;
        
        // Store the identified location for search
        document.getElementById('search-location-btn').dataset.location = results.location || '';
    }

    /**
     * Get CSS class based on confidence level
     * @param {string} confidence - The confidence level
     * @returns {string} - CSS class for styling
     */
    function getConfidenceClass(confidence) {
        if (!confidence) return 'low';
        
        const confidenceLower = confidence.toLowerCase();
        if (confidenceLower.includes('high') || confidenceLower.includes('very') || confidenceLower.includes('strong')) {
            return 'high';
        } else if (confidenceLower.includes('medium') || confidenceLower.includes('moderate')) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Reset to upload state
     */
    function resetToUploadState() {
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview-area');
        const descriptionArea = document.querySelector('.image-description-area');
        const actionsArea = document.querySelector('.image-recognition-actions');
        const resultsArea = document.getElementById('image-recognition-results');
        
        uploadArea.style.display = 'flex';
        previewArea.style.display = 'none';
        descriptionArea.style.display = 'block';
        actionsArea.style.display = 'flex';
        resultsArea.style.display = 'none';
        
        // Clear description
        document.getElementById('image-description').value = '';
        
        // Disable analyze button
        document.getElementById('analyze-image-btn').disabled = true;
    }

    /**
     * Reset the image recognition process
     */
    function resetImageRecognition() {
        const uploadInput = document.getElementById('image-upload-input');
        
        // Clear file input
        uploadInput.value = '';
        
        // Reset to upload state
        resetToUploadState();
    }

    /**
     * Search for the identified location
     */
    function searchIdentifiedLocation() {
        const locationName = document.getElementById('search-location-btn').dataset.location;
        
        if (!locationName) {
            showNotification('No location identified to search');
            return;
        }
        
        // Hide the modal
        hideImageRecognitionModal();
        
        // Focus the search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.value = locationName;
            
            // Trigger the search
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    /**
     * Show the image recognition modal
     */
    function showImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    /**
     * Hide the image recognition modal
     */
    function hideImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    /**
     * Identify location from an image using Claude Vision
     * @param {string} imageData - Base64 encoded image data (without the data:image prefix)
     * @param {string} description - Optional context about the image
     * @returns {Promise<Object>} - The analysis results
     */
    identifyLocationFromImage: async function(imageData, description = '') {
        try {
            // Determine the likely image type (a more robust implementation would detect this)
            const mediaType = 'image/jpeg';
            
            // Create the prompt for Claude
            const prompt = `Analyze this travel image and identify the location shown. 
            If possible, determine:
            1. The specific location name
            2. The region/country
            3. Your confidence level (high, medium, or low)
            4. A brief description of what makes this location notable
            5. Any alternative possible locations if you're uncertain
            6. 2-3 travel tips for this destination
            
            Format your response as structured data that can be easily parsed.
            ${description ? 'Additional context from user: ' + description : ''}`;
            
            // Format the request data for Claude API
            const requestData = {
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: mediaType,
                                    data: imageData
                                }
                            },
                            {
                                type: "text",
                                text: prompt
                            }
                        ]
                    }
                ]
            };
            
            // Call the backend API endpoint
            const response = await fetch('https://script.google.com/macros/s/AKfycbzCuzX3RgjMuz6OsX1f3mEunxbuxK2xkwOMKdTDYJvVGfKNIcaLtXh-hN008SMn_wvgpQ/exec?action=callClaudeApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                console.error('API error:', data);
                return {
                    success: false,
                    message: data.message || 'Failed to analyze image'
                };
            }
            
            // Extract Claude's response text
            const claudeResponse = data.data.content[0].text;
            
            // Parse the response to extract structured location data
            const results = this.parseLocationResponse(claudeResponse);
            
            return {
                success: true,
                results: results
            };
        } catch (error) {
            console.error('Error in identifyLocationFromImage:', error);
            return {
                success: false,
                message: error.message || 'Error analyzing image'
            };
        }
    },
    
    /**
     * Parse Claude's response into structured data
     * @param {string} responseText - Claude's response text
     * @returns {Object} - Structured location data
     */
    parseLocationResponse: function(responseText) {
        try {
            // First try to find and parse any JSON in the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn('Failed to parse JSON from response');
                }
            }
            
            // Fallback to regex-based parsing if no valid JSON is found
            const locationMatch = responseText.match(/location[:\s]+([^\n.,]+)/i);
            const regionMatch = responseText.match(/region[:\s]+([^\n.,]+)/i);
            const confidenceMatch = responseText.match(/confidence[:\s]+([^\n.,]+)/i);
            const descriptionMatch = responseText.match(/description[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is);
            
            // Parse alternatives (if any)
            const alternatives = [];
            const altMatches = responseText.match(/alternative[s]?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is);
            if (altMatches && altMatches[1]) {
                const altText = altMatches[1];
                const altLocations = altText.split(/\n/).filter(line => line.trim() !== '');
                altLocations.forEach(alt => {
                    const parts = alt.split(/[,-]/);
                    if (parts.length > 0) {
                        alternatives.push({
                            location: parts[0].trim().replace(/^[0-9\s.)-]+/, ''),
                            region: parts.length > 1 ? parts[1].trim() : ''
                        });
                    }
                });
            }
            
            // Parse travel tips (if any)
            const travelTips = [];
            const tipsMatch = responseText.match(/travel\s+tips[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is);
            if (tipsMatch && tipsMatch[1]) {
                const tipsText = tipsMatch[1];
                const tipsList = tipsText.split(/\n/).filter(line => line.trim() !== '');
                tipsList.forEach(tip => {
                    travelTips.push(tip.trim().replace(/^[0-9\s.)-]+/, ''));
                });
            }
            
            return {
                location: locationMatch ? locationMatch[1].trim() : 'Unknown Location',
                region: regionMatch ? regionMatch[1].trim() : '',
                confidence: confidenceMatch ? confidenceMatch[1].trim() : 'Low',
                description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available',
                alternatives: alternatives,
                travelTips: travelTips
            };
        } catch (error) {
            console.error('Error parsing location response:', error);
            return {
                location: 'Unknown Location',
                confidence: 'Low',
                description: 'Unable to parse location information from the response.'
            };
        }
    }

    /**
     * Show a notification message
     * @param {string} message - The message to display
     */
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<div class="notification-content">${message}</div>`;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
