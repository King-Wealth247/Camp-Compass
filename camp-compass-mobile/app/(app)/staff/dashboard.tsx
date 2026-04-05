import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import {
  Calendar, Users, Clock, Bell, ChevronRight,
} from 'lucide-react-native';
import { timetableData } from '@/data/mockData';

export default function StaffDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const mySchedule = timetableData.filter((e) => e.lecturerName === user.name).slice(0, 5);
  const totalCourses = timetableData.filter((e) => e.lecturerName === user.name).length;

  return (
    <AppShell title="Staff Portal">
      {/* Welcome */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>Welcome, {user.name}!</Text>
        <Text style={styles.welcomeSub}>{user.department} Department</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard icon={Calendar} iconColor="#2563EB" iconBg="#DBEAFE" value={String(totalCourses)} label="Courses This Week" />
        <StatCard icon={Users} iconColor="#16A34A" iconBg="#DCFCE7" value="250+" label="Total Students" />
        <StatCard icon={Clock} iconColor="#7C3AED" iconBg="#EDE9FE" value="Active" label="Status This Week" />
        <StatCard icon={Bell} iconColor="#EA580C" iconBg="#FFEDD5" value="3" label="Pending Updates" />
      </View>

      {/* My Schedule */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>My Teaching Schedule</Text>
          <Text style={styles.cardSub}>This Week</Text>
        </View>
        {mySchedule.map((course) => (
          <View key={course.id} style={styles.courseRow}>
            <View style={styles.courseMain}>
              <Text style={styles.courseName}>{course.courseName}</Text>
              <Text style={styles.courseCode}>{course.courseCode}</Text>
            </View>
            <View style={styles.courseRight}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>{course.day.slice(0, 3)}</Text>
              </View>
              <Text style={styles.timeText}>{course.startTime} – {course.endTime}</Text>
              <Text style={styles.hallText}>{course.hallCode}</Text>
            </View>
          </View>
        ))}
        {mySchedule.length === 0 && (
          <Text style={styles.emptyText}>No courses assigned yet</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        {[
          { label: 'Update Availability', sub: "Declare next week's schedule", color: '#EFF6FF', iconBg: '#2563EB', icon: Clock, route: '/(app)/staff/availability' },
          { label: 'View Full Schedule', sub: 'Check all classes', color: '#F0FDF4', iconBg: '#16A34A', icon: Calendar, route: '/(app)/staff/timetable' },
          { label: 'Notifications', sub: 'View all updates', color: '#FAF5FF', iconBg: '#7C3AED', icon: Bell, route: '/(app)/staff/notifications' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.quickBtn, { backgroundColor: item.color }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIcon, { backgroundColor: item.iconBg }]}>
              <item.icon color="#fff" size={20} />
            </View>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>{item.label}</Text>
              <Text style={styles.quickSub}>{item.sub}</Text>
            </View>
            <ChevronRight color="#9CA3AF" size={18} />
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  welcomeBox: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  welcomeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  courseMain: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  courseCode: { fontSize: 12, color: '#6B7280' },
  courseRight: { alignItems: 'flex-end', gap: 3 },
  dayBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dayText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  timeText: { fontSize: 11, color: '#6B7280' },
  hallText: { fontSize: 11, color: '#9CA3AF' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, paddingVertical: 16 },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickText: { flex: 1 },
  quickTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  quickSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
});
