self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
    console.log("test as data json")
console.log(event?.data?.json)
console.log("test as data")
console.log(event?.data)
    // if (event.data) {
    //     console.log('Push data:', event.data.text()); // or .json() if JSON
    //     event.data.json().then(data => {
    //         const title = data?.title || 'New Notification';
    //         const options = {
    //             body: data?.body || 'You have a new message!',
    //             icon: '/favicon.svg',
    //             data: data?.url || '/',
    //         };
            
    //         event.waitUntil(
    //             self.registration.showNotification(title, options).catch(error => {
    //                 console.error('Error showing notification:', error);
    //             })
    //         );
    //     }).catch(error => {
    //         console.error('Error parsing push data:', error);
    //     });
    // } else {
    //     console.error('No data found in push event');
    // }
});
