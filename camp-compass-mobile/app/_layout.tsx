import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '@/context/AuthContext';
import { SyncStatusBanner } from '@/components/SyncStatusBanner';
import { initOfflineSync } from '@/lib/offlineQueue';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function RootLayout() {
  useEffect(() => {
    // Pre-load token once, then keep a live reference for queue drain
    let cachedToken: string | undefined;
    AsyncStorage.getItem('auth_token').then((t) => { cachedToken = t ?? undefined; });

    // Initialize offline sync — getter always returns latest token
    initOfflineSync(API_BASE, () => cachedToken);

    // Register push notifications
    async function register() {
      const { registerForPushNotificationsAsync } = await import('@/lib/pushNotifications');
      await registerForPushNotificationsAsync();
    }
    register();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      {/* Slides in automatically when offline or syncing */}
      <SyncStatusBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}
