/* Image to Location Recognition Feature
   This module handles image uploads and uses Claude Vision to identify travel destinations
*/
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize the feature if the user is logged in
    if (!Session.isLoggedIn()) {
        return;
    }

    // Initialize the image recognition feature
    initImageRecognition();

    /**
     * Initialize the image recognition feature.
     * It looks for the camera tool button, creates the modal, and binds the click event.
     */
    function initImageRecognition() {
        // Find the camera tool button in the UI
        const cameraButton = document.querySelector('.camera-tool');
        if (!cameraButton) return;

        // Build the image recognition modal and add it to the document
        createImageRecognitionModal();

        // When the camera button is clicked, show the recognition modal
        cameraButton.addEventListener('click', function() {
            showImageRecognitionModal();
        });
    }

    /**
     * Creates and appends the image recognition modal to the DOM.
     * Also initializes file upload behavior & binds the various button events.
     */
    function createImageRecognitionModal() {
        // Create modal container and assign an id and class
        const modal = document.createElement('div');
        modal.id = 'image-recognition-modal';
        modal.className = 'image-recognition-modal';
        
        // Modal content structure
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
        
        // Append the modal to the body so it exists in the DOM
        document.body.appendChild(modal);
        
        // Bind the close button event so that clicking it hides the modal.
        const closeButton = modal.querySelector('.image-recognition-close');
        closeButton.addEventListener('click', hideImageRecognitionModal);
        
        // Also close the modal if user clicks outside the modal content.
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideImageRecognitionModal();
            }
        });
        
        // Initialize file upload functionality (click, drag & drop, file change, removal)
        initFileUpload();
        
        // Bind the analyze button event
        const analyzeButton = document.getElementById('analyze-image-btn');
        analyzeButton.addEventListener('click', analyzeImage);
        
        // Bind the new analysis button event
        const newAnalysisButton = document.getElementById('new-analysis-btn');
        newAnalysisButton.addEventListener('click', resetImageRecognition);
        
        // Bind the search location button event so that users can search for the identified location.
        const searchLocationButton = document.getElementById('search-location-btn');
        searchLocationButton.addEventListener('click', searchIdentifiedLocation);
    }

    /**
     * Initialize file upload functionality.
     * Handles clicking, drag & drop, previewing the selected file, and removal.
     */
    function initFileUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const uploadInput = document.getElementById('image-upload-input');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const removeButton = document.querySelector('.remove-image-btn');
        const analyzeButton = document.getElementById('analyze-image-btn');
        
        // Clicking the upload area triggers the hidden file input
        uploadArea.addEventListener('click', function() {
            uploadInput.click();
        });
        
        // When user selects a file
        uploadInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files[0]);
        });
        
        // Enable drag-over styling
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('dragover');
        });
        
        // Handle dropped file
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
        
        // Remove selected image and reset view when remove button is clicked
        removeButton.addEventListener('click', function() {
            uploadInput.value = '';
            previewArea.style.display = 'none';
            uploadArea.style.display = 'flex';
            analyzeButton.disabled = true;
        });
    }

    /**
     * Handle uploading and previewing a file.
     * @param {File} file – The file uploaded by the user.
     */
    function handleFileUpload(file) {
        // Ensure a file was provided and that it is an image
        if (!file || !file.type.startsWith('image/')) {
            showNotification('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }
        
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview-area');
        const imagePreview = document.getElementById('uploaded-image-preview');
        const analyzeButton = document.getElementById('analyze-image-btn');
        
        // Read the file and load a base64 data URL for preview
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
     * Initiate the image analysis using Claude Vision (via your API).
     */
    function analyzeImage() {
        const imagePreview = document.getElementById('uploaded-image-preview');
        const description = document.getElementById('image-description').value;
        const resultsArea = document.getElementById('image-recognition-results');
        const loadingArea = document.getElementById('image-recognition-loading');
        const previewArea = document.getElementById('image-preview-area');
        const descriptionArea = document.querySelector('.image-description-area');
        const actionsArea = document.querySelector('.image-recognition-actions');
        
        // Check that an image has been uploaded
        if (!imagePreview.src || imagePreview.src === '') {
            showNotification('Please upload an image to analyze');
            return;
        }
        
        // Show a loading state while the image is being processed
        loadingArea.style.display = 'flex';
        previewArea.style.display = 'none';
        descriptionArea.style.display = 'none';
        actionsArea.style.display = 'none';
        
        // Remove the data URL prefix to get the base64 image data
        const imageData = imagePreview.src.split(',')[1];
        
        // Call your API to perform image analysis (replace API.identifyLocationFromImage with your own API call)
        API.identifyLocationFromImage(imageData, description)
            .then(response => {
                loadingArea.style.display = 'none';
                
                if (response.success) {
                    // If the analysis is successful, display the results
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

    /**
     * Display the analysis results returned from the API.
     * @param {Object} results – Analysis results object.
     * @param {string} imageSrc – Source URL (base64) of the analyzed image.
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
        
        // If the API provides alternative possibilities or travel tips, add them here.
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
        // Store the identified location into the search button for later use
        document.getElementById('search-location-btn').dataset.location = results.location || '';
    }

    /**
     * Returns a CSS class string based on the confidence level.
     * @param {string} confidence – A string that should include keywords such as "High", "Medium", or "Low".
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
     * Resets the UI back to the upload state.
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
        
        // Clear any text in the description
        document.getElementById('image-description').value = '';
        // Disable the analyze button until a new image is uploaded
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
     * When the identified location is clicked on the results, use it to trigger a search.
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
     * Shows the image recognition modal by adding the "active" class and preventing scrolling.
     */
    function showImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hides the image recognition modal and restores scrolling.
     */
    function hideImageRecognitionModal() {
        const modal = document.getElementById('image-recognition-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Displays a simple notification message on the screen.
     * @param {string} message – The text of the notification.
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<div class="notification-content">${message}</div>`;
        
        // Basic styling (you can adjust or move these to your CSS)
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
