import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import {
  Calendar, MapPin, Bell, BookOpen, Clock,
  AlertCircle, ChevronRight,
} from 'lucide-react-native';
import { timetableData, notifications } from '@/data/mockData';

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const todaysCourses = timetableData
    .filter(
      (e) => e.department === user.department && e.level === user.level && e.day === 'Monday'
    )
    .slice(0, 3);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell title="Student Portal">
      {/* Welcome */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>Welcome back, {user.name}! 👋</Text>
        <Text style={styles.welcomeSub}>{user.department} • {user.level}</Text>
      </View>

      {/* Tuition Warning */}
      {!user.tuitionPaid && (
        <View style={styles.warningBox}>
          <AlertCircle color="#92400E" size={20} />
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Payment Required</Text>
            <Text style={styles.warningMsg}>
              Your timetable access is restricted. Please complete your first tuition installment.
            </Text>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={Calendar}
          iconColor="#2563EB"
          iconBg="#DBEAFE"
          value={user.tuitionPaid ? '18' : '—'}
          label="Courses This Week"
        />
        <StatCard
          icon={MapPin}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          value="5"
          label="Campus Buildings"
        />
        <StatCard
          icon={Bell}
          iconColor="#7C3AED"
          iconBg="#EDE9FE"
          value={user.tuitionPaid ? String(unreadCount) : '—'}
          label="New Notifications"
        />
        <StatCard
          icon={BookOpen}
          iconColor="#EA580C"
          iconBg="#FFEDD5"
          value="6"
          label="Active Courses"
        />
      </View>

      {/* Today's Schedule */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's Schedule</Text>
          <Text style={styles.cardSub}>Monday, March 24, 2026</Text>
        </View>
        {user.tuitionPaid ? (
          todaysCourses.length > 0 ? (
            todaysCourses.map((course) => (
              <View key={course.id} style={styles.courseRow}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeStart}>{course.startTime}</Text>
                  <Text style={styles.timeEnd}>{course.endTime}</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.courseName}</Text>
                  <Text style={styles.courseCode}>{course.courseCode}</Text>
                  <View style={styles.courseMeta}>
                    <MapPin color="#9CA3AF" size={12} />
                    <Text style={styles.metaText}>{course.hallCode}</Text>
                    <Text style={styles.metaText}>• {course.lecturerName}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Clock color="#D1D5DB" size={40} />
              <Text style={styles.emptyText}>No classes today</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <Clock color="#D1D5DB" size={40} />
            <Text style={styles.emptyText}>Complete tuition payment to view schedule</Text>
          </View>
        )}
      </View>

      {/* Quick Access */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Access</Text>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: '#EFF6FF' }]}
          onPress={() => router.push('/(app)/student/map' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickIcon, { backgroundColor: '#2563EB' }]}>
            <MapPin color="#fff" size={20} />
          </View>
          <View style={styles.quickText}>
            <Text style={styles.quickTitle}>Campus Map</Text>
            <Text style={styles.quickSub}>Navigate to buildings and halls</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={18} />
        </TouchableOpacity>

        {user.tuitionPaid && (
          <>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#F0FDF4' }]}
              onPress={() => router.push('/(app)/student/timetable' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#16A34A' }]}>
                <Calendar color="#fff" size={20} />
              </View>
              <View style={styles.quickText}>
                <Text style={styles.quickTitle}>My Timetable</Text>
                <Text style={styles.quickSub}>View your weekly schedule</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#FAF5FF' }]}
              onPress={() => router.push('/(app)/student/notifications' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#7C3AED' }]}>
                <Bell color="#fff" size={20} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.quickText}>
                <Text style={styles.quickTitle}>Notifications</Text>
                <Text style={styles.quickSub}>{unreadCount} unread messages</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={18} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  welcomeBox: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  welcomeSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningText: { flex: 1 },
  warningTitle: { fontWeight: '700', color: '#92400E', fontSize: 13, marginBottom: 2 },
  warningMsg: { color: '#B45309', fontSize: 12, lineHeight: 18 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  courseRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  timeBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  timeStart: { color: '#fff', fontWeight: '700', fontSize: 14 },
  timeEnd: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  courseCode: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  courseMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#9CA3AF' },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 13, textAlign: 'center' },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: { flex: 1 },
  quickTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  quickSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
