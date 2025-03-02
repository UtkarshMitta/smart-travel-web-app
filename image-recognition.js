/* image‐recognition.js */

// Wrap everything in an IIFE so we don’t pollute global scope
(function() {
  let selectedImageData = null; // Will store the base64 image data

  // Create the modal HTML dynamically
  function createImageRecognitionModal() {
    const modal = document.createElement('div');
    modal.id = 'image-recognition-modal';
    modal.className = 'image-recognition-modal';
    modal.innerHTML = `
      <div class="image-recognition-container">
        <div class="image-recognition-header">
          <h3>Identify Location</h3>
          <button class="close-modal" title="Close">&times;</button>
        </div>
        <div class="image-recognition-body">
          <div class="image-upload-area" id="image-upload-area">
            <p>Drag &amp; drop an image here, or click to select</p>
            <input type="file" id="image-file-input" accept="image/*" style="display:none">
          </div>
          <div class="image-description-area">
            <textarea id="image-description" placeholder="Add a description (optional)"></textarea>
          </div>
          <button id="identify-btn" class="save-btn">Identify Location</button>
          <div id="image-recognition-loading" class="image-recognition-loading"></div>
          <div id="image-recognition-results" class="image-recognition-results"></div>
        </div>
      </div>
    `;
    // Attach close-on-click for modal background (if clicked outside container)
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeImageRecognitionModal();
      }
    });
    return modal;
  }

  // Open the modal – create it if it does not exist yet
  function openImageRecognitionModal() {
    let modal = document.getElementById('image-recognition-modal');
    if (!modal) {
      modal = createImageRecognitionModal();
      document.body.appendChild(modal);
      attachModalEvents(modal);
    }
    // Reset any previous results and image data
    selectedImageData = null;
    resetModalContent(modal);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  // Close the modal
  function closeImageRecognitionModal() {
    const modal = document.getElementById('image-recognition-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Reset content in the modal (upload area text, description, results, loader)
  function resetModalContent(modal) {
    const uploadArea = modal.querySelector('#image-upload-area');
    if (uploadArea) {
      uploadArea.innerHTML = '<p>Drag &amp; drop an image here, or click to select</p>';
    }
    const description = modal.querySelector('#image-description');
    if (description) {
      description.value = '';
    }
    const loadingDiv = modal.querySelector('#image-recognition-loading');
    if (loadingDiv) {
      loadingDiv.innerHTML = '';
    }
    const resultsDiv = modal.querySelector('#image-recognition-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = '';
    }
  }

  // Process the selected file and convert it to base64
  function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedImageData = e.target.result; // This is the base64 data URL
        // Show a preview inside the upload area
        const uploadArea = document.getElementById('image-upload-area');
        if (uploadArea) {
          uploadArea.innerHTML = `<img src="${selectedImageData}" alt="Preview" style="max-width:100%; max-height:200px;">`;
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  }

  // Attach event listeners for the modal content
  function attachModalEvents(modal) {
    const uploadArea = modal.querySelector('#image-upload-area');
    const fileInput = modal.querySelector('#image-file-input');
    const identifyBtn = modal.querySelector('#identify-btn');
    const closeBtn = modal.querySelector('.close-modal');

    // When the upload area is clicked, trigger the file input
    uploadArea.addEventListener('click', function() {
      fileInput.click();
    });

    // File input change event
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    // Drag over and drag leave for visual feedback
    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    // When the identify button is clicked, send the image and description to the API
    identifyBtn.addEventListener('click', async function() {
      if (!selectedImageData) {
        alert('Please upload an image first.');
        return;
      }
      const description = modal.querySelector('#image-description').value.trim();
      const loadingDiv = modal.querySelector('#image-recognition-loading');
      const resultsDiv = modal.querySelector('#image-recognition-results');

      // Show a simple loading spinner/message
      loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Identifying location...</p>
      `;
      resultsDiv.innerHTML = '';
      try {
        // Call the backend to process the image; the API call is handled via JSONP.
        const response = await API.identifyLocationFromImage(selectedImageData, description);
        // Clear the loading indicator
        loadingDiv.innerHTML = '';
        if (response.success) {
          resultsDiv.innerHTML = `
            <div class="recognized-location">
              <h4>Location Identified: ${response.location || 'Unknown'}</h4>
              <p>${response.message || ''}</p>
            </div>
          `;
        } else {
          resultsDiv.innerHTML = `
            <div class="error">
              <p>Error identifying location: ${response.message || 'Unknown error.'}</p>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error during location identification:', error);
        loadingDiv.innerHTML = '';
        resultsDiv.innerHTML = `
          <div class="error">
            <p>Error: ${error.message || 'Network error.'}</p>
          </div>
        `;
      }
    });

    // Close the modal when the close button is clicked
    closeBtn.addEventListener('click', closeImageRecognitionModal);
  }

  // Override (or initialize) the camera tool so that clicking it opens our modal
  function initCameraTool() {
    const cameraTool = document.querySelector('.camera-tool');
    if (cameraTool) {
      // Remove any existing click handlers if necessary and set our function
      cameraTool.onclick = function(e) {
        e.preventDefault();
        openImageRecognitionModal();
      };
    }
  }

  // Initialize our camera tool override once the page loads
  document.addEventListener('DOMContentLoaded', function() {
    initCameraTool();
  });

})(); 
