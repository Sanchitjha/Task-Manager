import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add global error handler
window.addEventListener('error', (event) => {
	console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
	console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[PWA] Service Worker registered successfully:', registration.scope);
      
      // Track if we've already shown update notification
      let updateShown = false;
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !updateShown) {
            updateShown = true;
            
            // Show a less intrusive update notification
            showUpdateNotification();
          }
        });
      });
      
      // Check for updates only once when app starts
      registration.update();
      
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      window.location.reload();
    }
  });
}

// Create a less intrusive update notification
function showUpdateNotification() {
  // Create update banner
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #2563eb;
    color: white;
    padding: 12px;
    text-align: center;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `;
  
  updateBanner.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 16px;">
      <span>🔄 New version available!</span>
      <button id="pwa-update-btn" style="
        background: white;
        color: #2563eb;
        border: none;
        padding: 6px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      ">Update Now</button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 6px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Later</button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  // Handle update button click
  document.getElementById('pwa-update-btn').addEventListener('click', () => {
    window.location.reload();
  });
  
  // Handle dismiss button click
  document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
    updateBanner.remove();
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById('pwa-update-banner')) {
      updateBanner.remove();
    }
  }, 10000);
}
