import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app",
};

// Initialize Firebase only if we have a real config (otherwise mock to prevent errors)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const requestForToken = async () => {
  if (typeof window === 'undefined') return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn("FCM disabled: Missing NEXT_PUBLIC_FIREBASE_API_KEY");
    return null;
  }
  try {
    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, { 
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
    });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token.', err);
    return null;
  }
};

export const onMessageListener = () => {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return new Promise((resolve) => {});
  const messaging = getMessaging(app);
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
