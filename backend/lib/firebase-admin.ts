import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Note: In a real production scenario, you would provide service account credentials
// via environment variables (e.g., process.env.FIREBASE_SERVICE_ACCOUNT)
// For this environment, we'll try to initialize, but gracefully fail/mock if credentials aren't present.
try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin initialized.');
    } else {
      console.warn('FIREBASE_PROJECT_ID not set. Push notifications will be mocked.');
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const sendPushNotification = async (tokens: string[], title: string, body: string, data?: any) => {
  if (!tokens || tokens.length === 0) return;

  if (admin.apps.length > 0) {
    try {
      const message = {
        notification: { title, body },
        data: data || {},
        tokens,
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  } else {
    // Mock push notification
    console.log(`[MOCK PUSH] Sending to ${tokens.length} tokens: ${title} - ${body}`);
  }
};
