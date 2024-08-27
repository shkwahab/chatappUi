// service-worker.js
self.addEventListener('push', (event) => {
    const data = event.data?.json();
    const title = data?.title || 'New Notification';
    const options = {
        body: data?.body || 'You have a new message!',
        icon: '/logo.png',
        data: data?.url || '/',
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});
