import { Drawer } from 'expo-router/drawer';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Map, Calendar, Building2, Bell, Clock, User } from 'lucide-react-native';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') return null;

  return (
    <Drawer screenOptions={{ 
      headerShown: true,
      headerTintColor: '#fff',
      headerStyle: { backgroundColor: '#2563EB' },
      drawerActiveTintColor: '#2563EB',
    }}>
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Admin Dashboard',
          drawerIcon: ({ color }) => <LayoutDashboard color={color} size={20} />
        }}
      />
      <Drawer.Screen
        name="infrastructure"
        options={{
          drawerLabel: 'Infrastructure',
          title: 'Infrastructure Management',
          drawerIcon: ({ color }) => <Building2 color={color} size={20} />
        }}
      />
      <Drawer.Screen
        name="timetables"
        options={{
          drawerLabel: 'Timetables',
          title: 'Timetable Management',
          drawerIcon: ({ color }) => <Calendar color={color} size={20} />
        }}
      />
      <Drawer.Screen
        name="submissions"
        options={{
          drawerLabel: 'Submissions',
          title: 'Submissions',
          drawerIcon: ({ color }) => <Clock color={color} size={20} />
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
          drawerIcon: ({ color }) => <Bell color={color} size={20} />
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'My Profile',
          drawerIcon: ({ color }) => <User color={color} size={20} />
        }}
      />
    </Drawer>
  );
}
