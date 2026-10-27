import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import {
  Calendar, Users, Clock, Bell, ChevronRight, BookOpen,
  Zap, TrendingUp, MapPin, CheckCircle,
} from 'lucide-react-native';
import { dataService } from '@/lib/dataService';
import { Colors, Shadow, Radius } from '@/constants/theme';

interface WeekClass {
  id: string;
  courseName: string;
  courseCode: string;
  day: string;
  startTime: string;
  endTime: string;
  hallCode: string;
  floor?: number;
}

function TeachingHoursMeter({ hours, max = 20 }: { hours: number; max?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const pct = Math.min(hours / max, 1);

  useEffect(() => {
    Animated.timing(progress, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [hours]);

  const color = hours < 10 ? Colors.success : hours < 16 ? Colors.warning : Colors.danger;

  return (
    <View style={styles.meterWrap}>
      <View style={styles.meterBar}>
        <Animated.View
          style={[
            styles.meterFill,
            {
              backgroundColor: color,
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={[styles.meterLabel, { color }]}>{hours}h / {max}h max</Text>
    </View>
  );
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [weekClasses, setWeekClasses] = useState<WeekClass[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Load staff timetable (by instructor name)
        const ttRes = await dataService.getTimetablesByInstructor(user.name);
        if (ttRes.data && ttRes.data.length > 0) {
          const tt = (ttRes.data as any)[0];
          const subs = (tt.subComponents || []);
          setWeekClasses(subs.map((s: any) => ({
            id: s.id,
            courseName: s.courseRef?.title || s.course,
            courseCode: s.courseRef?.code || '',
            day: s.day,
            startTime: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            hallCode: s.hall,
            floor: s.floor,
          })).sort((a: WeekClass, b: WeekClass) => {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days.indexOf(a.day) - days.indexOf(b.day) || a.startTime.localeCompare(b.startTime);
          }));
        }

        const notifRes = await dataService.getNotifications();
        if (notifRes.data) {
          setNotifCount((notifRes.data as any[]).filter((n) => !n.read).length);
        }
      } catch (e) {
        console.error('Staff dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  // Calculate total teaching hours (each class is approx 2h)
  const teachingHours = weekClasses.length * 2;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = weekClasses.filter((c) => c.day === today);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <AppShell title="Staff Portal">

      {/* Hero */}
      <Animated.View style={[
        styles.heroCard,
        {
          opacity: heroAnim,
          transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        <View style={styles.heroBg} />
        <View style={styles.heroBg2} />
        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>{greeting} 👋</Text>
              <Text style={styles.heroName}>{user.name.split(' ')[0]}</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: Colors.success + '25', borderColor: Colors.success + '40' }]}>
              <CheckCircle color={Colors.success} size={12} strokeWidth={2.5} fill={Colors.success} />
              <Text style={[styles.heroBadgeText, { color: Colors.success }]}>Teaching</Text>
            </View>
          </View>
          <Text style={styles.heroDept}>{user.department ?? 'Department'}</Text>

          {/* Teaching hours meter */}
          <View style={styles.hoursSection}>
            <View style={styles.hoursTitleRow}>
              <Clock color="rgba(255,255,255,0.7)" size={14} strokeWidth={2} />
              <Text style={styles.hoursTitle}>Weekly Teaching Hours</Text>
            </View>
            <TeachingHoursMeter hours={teachingHours} />
          </View>
        </View>
      </Animated.View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: "Today's Classes", value: loading ? '...' : String(todayClasses.length), color: Colors.primary, icon: Zap },
          { label: 'Weekly Classes', value: loading ? '...' : String(weekClasses.length), color: Colors.accent, icon: Calendar },
          { label: 'Teaching Hours', value: loading ? '...' : `${teachingHours}h`, color: Colors.success, icon: Clock },
          { label: 'Notifications', value: loading ? '...' : String(notifCount), color: Colors.warning, icon: Bell },
        ].map((s) => (
          <View key={s.label} style={styles.statPill}>
            <s.icon color={s.color} size={16} strokeWidth={2} />
            <Text style={[styles.statPillValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statPillLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's Teaching Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Zap color={Colors.success} size={16} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Today's Classes</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/staff/timetable' as any)}>
            <Text style={styles.seeAllText}>Full Week →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <View style={[styles.skeleton, { width: '100%' }]} />
            <View style={[styles.skeleton, { width: '80%', opacity: 0.6 }]} />
          </View>
        ) : todayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color={Colors.border} size={36} />
            <Text style={styles.emptyTitle}>No classes today</Text>
            <Text style={styles.emptySub}>Enjoy your free day!</Text>
          </View>
        ) : (
          todayClasses.map((cls, i) => {
            const dayColors = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
            const c = dayColors[i % dayColors.length];
            return (
              <View key={cls.id} style={styles.classRow}>
                <View style={[styles.classColorBar, { backgroundColor: c }]} />
                <View style={[styles.classTimeBadge, { backgroundColor: c + '15' }]}>
                  <Text style={[styles.classTimeStart, { color: c }]}>{cls.startTime}</Text>
                  <View style={[styles.classTimeDivider, { backgroundColor: c + '40' }]} />
                  <Text style={[styles.classTimeEnd, { color: c + 'CC' }]}>{cls.endTime}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className} numberOfLines={1}>{cls.courseName}</Text>
                  <Text style={styles.classCode}>{cls.courseCode}</Text>
                  <View style={styles.classMeta}>
                    <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
                    <Text style={styles.classMetaText}>{cls.hallCode} · Floor {cls.floor ?? 1}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp color={Colors.primary} size={16} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
        </View>

        {[
          { label: 'Update Availability', sub: "Declare next week's schedule", color: Colors.primary, route: '/(app)/staff/availability' as const, icon: Clock },
          { label: 'Full Timetable', sub: 'View all your weekly classes', color: Colors.accent, route: '/(app)/staff/timetable' as const, icon: Calendar },
          { label: 'Notifications', sub: `${notifCount > 0 ? notifCount + ' unread · ' : ''}Stay up to date`, color: Colors.success, route: '/(app)/staff/notifications' as const, icon: Bell },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.quickBtn, { borderColor: item.color + '30' }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIcon, { backgroundColor: item.color + '15' }]}>
              <item.icon color={item.color} size={18} strokeWidth={2} />
            </View>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>{item.label}</Text>
              <Text style={styles.quickSub}>{item.sub}</Text>
            </View>
            <ChevronRight color={Colors.textMuted} size={16} strokeWidth={2} />
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: Radius.xl, padding: 20, marginBottom: 16,
    backgroundColor: Colors.bgHeader, overflow: 'hidden', ...Shadow.primary,
  },
  heroBg: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.roleStaff, opacity: 0.2, top: -50, right: -40,
  },
  heroBg2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.accent, opacity: 0.1, bottom: -20, left: -20,
  },
  heroContent: { position: 'relative', zIndex: 1 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  heroGreeting: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
  },
  heroBadgeText: { fontSize: 11, fontWeight: '700' },
  heroDept: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500', marginBottom: 16 },
  hoursSection: { gap: 6 },
  hoursTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hoursTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  meterWrap: { gap: 4 },
  meterBar: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4, overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 4 },
  meterLabel: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statPill: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: 10, alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  statPillValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  statPillLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  section: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: 16, marginBottom: 16, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  seeAllText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  classRow: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    borderRadius: Radius.md, padding: 12, marginBottom: 8,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', position: 'relative',
  },
  classColorBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  classTimeBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
    alignItems: 'center', minWidth: 58,
  },
  classTimeStart: { fontWeight: '800', fontSize: 13 },
  classTimeDivider: { width: 24, height: 1, marginVertical: 3 },
  classTimeEnd: { fontSize: 10, fontWeight: '600' },
  classInfo: { flex: 1 },
  className: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  classCode: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  classMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  classMetaText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  loadingState: { gap: 10 },
  skeleton: { height: 64, borderRadius: Radius.md, backgroundColor: Colors.border },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 12, color: Colors.textMuted },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.md, padding: 14, marginBottom: 8,
    borderWidth: 1.5, backgroundColor: Colors.bg,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickText: { flex: 1 },
  quickTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  quickSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
});
