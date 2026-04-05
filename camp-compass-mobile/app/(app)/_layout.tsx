import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

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
      <Stack.Screen name="admin/dashboard" />
      <Stack.Screen name="admin/timetable" />
      <Stack.Screen name="admin/map" />
      <Stack.Screen name="registrar/dashboard" />
    </Stack>
  );
}
