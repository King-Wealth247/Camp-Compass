import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppShell } from '@/components/AppShell';
import {
  Bell, AlertTriangle, CheckCircle, Info, Check, Trash2,
} from 'lucide-react-native';
import { notifications as initial } from '@/data/mockData';

type FilterType = 'all' | 'unread' | 'read';

function formatDate(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsScreen() {
  const [notes, setNotes] = useState(initial.map((n) => ({ ...n })));
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = notes.filter((n) => !n.read).length;
  const filtered = notes.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const markRead = (id: string) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  const remove = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const getIconAndColors = (type: string) => {
    switch (type) {
      case 'warning':
        return { icon: AlertTriangle, iconColor: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
      case 'success':
        return { icon: CheckCircle, iconColor: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' };
      default:
        return { icon: Info, iconColor: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' };
    }
  };

  return (
    <AppShell title="Notifications">
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Notifications</Text>
          <Text style={styles.pageSub}>
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up!"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAll} activeOpacity={0.8}>
            <Check color="#fff" size={14} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {(['all', 'unread', 'read'] as FilterType[]).map((f) => {
          const label = f === 'all' ? `All (${notes.length})` : f === 'unread' ? `Unread (${unreadCount})` : `Read (${notes.length - unreadCount})`;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filtered.length > 0 ? (
        filtered.map((notif) => {
          const meta = getIconAndColors(notif.type);
          return (
            <View
              key={notif.id}
              style={[
                styles.notifCard,
                { borderColor: notif.read ? '#E5E7EB' : '#93C5FD' },
              ]}
            >
              <View style={[styles.notifIconWrap, { backgroundColor: meta.bg, borderColor: meta.border }]}>
                <meta.icon color={meta.iconColor} size={20} />
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifTitleRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMsg}>{notif.message}</Text>
                <Text style={styles.notifTime}>{formatDate(notif.timestamp)}</Text>
              </View>
              <View style={styles.notifActions}>
                {!notif.read && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => markRead(notif.id)}
                    activeOpacity={0.7}
                  >
                    <Check color="#2563EB" size={16} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
                  onPress={() => remove(notif.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Bell color="#D1D5DB" size={48} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>
            {filter === 'unread' ? 'No unread notifications' : 'Nothing here yet'}
          </Text>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  pageSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  markAllBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#2563EB' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#fff' },
  notifCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'flex-start',
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notifBody: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' },
  notifMsg: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: '#9CA3AF' },
  notifActions: { gap: 6, alignItems: 'center' },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
