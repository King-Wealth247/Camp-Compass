import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import {
  Calendar, Building2, Users, AlertTriangle, ChevronRight,
} from 'lucide-react-native';
import { halls, timetableData } from '@/data/mockData';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const availableHalls = halls.filter((h) => h.available).length;
  const totalCourses = timetableData.length;

  return (
    <AppShell title="Admin Dashboard">
      {/* Welcome */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
        <Text style={styles.welcomeSub}>System Overview & Management</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard icon={Calendar} iconColor="#2563EB" iconBg="#DBEAFE" value={String(totalCourses)} label="Scheduled Courses" />
        <StatCard icon={Building2} iconColor="#16A34A" iconBg="#DCFCE7" value={String(availableHalls)} label="Available Halls" />
        <StatCard icon={Users} iconColor="#7C3AED" iconBg="#EDE9FE" value="45" label="Active Lecturers" />
        <StatCard icon={AlertTriangle} iconColor="#EA580C" iconBg="#FFEDD5" value="2" label="Conflicts Detected" />
      </View>

      {/* Recent Availability Changes */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Availability Changes</Text>
          <Text style={styles.cardSub}>Lecturer updates this week</Text>
        </View>

        <View style={[styles.alertBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <AlertTriangle color="#D97706" size={18} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Dr. John Smith — Unavailable</Text>
            <Text style={styles.alertMsg}>Thursday 14:00–16:00 • Medical appointment</Text>
            <TouchableOpacity>
              <Text style={styles.alertAction}>Reschedule Course →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.alertBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Dr. Sarah Johnson</Text>
            <Text style={styles.alertMsg}>Available all week • No conflicts</Text>
          </View>
        </View>

        <View style={[styles.alertBox, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Dr. Emily Brown</Text>
            <Text style={styles.alertMsg}>Available all week • No conflicts</Text>
          </View>
        </View>
      </View>

      {/* Management Tools */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Management Tools</Text>
        {[
          { label: 'Generate New Timetable', sub: "Create next week's schedule", color: '#EFF6FF', iconBg: '#2563EB', icon: Calendar, route: '/(app)/admin/timetable' },
          { label: 'Hall Search & Management', sub: 'Find and manage halls', color: '#F0FDF4', iconBg: '#16A34A', icon: Building2, route: '/(app)/admin/map' },
          { label: 'View All Timetables', sub: 'Browse all schedules', color: '#FAF5FF', iconBg: '#7C3AED', icon: Calendar, route: '/(app)/admin/timetable' },
          { label: 'Send Notification', sub: 'Alert students & staff', color: '#FFF7ED', iconBg: '#EA580C', icon: Users, route: '/(app)/admin/dashboard' },
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
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  welcomeSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
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
  alertBox: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  alertMsg: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  alertAction: { fontSize: 12, color: '#2563EB', fontWeight: '600', marginTop: 4 },
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
