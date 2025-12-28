import { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Show prompt after a delay if installable and not already shown
    if (isInstallable && !localStorage.getItem('installPromptShown')) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    
    if (success) {
      setShowPrompt(false);
      localStorage.setItem('installPromptShown', 'true');
    }
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptShown', 'true');
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  const handleLater = () => {
    setShowPrompt(false);
    // Show again in 24 hours
    localStorage.setItem('installPromptLater', (Date.now() + 24 * 60 * 60 * 1000).toString());
  };

  // Don't show if installed or not installable or recently dismissed
  if (!isInstallable || isInstalled || !showPrompt) {
    return null;
  }

  // Check if user said "later" recently
  const laterTime = localStorage.getItem('installPromptLater');
  if (laterTime && Date.now() < parseInt(laterTime)) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Prompt Card */}
        <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl sm:rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Install Task Manager Pro</h3>
                <p className="text-blue-100 text-sm mt-1">Get the full app experience!</p>
              </div>
              <div className="text-3xl">📱</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="text-gray-600">
                <p className="mb-4">Install our app for the best experience with:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Offline access to your content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Push notifications for new videos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Faster loading and performance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Native app-like experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Home screen access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <span>📲</span>
                  <span>Install App</span>
                </>
              )}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleLater}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition duration-200"
              >
                Maybe Later
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition duration-200"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}