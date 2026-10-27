import { ReactNode, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform, Animated,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Map, Calendar, Bell, Clock,
  Users, LogOut, ChevronLeft, Compass,
} from 'lucide-react-native';
import { Colors, Shadow, Radius, getRoleColor } from '@/constants/theme';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
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
        { label: 'Alerts', icon: Bell, href: '/(app)/admin/notifications' },
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
  scrollable?: boolean;
}

function NavTab({ item, active, onPress }: { item: NavItem; active: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [active]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.navItem} onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
          <Animated.View style={[styles.navActivePill, { opacity }]} />
          <item.icon
            color={active ? Colors.primary : Colors.textMuted}
            size={22}
            strokeWidth={active ? 2.5 : 1.8}
          />
        </View>
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>
          {item.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function AppShell({ children, title, showBack, scrollable = true }: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const roleColor = getRoleColor(user.role);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { showsVerticalScrollIndicator: false, contentContainerStyle: styles.contentInner }
    : { style: { flex: 1 } };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        {/* Header background accent line */}
        <View style={[styles.headerAccentLine, { backgroundColor: roleColor }]} />

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {showBack ? (
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ChevronLeft color="#fff" size={22} strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <View style={styles.logoMini}>
                <Compass color="#fff" size={18} strokeWidth={2.5} />
              </View>
            )}
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {user.name} · <Text style={{ color: roleColor === Colors.primary ? Colors.primaryLight : 'rgba(255,255,255,0.7)' }}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut color="rgba(255,255,255,0.9)" size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Content */}
      <ContentWrapper style={styles.content} {...contentProps}>
        {children}
      </ContentWrapper>

      {/* Bottom Nav */}
      {navItems.length > 1 && (
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const active = pathname.includes(item.href.replace('/(app)', ''));
            return (
              <NavTab
                key={item.href}
                item={item}
                active={active}
                onPress={() => router.push(item.href as any)}
              />
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
    backgroundColor: Colors.bg,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    backgroundColor: Colors.bgHeader,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    ...Shadow.lg,
    overflow: 'hidden',
  },
  headerAccentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoMini: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.textInverse,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: Radius.md,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 28,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.bgNavBar,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    paddingHorizontal: 8,
    ...Shadow.md,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIconWrap: {
    width: 44,
    height: 32,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  navIconWrapActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  navActivePill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: Radius.lg,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
