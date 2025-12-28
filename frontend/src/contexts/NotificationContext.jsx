import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-800' 
                : notification.type === 'warning'
                ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                : 'bg-blue-50 border-blue-400 text-blue-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">
                  {notification.type === 'success' ? '✅' 
                   : notification.type === 'error' ? '❌'
                   : notification.type === 'warning' ? '⚠️'
                   : 'ℹ️'}
                </span>
                <p className="font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};