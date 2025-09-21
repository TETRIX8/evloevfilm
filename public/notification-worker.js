
self.addEventListener('install', event => {
  console.log('Notification Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('Notification Service Worker activated');
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Новые фильмы ждут тебя!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('EvloevFilm', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Check periodically if we need to show a notification
self.addEventListener('periodicsync', event => {
  if (event.tag === 'show-daily-notification') {
    event.waitUntil(checkScheduledNotifications());
  }
});

// Also check when online again
self.addEventListener('sync', event => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(checkScheduledNotifications());
  }
});

async function checkScheduledNotifications() {
  try {
    const clients = await self.clients.matchAll();
    
    // If there are no clients, we might need to show notification
    if (clients.length === 0) {
      const notificationTime = parseInt(localStorage.getItem('notificationTime') || '0', 10);
      const now = Date.now();
      
      if (notificationTime > 0 && now >= notificationTime) {
        // Show the notification as scheduled
        await self.registration.showNotification('EvloevFilm', {
          body: 'Новые фильмы ждут тебя!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: {
            url: '/'
          }
        });
        
        // Update the scheduled time for next day
        const nextDay = new Date(notificationTime);
        nextDay.setDate(nextDay.getDate() + 1);
        localStorage.setItem('notificationTime', nextDay.getTime().toString());
      }
    }
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
  }
}
