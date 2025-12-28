import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Get existing subscription
      getSubscription();
    }
  }, []);

  const getSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to get push subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID keys for your app (you'd need to implement this on backend)
      const applicationServerKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual key
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      setSubscription(sub);
      
      // Send subscription to your backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: sub,
          userAgent: navigator.userAgent
        })
      });

      return sub;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Notify backend
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  };

  const showNotification = async (title, options = {}) => {
    if (permission !== 'granted') return;

    const notification = new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      ...options
    });

    return notification;
  };

  return {
    permission,
    isSupported,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification
  };
};