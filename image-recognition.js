/**
 * Image to Location Recognition Feature
 * This module handles image uploads and uses Claude Vision (or your backend) 
 * to identify travel destinations.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if the user is logged in
    if (!Session.isLoggedIn()) {
        return;
    }
  
    // Initialize the image recognition feature
    initImageRecognition();
  
    /**
     * Initialize the image recognition feature.
     * It finds the camera tool, creates the modal (if not already created),
     * and binds the click event to show the modal.
     */
    function initImageRecognition() {
        // Locate the camera tool button in the UI.
        const cameraButton = document.querySelector('.camera-tool');
        if (!cameraButton) return;
  
        // Create and append the image recognition modal to the document.
        createImageRecognitionModal();
  
        // When the camera button is clicked, show the modal.
        cameraButton.addEventListener('click', function() {
            showImageRecognitionModal();
        });
    }
  
    /**
     * Create the image recognition modal.
     * This builds the modal structure, appends it to the DOM,
     * and sets up event listeners for file upload, closing the modal,
     * analyzing the image, and resetting the UI.
     */
    function createImageRecognitionModal() {
        // Create the modal container.
        const modal = document.createElement('div');
        modal.id = 'image-recognition-modal';
        modal.className = 'image-recognition-modal';
  
        // Insert modal HTML.
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
  
        // Append the modal to the document body.
        document.body.appendChild(modal);
  
        // Bind close events.
        const closeButton = modal.querySelector('.image-recognition-close');
        closeButton.addEventListener('click', hideImageRecognitionModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideImageRecognitionModal();
            }
        });
  
        // Initialize file upload functionality.
        initFileUpload();
  
        // Bind analyze button to our analyzeImage function.
        const analyzeButton = document.getElementById('analyze-image-btn');
        analyzeButton.addEventListener('click', analyzeImage);
  
        // Bind new analysis and search location buttons.
        const newAnalysisButton = document.getElementById('new-analysis-btn');
        newAnalysisButton.addEventListener('click', resetImageRecognition);
        const searchLocationButton = document.getElementById('search-location-btn');
        searchLocationButton.addEventListener('click', searchIdentifiedLocation);
    }
  
    /**
     * Initialize file upload functionality.
     * Sets up click-to-upload, drag-and-drop, previewing, and removal.
     */
    function initFileUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const uploadInput = document.getElementById('image-upload-input');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const removeButton = document.querySelector('.remove-image-btn');
        const analyzeButton = document.getElementById('analyze-image-btn');
  
        // Clicking the area triggers the hidden file input.
        uploadArea.addEventListener('click', function() {
            uploadInput.click();
        });
  
        // When a file is selected.
        uploadInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files[0]);
        });
  
        // Drag over events.
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
  
        // Remove file action.
        removeButton.addEventListener('click', function() {
            uploadInput.value = '';
            previewArea.style.display = 'none';
            uploadArea.style.display = 'flex';
            analyzeButton.disabled = true;
        });
    }
  
    /**
     * Reads and previews the uploaded image file.
     * @param {File} file - The file uploaded by the user.
     */
    function handleFileUpload(file) {
        // Validate that a file was provided and is an image.
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
  
    /**
     * Analyze the uploaded image using a standard fetch POST call.
     * This replaces a JSONP approach so that the ad blocker (or similar) won’t block the request.
     */
    function analyzeImage() {
        const imagePreview = document.getElementById('uploaded-image-preview');
        const description = document.getElementById('image-description').value;
        const resultsArea = document.getElementById('image-recognition-results');
        const loadingArea = document.getElementById('image-recognition-loading');
        const previewArea = document.getElementById('image-preview-area');
        const descriptionArea = document.querySelector('.image-description-area');
        const actionsArea = document.querySelector('.image-recognition-actions');
  
        if (!imagePreview.src || imagePreview.src === '') {
            showNotification('Please upload an image to analyze');
            return;
        }
  
        // Show loading state
        loadingArea.style.display = 'flex';
        previewArea.style.display = 'none';
        descriptionArea.style.display = 'none';
        actionsArea.style.display = 'none';
  
        // Get base64 image data (strip off the data URL prefix)
        const imageData = imagePreview.src.split(',')[1];
  
        // Use fetch to call the backend endpoint (update the URL if needed).
        // Note: The backend must accept a POST with JSON and return proper CORS headers.
        fetch('https://script.google.com/macros/s/AKfycbzCuzX3RgjMuz6OsX1f3mEunxbuxK2xkwOMKdTDYJvVGfKNIcaLtXh-hN008SMn_wvgpQ/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'identifyLocation',
                image: imageData,
                description: description
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadingArea.style.display = 'none';
            if (data.success) {
                displayAnalysisResults(data.results, imagePreview.src);
                resultsArea.style.display = 'block';
            } else {
                showNotification('Error analyzing image: ' + data.message);
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
     * Display the analysis results received from the backend.
     * @param {Object} results - The analysis results.
     * @param {string} imageSrc - The base64 source of the analyzed image.
     */
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
        // Store the determined location into the search button
        document.getElementById('search-location-btn').dataset.location = results.location || '';
    }
  
    /**
     * Return a CSS class based on the confidence description.
     * @param {string} confidence - The confidence level as a string.
     * @returns {string} - 'high', 'medium', or 'low'
     */
    function getConfidenceClass(confidence) {
        if (!confidence) return 'low';
        const lower = confidence.toLowerCase();
        if (lower.includes('high') || lower.includes('very') || lower.includes('strong')) {
            return 'high';
        } else if (lower.includes('medium') || lower.includes('moderate')) {
            return 'medium';
        } else {
            return 'low';
        }
    }
  
    /**
     * Reset the UI back to the upload state (for reuploading or on error).
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
  
        document.getElementById('image-description').value = '';
        document.getElementById('analyze-image-btn').disabled = true;
    }
  
    /**
     * Resets the entire image recognition process.
     */
    function resetImageRecognition() {
        const uploadInput = document.getElementById('image-upload-input');
        uploadInput.value = '';
        resetToUploadState();
    }
  
    /**
     * When the user clicks the search button in the results, use the identified location 
     * to trigger a search in the main app.
     */
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
  
    /**
     * Show the image recognition modal by adding the "active" class.
     */
    function showImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
  
    /**
     * Hide the modal and restore scrolling.
     */
    function hideImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
  
    /**
     * Display a notification message on screen.
     * @param {string} message - The message to show.
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<div class="notification-content">${message}</div>`;
        
        // Inline styles for basic notification (you can customize or move these to your stylesheet)
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.background = 'var(--primary)';
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
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
  });