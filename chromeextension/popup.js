// BIGG CHILLIN Chrome Extension - Popup Controller

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  const userEmail = document.getElementById('user-email');
  const userAvatar = document.getElementById('user-avatar');
  const videoUrlInput = document.getElementById('video-url');
  const instructionsInput = document.getElementById('instructions');
  const detectUrlBtn = document.getElementById('detect-url');
  const processBtn = document.getElementById('process-btn');
  const btnText = document.querySelector('.btn-text');
  const loadingSpinner = document.querySelector('.loading-spinner');

  // Initialize popup
  init();

  async function init() {
    // Check if user is already authenticated
    const result = await chrome.storage.local.get(['isAuthenticated', 'userInfo']);
    
    if (result.isAuthenticated && result.userInfo) {
      showUserInfo(result.userInfo);
    } else {
      showLoginButton();
    }

    // Auto-detect current tab URL if it's a video platform
    detectCurrentPageUrl();
  }

  // Event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  detectUrlBtn.addEventListener('click', detectCurrentPageUrl);
  processBtn.addEventListener('click', handleProcessVideo);
  
  // Enable/disable process button based on form completion
  videoUrlInput.addEventListener('input', validateForm);
  instructionsInput.addEventListener('input', validateForm);

  // Handle Google OAuth sign-in
  async function handleLogin() {
    try {
      loginBtn.textContent = 'Signing in...';
      loginBtn.disabled = true;

      const response = await chrome.runtime.sendMessage({ action: 'authenticate' });
      
      if (response.success) {
        showUserInfo(response.userInfo);
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Sign-in failed. Please try again.');
    } finally {
      loginBtn.textContent = 'Sign in with Google';
      loginBtn.disabled = false;
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'logout' });
      
      if (response.success) {
        showLoginButton();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Detect current page URL
  async function detectCurrentPageUrl() {
    try {
      detectUrlBtn.textContent = 'Detecting...';
      detectUrlBtn.disabled = true;

      const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });
      
      if (response.success) {
        const url = response.url;
        
        // Check if it's a supported video platform
        if (isSupportedVideoUrl(url)) {
          videoUrlInput.value = url;
          validateForm();
          
          // Show success feedback
          detectUrlBtn.textContent = '✓ Detected';
          setTimeout(() => {
            detectUrlBtn.textContent = 'Auto-detect current page';
            detectUrlBtn.disabled = false;
          }, 2000);
        } else {
          detectUrlBtn.textContent = 'Not a video page';
          setTimeout(() => {
            detectUrlBtn.textContent = 'Auto-detect current page';
            detectUrlBtn.disabled = false;
          }, 2000);
        }
      }
    } catch (error) {
      console.error('URL detection failed:', error);
      detectUrlBtn.textContent = 'Detection failed';
      setTimeout(() => {
        detectUrlBtn.textContent = 'Auto-detect current page';
        detectUrlBtn.disabled = false;
      }, 2000);
    }
  }

  // Handle video processing
  async function handleProcessVideo() {
    try {
      // Get user info
      const storage = await chrome.storage.local.get(['userInfo', 'isAuthenticated']);
      
      if (!storage.isAuthenticated || !storage.userInfo) {
        alert('Please sign in first');
        return;
      }

      const videoUrl = videoUrlInput.value.trim();
      const instructions = instructionsInput.value.trim();

      if (!videoUrl || !instructions) {
        alert('Please fill in both URL and instructions');
        return;
      }

      // Show loading state
      showLoadingState(true);

      // Send to background for processing
      const response = await chrome.runtime.sendMessage({
        action: 'processVideo',
        videoUrl: videoUrl,
        instructions: instructions,
        userEmail: storage.userInfo.email
      });

      if (response.success) {
        // Success feedback
        btnText.textContent = '✓ Sent to email!';
        setTimeout(() => {
          btnText.textContent = 'Process Video';
          showLoadingState(false);
        }, 3000);
        
        // Clear form
        videoUrlInput.value = '';
        instructionsInput.value = '';
        validateForm();
      } else {
        throw new Error(response.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Video processing failed:', error);
      alert('Processing failed. Please try again.');
      showLoadingState(false);
    }
  }

  // Show user info in UI
  function showUserInfo(user) {
    userEmail.textContent = user.email;
    userAvatar.src = user.picture || '';
    userInfo.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    validateForm();
  }

  // Show login button
  function showLoginButton() {
    userInfo.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    processBtn.disabled = true;
  }

  // Show/hide loading state
  function showLoadingState(loading) {
    if (loading) {
      btnText.classList.add('hidden');
      loadingSpinner.classList.remove('hidden');
      processBtn.disabled = true;
    } else {
      btnText.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
      validateForm();
    }
  }

  // Validate form and enable/disable process button
  function validateForm() {
    const hasUrl = videoUrlInput.value.trim().length > 0;
    const hasInstructions = instructionsInput.value.trim().length > 0;
    const isAuthenticated = !userInfo.classList.contains('hidden');
    
    processBtn.disabled = !(hasUrl && hasInstructions && isAuthenticated);
  }

  // Check if URL is from supported video platform
  function isSupportedVideoUrl(url) {
    const supportedDomains = [
      'tiktok.com',
      'instagram.com', 
      'youtube.com',
      'youtu.be'
    ];
    
    return supportedDomains.some(domain => url.includes(domain));
  }
});

// Handle any runtime errors
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'error') {
    console.error('Extension error:', message.error);
  }
}); 