// Background service worker for BIGG CHILLIN Chrome Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('BIGG CHILLIN extension installed');
});

// Handle OAuth authentication
async function authenticateUser() {
  try {
    console.log('Starting authentication...');
    const token = await chrome.identity.getAuthToken({ interactive: true });
    console.log('Got token:', token ? 'SUCCESS' : 'FAILED');
    
    if (!token) {
      throw new Error('No token received from Google');
    }
    
    // Get user info from Google
    console.log('Fetching user info...');
    const userInfo = await chrome.identity.getProfileUserInfo();
    console.log('User info received:', userInfo);
    
    // Store user info in extension storage
    await chrome.storage.local.set({
      userToken: token,
      userInfo: userInfo,
      isAuthenticated: true
    });
    
    return userInfo;
  } catch (error) {
    console.error('Authentication failed:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Handle logout
async function logoutUser() {
  try {
    // Get current token
    const result = await chrome.storage.local.get(['userToken']);
    const token = result.userToken;
    
    if (token) {
      // Revoke token
      await chrome.identity.removeCachedAuthToken({ token });
    }
    
    // Clear storage
    await chrome.storage.local.remove(['userToken', 'userInfo', 'isAuthenticated']);
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Process video with backend API
async function processVideo(videoUrl, instructions, userEmail) {
  try {
    const response = await fetch('https://bingchillin-production.up.railway.app/chromeextension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          fields: [
            {
              label: "email",
              value: userEmail
            },
            {
              label: "video URL (tiktok, ig reel, and such)",
              value: videoUrl
            },
            {
              label: "Your Information + Who are you? (Either Summarize what you want to do with the video and who you are)",
              value: instructions
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Video processing failed:', error);
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'authenticate') {
    authenticateUser()
      .then(userInfo => sendResponse({ success: true, userInfo }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'logout') {
    logoutUser()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'processVideo') {
    processVideo(request.videoUrl, request.instructions, request.userEmail)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'getCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ success: true, url: tabs[0].url });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }
});

// Helper function to check if URL is a supported video platform
function isSupportedVideoUrl(url) {
  const supportedDomains = [
    'tiktok.com',
    'instagram.com',
    'youtube.com',
    'youtu.be'
  ];
  
  return supportedDomains.some(domain => url.includes(domain));
}

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    authenticateUser,
    logoutUser,
    processVideo,
    isSupportedVideoUrl
  };
} 