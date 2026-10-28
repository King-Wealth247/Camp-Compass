import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef } from 'react';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const mounted = useRef(false);

  useEffect(() => {
    // Mark as mounted after first render — Expo Router is ready now
    mounted.current = true;
  }, []);

  useEffect(() => {
    // Don't redirect while auth is still loading or before navigator mounts
    if (loading || !mounted.current) return;

    if (!user) {
      // Use requestAnimationFrame to defer until after the current render cycle
      const id = requestAnimationFrame(() => {
        router.replace('/login');
      });
      return () => cancelAnimationFrame(id);
    }
  }, [user, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="student/dashboard" />
      <Stack.Screen name="student/timetable" />
      <Stack.Screen name="student/map" />
      <Stack.Screen name="student/notifications" />
      <Stack.Screen name="staff/dashboard" />
      <Stack.Screen name="staff/timetable" />
      <Stack.Screen name="staff/availability" />
      <Stack.Screen name="staff/notifications" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="registrar/dashboard" />
    </Stack>
  );
}
