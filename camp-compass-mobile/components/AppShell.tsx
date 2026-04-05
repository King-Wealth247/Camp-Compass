import { ReactNode } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Map, Calendar, Bell, Clock,
  Users, LogOut, ChevronLeft,
} from 'lucide-react-native';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  href: string;
}

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'student':
      return [
        { label: 'Home', icon: LayoutDashboard, href: '/(app)/student/dashboard' },
        { label: 'Timetable', icon: Calendar, href: '/(app)/student/timetable' },
        { label: 'Map', icon: Map, href: '/(app)/student/map' },
        { label: 'Alerts', icon: Bell, href: '/(app)/student/notifications' },
      ];
    case 'staff':
      return [
        { label: 'Home', icon: LayoutDashboard, href: '/(app)/staff/dashboard' },
        { label: 'Schedule', icon: Calendar, href: '/(app)/staff/timetable' },
        { label: 'Availability', icon: Clock, href: '/(app)/staff/availability' },
        { label: 'Alerts', icon: Bell, href: '/(app)/staff/notifications' },
      ];
    case 'admin':
      return [
        { label: 'Home', icon: LayoutDashboard, href: '/(app)/admin/dashboard' },
        { label: 'Timetable', icon: Calendar, href: '/(app)/admin/timetable' },
        { label: 'Map', icon: Map, href: '/(app)/admin/map' },
      ];
    case 'registrar':
      return [
        { label: 'Home', icon: LayoutDashboard, href: '/(app)/registrar/dashboard' },
        { label: 'Users', icon: Users, href: '/(app)/registrar/dashboard' },
      ];
    default:
      return [];
  }
}

interface AppShellProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
}

export function AppShell({ children, title, showBack }: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft color="#fff" size={22} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{user.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <LogOut color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>

      {/* Bottom Nav */}
      {navItems.length > 1 && (
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const active = pathname.includes(item.href.replace('/(app)', ''));
            return (
              <TouchableOpacity
                key={item.href}
                style={styles.navItem}
                onPress={() => router.push(item.href as any)}
                activeOpacity={0.7}
              >
                <item.icon color={active ? '#2563EB' : '#9CA3AF'} size={22} />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 1,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
