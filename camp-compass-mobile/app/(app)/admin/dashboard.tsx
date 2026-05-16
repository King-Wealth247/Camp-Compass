import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { User, Users, GraduationCap, Briefcase, ShieldAlert } from 'lucide-react-native';

// We'll mock the data service fetch since we are in React Native and might need an API service utility
// But since the rest of the app uses a standard fetch or similar, let's use the local API if available.
import { api } from '@/services/api'; // Assume there is an API service. If not we will use fetch.

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"student" | "staff" | "registrar" | "admin">("student");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Assuming api exists, or use standard fetch
      const res = await fetch('http://localhost:3000/api/users');
      const data = await res.json();
      setUsers(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => u.role === activeTab);

  const tabs = [
    { id: "student", label: "Students", icon: GraduationCap },
    { id: "staff", label: "Staff", icon: Briefcase },
    { id: "registrar", label: "Registrars", icon: Users },
    { id: "admin", label: "Admins", icon: ShieldAlert },
  ] as const;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 2 }]}>
        <Text style={styles.cellTitle}>{item.name}</Text>
        <Text style={styles.cellSub}>{item.email}</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={styles.cellText}>{item.department || '-'}</Text>
      </View>
      <View style={[styles.cell, { flex: 1, alignItems: 'flex-end' }]}>
        {item.role === 'student' ? (
          <View style={[styles.badge, item.tuitionPaid ? styles.badgeGreen : styles.badgeRed]}>
            <Text style={[styles.badgeText, item.tuitionPaid ? styles.badgeTextGreen : styles.badgeTextRed]}>
              {item.tuitionPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.badgeGray]}>
            <Text style={[styles.badgeText, styles.badgeTextGray]}>Active</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Navbar Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.icon color={isActive ? '#2563EB' : '#6B7280'} size={18} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { flex: 2 }]}>User</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Dept</Text>
        <Text style={[styles.headerText, { flex: 1, textAlign: 'right' }]}>Status</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found for this role.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 11, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  activeTabText: { color: '#2563EB', fontWeight: '700' },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: { fontSize: 12, fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' },
  listContent: { paddingBottom: 20 },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  cell: { justifyContent: 'center' },
  cellTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cellSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cellText: { fontSize: 13, color: '#4B5563' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeTextGreen: { color: '#16A34A', fontSize: 11, fontWeight: '600' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeTextRed: { color: '#DC2626', fontSize: 11, fontWeight: '600' },
  badgeGray: { backgroundColor: '#F3F4F6' },
  badgeTextGray: { color: '#4B5563', fontSize: 11, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 32 },
});
