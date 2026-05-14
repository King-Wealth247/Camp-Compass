importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "mock-api-key",
  projectId: "mock-project",
  messagingSenderId: "mock-sender",
  appId: "mock-app"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  try {
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage(function(payload) {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (e) {
    console.warn('FCM Background messaging not supported/configured properly.');
  }
}
