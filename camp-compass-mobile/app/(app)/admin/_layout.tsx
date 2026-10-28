import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') return null;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: Colors.bgHeader },
        headerTitleStyle: { color: '#fff', fontWeight: '700', fontSize: 17 },
        contentStyle: { backgroundColor: Colors.bgBase },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard"      options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="timetables"     options={{ title: 'Timetable Management' }} />
      <Stack.Screen name="infrastructure" options={{ title: 'Infrastructure' }} />
      <Stack.Screen name="map"            options={{ title: 'Campus 3D Map' }} />
      <Stack.Screen name="submissions"    options={{ title: 'Availability Submissions' }} />
      <Stack.Screen name="notifications"  options={{ title: 'Notifications' }} />
      <Stack.Screen name="profile"        options={{ title: 'My Profile' }} />
    </Stack>
  );
}
