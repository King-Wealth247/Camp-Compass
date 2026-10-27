import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import {
  Calendar, MapPin, Bell, BookOpen, Clock, AlertCircle,
  ChevronRight, TrendingUp, Zap, Star,
} from 'lucide-react-native';
import { dataService } from '@/lib/dataService';
import { Colors, Shadow, Radius } from '@/constants/theme';

interface TodayClass {
  id: string;
  courseName: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  hallCode: string;
  lecturerName: string;
  floor?: number;
}

function AnimatedStatCard({ icon: Icon, iconColor, iconBg, value, label, delay = 0 }: {
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  iconColor: string; iconBg: string; value: string; label: string; delay?: number;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale }], opacity }]}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={20} strokeWidth={2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function ClassRow({ cls, index }: { cls: TodayClass; index: number }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }, index * 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.classRow, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
      <View style={styles.classTimeBadge}>
        <Text style={styles.classTimeStart}>{cls.startTime}</Text>
        <View style={styles.classTimeDivider} />
        <Text style={styles.classTimeEnd}>{cls.endTime}</Text>
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.className} numberOfLines={1}>{cls.courseName}</Text>
        <Text style={styles.classCode}>{cls.courseCode}</Text>
        <View style={styles.classMeta}>
          <MapPin color={Colors.textMuted} size={11} strokeWidth={2} />
          <Text style={styles.classMetaText}>{cls.hallCode}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.classMetaText}>{cls.lecturerName}</Text>
        </View>
      </View>
      <View style={styles.classFloorBadge}>
        <Text style={styles.classFloorText}>F{cls.floor ?? 1}</Text>
      </View>
    </Animated.View>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const load = async () => {
      try {
        // Load timetable for today
        if (user.departmentId && user.levelId) {
          const res = await dataService.getTimetablesByDepartmentAndLevel(user.departmentId, user.levelId);
          if (res.data && res.data.length > 0) {
            const tt = res.data[0] as any;
            const subs = ((tt.subComponents || []) as any[]).filter((s: any) => s.day === today);
            const classes: TodayClass[] = subs.map((s: any) => ({
              id: s.id,
              courseName: s.courseRef?.title || s.course,
              courseCode: s.courseRef?.code || '',
              startTime: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              hallCode: s.hall,
              lecturerName: s.instructor,
              floor: s.floor,
            }));
            setTodayClasses(classes.sort((a, b) => a.startTime.localeCompare(b.startTime)));
            setCourseCount(((tt.subComponents || []) as any[]).length);
          }
        }

        // Load notifications count
        const notifRes = await dataService.getNotifications();
        if (notifRes.data) {
          const unread = notifRes.data.filter((n: any) => !n.read).length;
          setNotifCount(unread);
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const canAccess = user.tuitionPaid;

  return (
    <AppShell title="Student Portal">
      {/* Welcome Hero */}
      <Animated.View
        style={[
          styles.heroCard,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <View style={styles.heroBg1} />
        <View style={styles.heroBg2} />
        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>{greeting} 👋</Text>
              <Text style={styles.heroName}>{user.name.split(' ')[0]}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Star color="#F59E0B" size={12} strokeWidth={2} fill="#F59E0B" />
              <Text style={styles.heroBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.heroDeptRow}>
            <View style={styles.heroDeptChip}>
              <Text style={styles.heroDeptText}>{user.department || 'Department'}</Text>
            </View>
            <View style={styles.heroDeptChip}>
              <Text style={styles.heroDeptText}>Level {user.level}</Text>
            </View>
          </View>
          <Text style={styles.heroDate}>{today}</Text>
        </View>
      </Animated.View>

      {/* Tuition Warning */}
      {!canAccess && (
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <AlertCircle color={Colors.warning} size={20} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Tuition Payment Required</Text>
            <Text style={styles.warningMsg}>Complete your first installment to unlock timetable & notifications.</Text>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsGrid}>
        <AnimatedStatCard
          icon={Calendar}
          iconColor={Colors.primary}
          iconBg="rgba(79,70,229,0.12)"
          value={canAccess ? (loading ? '...' : String(courseCount)) : '—'}
          label="Weekly Classes"
          delay={100}
        />
        <AnimatedStatCard
          icon={Clock}
          iconColor={Colors.accent}
          iconBg="rgba(6,182,212,0.12)"
          value={canAccess ? String(todayClasses.length) : '—'}
          label="Today's Classes"
          delay={200}
        />
        <AnimatedStatCard
          icon={Bell}
          iconColor={Colors.success}
          iconBg="rgba(16,185,129,0.12)"
          value={canAccess ? (loading ? '...' : String(notifCount)) : '—'}
          label="Unread Alerts"
          delay={300}
        />
        <AnimatedStatCard
          icon={MapPin}
          iconColor={Colors.warning}
          iconBg="rgba(245,158,11,0.12)"
          value="5"
          label="Campus Buildings"
          delay={400}
        />
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Zap color={Colors.primary} size={16} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
          </View>
          {canAccess && (
            <TouchableOpacity onPress={() => router.push('/(app)/student/timetable' as any)}>
              <Text style={styles.seeAllText}>Full Week →</Text>
            </TouchableOpacity>
          )}
        </View>

        {!canAccess ? (
          <View style={styles.lockedState}>
            <Clock color={Colors.border} size={36} />
            <Text style={styles.lockedTitle}>Schedule Locked</Text>
            <Text style={styles.lockedSub}>Pay tuition to view your timetable</Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingState}>
            <View style={styles.loadingSkeleton} />
            <View style={[styles.loadingSkeleton, { width: '80%', opacity: 0.6 }]} />
            <View style={[styles.loadingSkeleton, { width: '60%', opacity: 0.4 }]} />
          </View>
        ) : todayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color={Colors.border} size={40} />
            <Text style={styles.emptyTitle}>No Classes Today</Text>
            <Text style={styles.emptySub}>Enjoy your free day!</Text>
          </View>
        ) : (
          todayClasses.map((cls, i) => (
            <ClassRow key={cls.id} cls={cls} index={i} />
          ))
        )}
      </View>

      {/* Quick Access */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp color={Colors.primary} size={16} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.quickBtn, { borderColor: Colors.primary + '30', backgroundColor: 'rgba(79,70,229,0.04)' }]}
          onPress={() => router.push('/(app)/student/map' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickIcon, { backgroundColor: Colors.primary }]}>
            <MapPin color="#fff" size={20} strokeWidth={2} />
          </View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Campus Map</Text>
            <Text style={styles.quickSub}>Navigate buildings, floors & halls</Text>
          </View>
          <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
        </TouchableOpacity>

        {canAccess && (
          <>
            <TouchableOpacity
              style={[styles.quickBtn, { borderColor: Colors.accent + '30', backgroundColor: 'rgba(6,182,212,0.04)' }]}
              onPress={() => router.push('/(app)/student/timetable' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: Colors.accent }]}>
                <Calendar color="#fff" size={20} strokeWidth={2} />
              </View>
              <View style={styles.quickText}>
                <Text style={styles.quickTitle}>My Timetable</Text>
                <Text style={styles.quickSub}>View full weekly schedule</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, { borderColor: Colors.success + '30', backgroundColor: 'rgba(16,185,129,0.04)' }]}
              onPress={() => router.push('/(app)/student/notifications' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: Colors.success }]}>
                <Bell color="#fff" size={20} strokeWidth={2} />
                {notifCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.quickText}>
                <Text style={styles.quickTitle}>Notifications</Text>
                <Text style={styles.quickSub}>{notifCount > 0 ? `${notifCount} unread message${notifCount > 1 ? 's' : ''}` : 'All caught up!'}</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 16,
    backgroundColor: Colors.bgHeader,
    overflow: 'hidden',
    ...Shadow.primary,
  },
  heroBg1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary, opacity: 0.3,
    top: -40, right: -40,
  },
  heroBg2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.accent, opacity: 0.15,
    bottom: -20, left: -20,
  },
  heroContent: { position: 'relative', zIndex: 1 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  heroGreeting: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  heroBadgeText: { color: '#FCD34D', fontSize: 11, fontWeight: '700' },
  heroDeptRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  heroDeptChip: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroDeptText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  heroDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' },
  warningCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.warningBg, borderWidth: 1.5, borderColor: Colors.warning + '40', borderRadius: Radius.lg, padding: 14, marginBottom: 16, alignItems: 'flex-start' },
  warningIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  warningMsg: { fontSize: 12, color: '#B45309', lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 14, alignItems: 'flex-start', gap: 6, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  statIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  section: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: 16, marginBottom: 16, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  seeAllText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  classRow: { flexDirection: 'row', gap: 12, backgroundColor: '#F8FAFF', borderRadius: Radius.md, padding: 12, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  classTimeBadge: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 58 },
  classTimeStart: { color: '#fff', fontWeight: '800', fontSize: 13 },
  classTimeDivider: { width: 20, height: 1, backgroundColor: 'rgba(255,255,255,0.4)', marginVertical: 3 },
  classTimeEnd: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },
  classInfo: { flex: 1 },
  className: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  classCode: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  classMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  classMetaText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.border },
  classFloorBadge: { backgroundColor: Colors.accent + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.accent + '30' },
  classFloorText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
  lockedState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  lockedTitle: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  lockedSub: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 12, color: Colors.textMuted },
  loadingState: { gap: 10 },
  loadingSkeleton: { height: 64, borderRadius: Radius.md, backgroundColor: Colors.border, width: '100%' },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: Radius.md, padding: 14, marginBottom: 8, borderWidth: 1.5 },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  quickText: { flex: 1 },
  quickTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  quickSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.danger, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
