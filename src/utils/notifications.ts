import { soundEffects } from "./soundEffects";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      localStorage.setItem("notificationPermission", "granted");
      soundEffects.play("notification");
      
      // Register service worker
      await registerServiceWorker();
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/notification-worker.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('Push notifications not supported in this browser');
    return null;
  }
};

export const scheduleNotification = () => {
  // Schedule daily notification at 12:15 MSK
  const now = new Date();
  const mskOffset = 3; // UTC+3 for Moscow
  const userOffset = -now.getTimezoneOffset() / 60;
  const offsetDiff = mskOffset - userOffset;
  
  // Target time 12:15 MSK converted to user's local time
  const targetHour = 12 - offsetDiff;
  const targetMinute = 15;
  
  const scheduleTime = new Date();
  scheduleTime.setHours(targetHour, targetMinute, 0, 0);
  
  // If it's already past target time, schedule for next day
  if (now > scheduleTime) {
    scheduleTime.setDate(scheduleTime.getDate() + 1);
  }
  
  const timeUntilNotification = scheduleTime.getTime() - now.getTime();
  
  console.log(`Scheduling notification for ${scheduleTime.toLocaleString()}, which is in ${Math.round(timeUntilNotification/1000/60)} minutes`);
  
  // Save scheduling information in localStorage for service worker
  localStorage.setItem('nextNotificationTime', scheduleTime.getTime().toString());
  
  // Set up a persistent notification using background sync
  setupBackgroundNotification(scheduleTime);
  
  // Still keep the setTimeout for when tab is open
  setTimeout(() => {
    sendNotification();
    // Schedule next notification for tomorrow
    scheduleNotification();
  }, timeUntilNotification);
};

const setupBackgroundNotification = async (scheduleTime) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Try to use Background Sync API if available
      if ('SyncManager' in window) {
        await registration.sync.register('notification-sync');
      }
      
      // Set up a notification using the Push API if possible
      // Note: This would typically require a push server, but we're setting up the basics
      // The full implementation would need a backend push service
      console.log('Background notification scheduled for:', scheduleTime.toLocaleString());
    } catch (error) {
      console.error('Error setting up background notification:', error);
    }
  }
};

const notificationMessages = [
  "🎬 Новые фильмы уже ждут тебя!",
  "🍿 Время для нового кино!",
  "🎥 Загляни к нам - появились новинки!",
  "🌟 Твой вечер станет лучше с новым фильмом!",
  "📽️ Новые фильмы добавлены специально для тебя!"
];

const sendNotification = () => {
  if (Notification.permission === "granted") {
    soundEffects.play("notification");
    const randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    
    // Use service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("EvloevFilm", {
          body: randomMessage,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: {
            url: '/'
          }
        });
      });
    } else {
      // Fallback to regular notification
      new Notification("EvloevFilm", {
        body: randomMessage,
        icon: "/favicon.ico"
      });
    }
  }
};
