document.addEventListener('DOMContentLoaded', function() {
    if (!Session.isLoggedIn()) {
        return;
    }

    initImageRecognition();

    function initImageRecognition() {
        const cameraButton = document.querySelector('.camera-tool');
        if (!cameraButton) return;

        createImageRecognitionModal();

        cameraButton.addEventListener('click', function() {
            showImageRecognitionModal();
        });
    }

    function createImageRecognitionModal() {
        const modal = document.createElement('div');
        modal.id = 'image-recognition-modal';
        modal.className = 'image-recognition-modal';
        
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
                        <textarea id="image-description" placeholder="Example: 'This is a photo I took during summer vacation', 'Can you  this historical landmark?', etc."></textarea>
                    </div>
                    
                    <div class="image-recognition-actions">
                        <button class="analyze-image-btn" id="analyze-image-btn" disabled>
                            <i class="fas fa-search-location"></i>  Location
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
        
        document.body.appendChild(modal);
        
        const closeButton = modal.querySelector('.image-recognition-close');
        closeButton.addEventListener('click', hideImageRecognitionModal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideImageRecognitionModal();
            }
        });
        
        initFileUpload();
        
        const analyzeButton = document.getElementById('analyze-image-btn');
        analyzeButton.addEventListener('click', analyzeImage);
        
        const newAnalysisButton = document.getElementById('new-analysis-btn');
        newAnalysisButton.addEventListener('click', resetImageRecognition);
        
        const searchLocationButton = document.getElementById('search-location-btn');
        searchLocationButton.addEventListener('click', searchIdentifiedLocation);
    }

    function initFileUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const uploadInput = document.getElementById('image-upload-input');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const removeButton = document.querySelector('.remove-image-btn');
        const analyzeButton = document.getElementById('analyze-image-btn');
        
        uploadArea.addEventListener('click', function() {
            uploadInput.click();
        });
        
        uploadInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files[0]);
        });
        
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
        
        removeButton.addEventListener('click', function() {
            uploadInput.value = '';
            previewArea.style.display = 'none';
            uploadArea.style.display = 'flex';
            analyzeButton.disabled = true;
        });
    }

    function handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            showNotification('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }
        
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const analyzeButton = document.getElementById('analyze-image-btn');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewArea.style.display = 'block';
            analyzeButton.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function analyzeImage() {
        const imagePreview = document.getElementById('uploaded-image-preview');
        const description = document.getElementById('image-description').value;
        const resultsArea = document.getElementById('image-recognition-results');
        const loadingArea = document.getElementById('image-recognition-loading');
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview-area');
        const descriptionArea = document.querySelector('.image-description-area');
        const actionsArea = document.querySelector('.image-recognition-actions');
        
        if (!imagePreview.src || imagePreview.src === '') {
            showNotification('Please upload an image to analyze');
            return;
        }
        
        loadingArea.style.display = 'flex';
        previewArea.style.display = 'none';
        descriptionArea.style.display = 'none';
        actionsArea.style.display = 'none';
        
        const imageData = imagePreview.src.split(',')[1];
        
        API.LocationFromImage(imageData, description)
            .then(response => {
                loadingArea.style.display = 'none';
                
                if (response.success) {
                    displayAnalysisResults(response.results, imagePreview.src);
                    resultsArea.style.display = 'block';
                } else {
                    showNotification('Error analyzing image: ' + response.message);
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

    function displayAnalysisResults(results, imageSrc) {
        const resultsContent = document.getElementById('results-content');
        
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
        
        resultsContent.innerHTML = html;
        document.getElementById('search-location-btn').dataset.location = results.location || '';
    }

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
        
        document.getElementById('image-description').value = '';
        document.getElementById('analyze-image-btn').disabled = true;
    }

    function resetImageRecognition() {
        const uploadInput = document.getElementById('image-upload-input');
        uploadInput.value = '';
        resetToUploadState();
    }

    function searchIdentifiedLocation() {
        const locationName = document.getElementById('search-location-btn').dataset.location;
        
        if (!locationName) {
            showNotification('No location identified to search');
            return;
        }
        
        hideImageRecognitionModal();
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.value = locationName;
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    function showImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<div class="notification-content">${message}</div>`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});

// API namespace for backend interactions
const API = API || {};

// Replace the current identifyLocationFromImage function with this:

API.identifyLocationFromImage = function(imageData, description = '') {
    return new Promise((resolve, reject) => {
        const mediaType = 'image/jpeg'; // Default to JPEG, but could detect from the data URL
        
        const promptText = description 
            ? `Identify this travel location: ${description}` 
            : 'What travel destination or landmark is shown in this image? Please identify the location, region/country, and provide a brief description of what makes this place notable for travelers.';
        
        const requestData = {
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 1024,
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
                            text: promptText
                        }
                    ]
                }
            ]
        };
        
        fetch('?action=callClaudeApi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                reject(new Error(data.message || 'API request failed'));
                return;
            }
            
            // Parse Claude's response to extract structured information
            const claudeResponse = data.data.content[0].text;
            
            try {
                // Extract location information from Claude's response
                const results = parseClaudeResponse(claudeResponse);
                resolve({
                    success: true,
                    results: results
                });
            } catch (error) {
                console.error('Error parsing Claude response:', error);
                reject(new Error('Error processing the response'));
            }
        })
        .catch(error => {
            console.error('API error:', error);
            reject(error);
        });
    });
};

// Helper function to parse Claude's response into structured data
function parseClaudeResponse(responseText) {
    // Initialize defaults
    const result = {
        location: 'Unknown Location',
        region: '',
        confidence: 'Low',
        description: '',
        alternatives: [],
        travelTips: []
    };
    
    // Extract the main location
    const locationMatch = responseText.match(/(?:This is|I can identify this as|This looks like|This appears to be) (.*?)(?:,|\.|in)/i);
    if (locationMatch && locationMatch[1]) {
        result.location = locationMatch[1].trim();
    }
    
    // Extract the region/country
    const regionMatch = responseText.match(/(?:located in|found in|situated in|in) (.*?)(?:\.|\n|$)/i);
    if (regionMatch && regionMatch[1]) {
        result.region = regionMatch[1].trim();
    }
    
    // Determine confidence level
    if (responseText.match(/confident|certain|definitely|clearly|easily recognizable/i)) {
        result.confidence = 'High';
    } else if (responseText.match(/appears to be|looks like|probably|likely|seems to be/i)) {
        result.confidence = 'Medium';
    }
    
    // Extract description - take a large chunk of text after the identification
    const descriptionMatch = responseText.match(/(?:This (?:is|appears to be|looks like).*?\.)(.{50,500})/s);
    if (descriptionMatch && descriptionMatch[1]) {
        result.description = descriptionMatch[1].trim();
    } else {
        // Fallback to take a portion after first paragraph
        const paragraphs = responseText.split('\n\n');
        if (paragraphs.length > 1) {
            result.description = paragraphs[1].trim();
        }
    }
    
    // Look for alternative suggestions
    if (responseText.match(/alternative|could also be|might be|possibly|another possibility/i)) {
        const altMatches = responseText.match(/(?:alternative|could also be|might be|possibly|another possibility).*?((?:[A-Z][a-zA-Z\s]+)(?:,|\sin\s)(?:[A-Z][a-zA-Z\s]+))/gi);
        if (altMatches) {
            altMatches.forEach(match => {
                const altLocationMatch = match.match(/((?:[A-Z][a-zA-Z\s]+)(?:,|\sin\s)(?:[A-Z][a-zA-Z\s]+))/i);
                if (altLocationMatch && altLocationMatch[1]) {
                    const parts = altLocationMatch[1].split(/,|\sin\s/i);
                    if (parts.length >= 2) {
                        result.alternatives.push({
                            location: parts[0].trim(),
                            region: parts[1].trim()
                        });
                    }
                }
            });
        }
    }
    
    // Extract travel tips
    const tipsSection = responseText.match(/(?:travel tips|for travelers|visitors should|recommended to|best time|notable for tourists|travel advice).*?((?:\n- .*){1,})/is);
    if (tipsSection && tipsSection[1]) {
        const tips = tipsSection[1].split('\n- ').filter(tip => tip.trim().length > 0);
        result.travelTips = tips.map(tip => tip.trim());
    }
    
    return result;
}
