/**
 * SyncStatusBanner — shows offline indicator + pending sync count
 * Appears at the top of the app when offline or when there are queued writes.
 */
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react-native';
import { addSyncListener, SyncStatus } from '@/lib/offlineQueue';
import { Colors } from '@/constants/theme';

export function SyncStatusBanner() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingCount: 0,
    lastSyncAt: null,
    isSyncing: false,
  });
  const [showSynced, setShowSynced] = useState(false);
  const slideAnim = useRef(new Animated.Value(-48)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsub = addSyncListener((s) => {
      // Show "synced!" flash when coming back online with pending items
      if (!wasOffline.current && !s.isOnline) wasOffline.current = true;
      if (wasOffline.current && s.isOnline && s.pendingCount === 0 && !s.isSyncing) {
        wasOffline.current = false;
        setShowSynced(true);
        setTimeout(() => setShowSynced(false), 2500);
      }
      setStatus(s);
    });
    return unsub;
  }, []);

  const visible = !status.isOnline || status.pendingCount > 0 || status.isSyncing || showSynced;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -48,
      tension: 80, friction: 12, useNativeDriver: true,
    }).start();
  }, [visible]);

  const bgColor = showSynced
    ? Colors.success
    : status.isSyncing
    ? Colors.primary
    : !status.isOnline
    ? '#1E293B'
    : Colors.warning;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.inner}>
        {showSynced ? (
          <>
            <CheckCircle color="#fff" size={14} strokeWidth={2.5} />
            <Text style={styles.text}>All data synced ✓</Text>
          </>
        ) : status.isSyncing ? (
          <>
            <RefreshCw color="#fff" size={14} strokeWidth={2} />
            <Text style={styles.text}>Syncing {status.pendingCount} change{status.pendingCount !== 1 ? 's' : ''}…</Text>
          </>
        ) : !status.isOnline ? (
          <>
            <WifiOff color="#fff" size={14} strokeWidth={2} />
            <Text style={styles.text}>
              Offline{status.pendingCount > 0 ? ` · ${status.pendingCount} pending` : ' · Data cached locally'}
            </Text>
          </>
        ) : status.pendingCount > 0 ? (
          <>
            <Wifi color="#fff" size={14} strokeWidth={2} />
            <Text style={styles.text}>Syncing {status.pendingCount} saved change{status.pendingCount !== 1 ? 's' : ''}…</Text>
          </>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
    paddingTop: 44, // safe area
    paddingBottom: 8,
  },
  inner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  text: {
    color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2,
  },
});
