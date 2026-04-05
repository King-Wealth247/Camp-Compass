import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { StatCard } from '@/components/StatCard';
import {
  Users, UserPlus, Mail, Key, Search,
} from 'lucide-react-native';

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState<'Student' | 'Staff' | 'Admin'>('Student');
  const [department, setDepartment] = useState<'Computer Science' | 'Engineering' | 'Business'>('Computer Science');

  if (!user) return null;

  return (
    <AppShell title="Registrar Portal">
      {/* Welcome */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>Registrar Dashboard</Text>
        <Text style={styles.welcomeSub}>User Registration & Management</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard icon={Users} iconColor="#2563EB" iconBg="#DBEAFE" value="2,450" label="Total Students" />
        <StatCard icon={Users} iconColor="#16A34A" iconBg="#DCFCE7" value="187" label="Staff Members" />
        <StatCard icon={UserPlus} iconColor="#7C3AED" iconBg="#EDE9FE" value="45" label="New This Month" />
        <StatCard icon={Mail} iconColor="#EA580C" iconBg="#FFEDD5" value="12" label="Pending Verification" />
      </View>

      {/* User Registration */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>User Registration</Text>
            <Text style={styles.cardSub}>Add new students or staff members</Text>
          </View>
          <TouchableOpacity
            style={styles.newUserBtn}
            onPress={() => setShowForm(!showForm)}
            activeOpacity={0.8}
          >
            <UserPlus color="#fff" size={16} />
            <Text style={styles.newUserText}>New User</Text>
          </TouchableOpacity>
        </View>

        {showForm ? (
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleRow}>
              {(['Student', 'Staff', 'Admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Department</Text>
            <View style={styles.roleRow}>
              {(['Computer Science', 'Engineering', 'Business'] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.roleBtn, department === d && styles.roleBtnActive]}
                  onPress={() => setDepartment(d)}
                >
                  <Text style={[styles.roleBtnText, department === d && styles.roleBtnTextActive]} numberOfLines={1}>
                    {d === 'Computer Science' ? 'Comp Sci' : d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Auto-generated creds */}
            <View style={styles.credsBox}>
              <Text style={styles.credsTitle}>Auto-generated Credentials:</Text>
              <View style={styles.credRow}>
                <Mail color="#6B7280" size={14} />
                <Text style={styles.credText}>Email: john.doe@campus.edu</Text>
              </View>
              <View style={styles.credRow}>
                <Key color="#6B7280" size={14} />
                <Text style={styles.credText}>Password: TempPass123!</Text>
              </View>
            </View>

            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8}>
                <Text style={styles.submitText}>Register User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowForm(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <UserPlus color="#D1D5DB" size={48} />
            <Text style={styles.emptyText}>Tap "New User" to register a user</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        {[
          { label: 'Search Users', sub: 'Find existing records', color: '#EFF6FF', iconBg: '#2563EB', icon: Search },
          { label: 'Bulk Import', sub: 'Upload CSV file', color: '#F0FDF4', iconBg: '#16A34A', icon: Users },
          { label: 'Email Credentials', sub: 'Send login details', color: '#FAF5FF', iconBg: '#7C3AED', icon: Mail },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.quickBtn, { backgroundColor: item.color }]}
            activeOpacity={0.7}
          >
            <View style={[styles.quickIcon, { backgroundColor: item.iconBg }]}>
              <item.icon color="#fff" size={20} />
            </View>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>{item.label}</Text>
              <Text style={styles.quickSub}>{item.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  welcomeBox: {
    backgroundColor: '#065F46',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  welcomeSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  newUserBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  newUserText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  form: { gap: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: -4 },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  roleBtnActive: { backgroundColor: '#2563EB' },
  roleBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  roleBtnTextActive: { color: '#fff' },
  credsBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  credsTitle: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 2 },
  credRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  credText: { fontSize: 12, color: '#6B7280' },
  formBtns: { flexDirection: 'row', gap: 10 },
  submitBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { color: '#9CA3AF', fontSize: 13 },
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
