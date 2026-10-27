import { Drawer } from 'expo-router/drawer';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Map, Calendar, Building2, Bell, Clock, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') return null;

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: Colors.bgHeader },
        headerTitleStyle: { color: '#fff', fontWeight: '700', fontSize: 17 },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerStyle: { backgroundColor: Colors.bgCard, width: 260 },
        drawerLabelStyle: { fontWeight: '600', fontSize: 14 },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Admin Dashboard',
          drawerIcon: ({ color }: { color: string }) => <LayoutDashboard color={color} size={20} />,
        }}
      />
      <Drawer.Screen
        name="timetables"
        options={{
          drawerLabel: 'Timetables',
          title: 'Timetable Management',
          drawerIcon: ({ color }: { color: string }) => <Calendar color={color} size={20} />,
        }}
      />
      <Drawer.Screen
        name="infrastructure"
        options={{
          drawerLabel: 'Infrastructure',
          title: 'Infrastructure Management',
          drawerIcon: ({ color }: { color: string }) => <Building2 color={color} size={20} />,
        }}
      />
      <Drawer.Screen
        name="map"
        options={{
          drawerLabel: 'Campus 3D Map',
          title: 'Campus 3D Map',
          drawerIcon: ({ color }: { color: string }) => <Map color={color} size={20} />,
        }}
      />
      <Drawer.Screen
        name="submissions"
        options={{
          drawerLabel: 'Submissions',
          title: 'Availability Submissions',
          drawerIcon: ({ color }: { color: string }) => <Clock color={color} size={20} />,
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
          drawerIcon: ({ color }: { color: string }) => <Bell color={color} size={20} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'My Profile',
          drawerIcon: ({ color }: { color: string }) => <User color={color} size={20} />,
        }}
      />
    </Drawer>
  );
}
