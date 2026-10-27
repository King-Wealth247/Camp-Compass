import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, FlatList,
} from 'react-native';
import { AppShell } from '@/components/AppShell';
import { dataService } from '@/lib/dataService';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react-native';
import { Colors, Shadow, Radius } from '@/constants/theme';

interface NotifItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: string;
}

function NotifCard({ item, onRead, onDelete }: {
  item: NotifItem;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const slide = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeConfig = {
    info: { icon: Info, color: Colors.primary, bg: 'rgba(79,70,229,0.1)' },
    warning: { icon: AlertTriangle, color: Colors.warning, bg: 'rgba(245,158,11,0.1)' },
    success: { icon: CheckCircle, color: Colors.success, bg: 'rgba(16,185,129,0.1)' },
  };
  const config = typeConfig[item.type] ?? typeConfig.info;
  const time = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Animated.View style={[
      styles.notifCard,
      !item.read && styles.notifCardUnread,
      { opacity, transform: [{ translateX: slide }] },
    ]}>
      <View style={[styles.notifIconWrap, { backgroundColor: config.bg }]}>
        <config.icon color={config.color} size={18} strokeWidth={2} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{time}</Text>
      </View>
      <View style={styles.notifActions}>
        {!item.read && (
          <TouchableOpacity style={styles.notifActionBtn} onPress={() => onRead(item.id)}>
            <CheckCheck color={Colors.success} size={16} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.notifActionBtn} onPress={() => onDelete(item.id)}>
          <Trash2 color={Colors.textMuted} size={15} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await dataService.getNotifications();
      if (res.data) {
        setNotifications(
          (res.data as NotifItem[]).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    } catch (e) {
      console.error('Notifications load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id: string) => {
    try {
      await dataService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => dataService.markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell title="Notifications">
      {/* Header stats */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <View style={styles.bellWrap}>
            <Bell color={Colors.primary} size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up!'}
            </Text>
            <Text style={styles.headerSub}>{notifications.length} total notifications</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <CheckCheck color={Colors.primary} size={14} strokeWidth={2} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingState}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.skeleton, { opacity: 1 - i * 0.25 }]} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell color={Colors.border} size={48} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>
            You'll be notified about timetable changes and campus alerts here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifCard item={item} onRead={handleRead} onDelete={handleDelete} />
          )}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: 16, marginBottom: 16, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellWrap: { position: 'relative', width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  bellBadge: {
    position: 'absolute', top: -5, right: -8,
    backgroundColor: Colors.danger, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(79,70,229,0.1)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(79,70,229,0.2)',
  },
  markAllText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  notifCard: {
    flexDirection: 'row', gap: 12, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: 14, alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm,
  },
  notifCardUnread: {
    borderColor: Colors.primary + '30',
    backgroundColor: 'rgba(79,70,229,0.02)',
  },
  notifIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary },
  notifMessage: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  notifActions: { gap: 6, flexShrink: 0 },
  notifActionBtn: { padding: 6 },
  loadingState: { gap: 10 },
  skeleton: { height: 80, borderRadius: Radius.lg, backgroundColor: Colors.border },
  emptyState: {
    alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 10,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
