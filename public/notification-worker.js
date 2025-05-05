
self.addEventListener('install', event => {
  console.log('Notification Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('Notification Service Worker activated');
});

self.addEventListener('push', event => {
  const data = event.data.json();
  
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
