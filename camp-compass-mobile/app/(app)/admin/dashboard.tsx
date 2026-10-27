import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Modal, Pressable, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import {
  Zap, LayoutGrid, Target, CheckCircle, XCircle,
  AlertTriangle, Users, Calendar, ChevronRight,
  RefreshCw, Shield, Bell,
} from 'lucide-react-native';
import { dataService } from '@/lib/dataService';
import { Colors, Shadow, Radius } from '@/constants/theme';

// ── Types ─────────────────────────────────────────────────────────────────
type GenerateMode = 'absolute' | 'batch' | 'unit';
interface GenResult { mode: GenerateMode; generated?: number; message?: string; error?: string; }
interface Stats { users: number; timetables: number; halls: number; courses: number; }

// ── Generate Mode Card ────────────────────────────────────────────────────
function GenModeCard({
  icon: Icon, color, title, subtitle, badge, onPress, disabled,
}: {
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  color: string; title: string; subtitle: string; badge: string;
  onPress: () => void; disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.genCard, { borderColor: color + '40', opacity: disabled ? 0.5 : 1 }]}
        onPress={press}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <View style={[styles.genIconWrap, { backgroundColor: color + '18' }]}>
          <Icon color={color} size={22} strokeWidth={2} />
        </View>
        <View style={styles.genCardText}>
          <View style={styles.genCardTitleRow}>
            <Text style={styles.genCardTitle}>{title}</Text>
            <View style={[styles.genBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
              <Text style={[styles.genBadgeText, { color }]}>{badge}</Text>
            </View>
          </View>
          <Text style={styles.genCardSub}>{subtitle}</Text>
        </View>
        <ChevronRight color={color} size={18} strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Confirmation Modal ────────────────────────────────────────────────────
function ConfirmModal({
  visible, mode, loading, onConfirm, onCancel,
}: {
  visible: boolean; mode: GenerateMode | null; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const modeInfo: Record<GenerateMode, { title: string; desc: string; color: string; warning?: string }> = {
    absolute: {
      title: '⚡ Absolute Generation',
      desc: 'This will DELETE all existing timetables and regenerate everything from scratch using the course-priority rule.',
      color: Colors.danger,
      warning: 'All existing draft timetables will be lost. Published timetables will be archived.',
    },
    batch: {
      title: '📦 Batch Generation',
      desc: 'Regenerate timetables for a specific department or level. Other departments are not affected.',
      color: Colors.warning,
    },
    unit: {
      title: '🎯 Unit Generation',
      desc: 'Update the schedule for a single course only. All other slots remain unchanged.',
      color: Colors.accent,
    },
  };

  if (!mode) return null;
  const info = modeInfo[mode];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.confirmModal} onPress={() => {}}>
          <View style={[styles.confirmAccent, { backgroundColor: info.color }]} />
          <Text style={styles.confirmTitle}>{info.title}</Text>
          <Text style={styles.confirmDesc}>{info.desc}</Text>
          {info.warning && (
            <View style={styles.confirmWarning}>
              <AlertTriangle color={Colors.warning} size={14} strokeWidth={2} />
              <Text style={styles.confirmWarningText}>{info.warning}</Text>
            </View>
          )}
          <View style={styles.confirmActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: info.color }]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.confirmBtnText}>Generate</Text>
              }
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Result Banner ─────────────────────────────────────────────────────────
function ResultBanner({ result, onDismiss }: { result: GenResult; onDismiss: () => void }) {
  const isError = !!result.error;
  return (
    <View style={[styles.resultBanner, isError ? styles.resultBannerError : styles.resultBannerSuccess]}>
      {isError
        ? <XCircle color={Colors.danger} size={18} strokeWidth={2} />
        : <CheckCircle color={Colors.success} size={18} strokeWidth={2} />
      }
      <Text style={[styles.resultText, isError ? styles.resultTextError : styles.resultTextSuccess]}>
        {result.error ?? result.message}
      </Text>
      <TouchableOpacity onPress={onDismiss}>
        <XCircle color={Colors.textMuted} size={16} />
      </TouchableOpacity>
    </View>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ users: 0, timetables: 0, halls: 0, courses: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [confirmMode, setConfirmMode] = useState<GenerateMode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [usersRes, ttRes, hallsRes, coursesRes] = await Promise.allSettled([
        dataService.getUsers(),
        dataService.getTimetables(),
        dataService.getHalls(),
        dataService.getCourses?.() ?? Promise.resolve({ data: [] }),
      ]);
      setStats({
        users: usersRes.status === 'fulfilled' ? (usersRes.value.data?.length ?? 0) : 0,
        timetables: ttRes.status === 'fulfilled' ? (ttRes.value.data?.length ?? 0) : 0,
        halls: hallsRes.status === 'fulfilled' ? (hallsRes.value.data?.length ?? 0) : 0,
        courses: coursesRes.status === 'fulfilled' ? (coursesRes.value.data?.length ?? 0) : 0,
      });
    } catch (e) {
      console.error('Stats load error:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirmMode) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'}/api/timetable/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: confirmMode, publishedBy: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ mode: confirmMode, error: data.error ?? 'Generation failed.' });
      } else {
        setResult({ mode: confirmMode, generated: data.generated, message: data.message });
        loadStats();
      }
    } catch (e: any) {
      setResult({ mode: confirmMode, error: e.message ?? 'Network error.' });
    } finally {
      setGenerating(false);
      setConfirmMode(null);
    }
  };

  if (!user) return null;

  return (
    <AppShell title="Admin Control">
      {/* Result Banner */}
      {result && <ResultBanner result={result} onDismiss={() => setResult(null)} />}

      {/* Welcome */}
      <View style={styles.heroCard}>
        <View style={styles.heroBg} />
        <View style={styles.heroContent}>
          <Text style={styles.heroGreeting}>Admin Portal</Text>
          <Text style={styles.heroName}>{user.name.split(' ')[0]}</Text>
          <Text style={styles.heroSub}>System Administrator · Full Access</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadStats}>
          <RefreshCw color="rgba(255,255,255,0.8)" size={18} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Users', value: stats.users, color: Colors.primary },
          { label: 'Timetables', value: stats.timetables, color: Colors.accent },
          { label: 'Halls', value: stats.halls, color: Colors.success },
          { label: 'Courses', value: stats.courses, color: Colors.warning },
        ].map((s, i) => (
          <View key={s.label} style={styles.statPill}>
            {loadingStats
              ? <ActivityIndicator size="small" color={s.color} />
              : <Text style={[styles.statPillValue, { color: s.color }]}>{s.value}</Text>
            }
            <Text style={styles.statPillLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Timetable Generation Controls */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Zap color={Colors.primary} size={16} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Timetable Generation</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Shield color={Colors.textMuted} size={12} strokeWidth={2} />
            <Text style={styles.sectionBadgeText}>Admin Only</Text>
          </View>
        </View>

        <GenModeCard
          icon={Zap}
          color={Colors.danger}
          title="Absolute Generate"
          subtitle="Wipe all & regenerate from scratch. Uses course-priority rule."
          badge="Full Reset"
          onPress={() => setConfirmMode('absolute')}
          disabled={generating}
        />
        <GenModeCard
          icon={LayoutGrid}
          color={Colors.warning}
          title="Batch Generate"
          subtitle="Regenerate for a specific department or level only."
          badge="Partial"
          onPress={() => setConfirmMode('batch')}
          disabled={generating}
        />
        <GenModeCard
          icon={Target}
          color={Colors.accent}
          title="Unit Generate"
          subtitle="Update a single course slot. All other slots unchanged."
          badge="Single Course"
          onPress={() => setConfirmMode('unit')}
          disabled={generating}
        />

        <Text style={styles.genHint}>
          Generated timetables start as <Text style={{ fontWeight: '700', color: Colors.warning }}>drafts</Text>. Go to Timetables tab to review and publish.
        </Text>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <LayoutGrid color={Colors.primary} size={16} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Management</Text>
          </View>
        </View>

        {[
          { label: 'Timetable Manager', sub: 'Review, publish, rollback', icon: Calendar, color: Colors.primary, route: '/(app)/admin/timetables' },
          { label: 'User Directory', sub: `${stats.users} registered users`, icon: Users, color: Colors.accent, route: '/(app)/admin/dashboard' },
          { label: 'Infrastructure', sub: 'Campuses, buildings, halls', icon: LayoutGrid, color: Colors.success, route: '/(app)/admin/infrastructure' },
          { label: 'Broadcast Alert', sub: 'Send system notifications', icon: Bell, color: Colors.warning, route: '/(app)/admin/notifications' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.quickBtn, { borderColor: item.color + '25' }]}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={!!confirmMode}
        mode={confirmMode}
        loading={generating}
        onConfirm={handleGenerate}
        onCancel={() => setConfirmMode(null)}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: Radius.xl, padding: 20, marginBottom: 16,
    backgroundColor: Colors.bgHeader, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    ...Shadow.primary,
  },
  heroBg: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.roleAdmin, opacity: 0.2, top: -60, right: -40,
  },
  heroContent: { flex: 1 },
  heroGreeting: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginVertical: 2 },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },
  refreshBtn: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
  },
  statPill: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  statPillValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statPillLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
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
  sectionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bg, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  sectionBadgeText: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  genCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 14,
    marginBottom: 8, borderWidth: 1.5,
  },
  genIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  genCardText: { flex: 1 },
  genCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  genCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  genBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  genBadgeText: { fontSize: 10, fontWeight: '700' },
  genCardSub: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  genHint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.md, padding: 14, marginBottom: 8,
    borderWidth: 1.5, backgroundColor: Colors.bg,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickText: { flex: 1 },
  quickTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  quickSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmModal: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: 24, width: '100%', maxWidth: 380, overflow: 'hidden', ...Shadow.lg,
  },
  confirmAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  confirmTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 8, marginBottom: 10 },
  confirmDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 12 },
  confirmWarning: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.warningBg, borderRadius: Radius.md,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  confirmWarningText: { fontSize: 12, color: '#92400E', lineHeight: 18, flex: 1 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderRadius: Radius.md, paddingVertical: 14,
    alignItems: 'center', backgroundColor: Colors.bg,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  confirmBtn: {
    flex: 1, borderRadius: Radius.md, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  // Result banner
  resultBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    borderRadius: Radius.md, padding: 14, marginBottom: 12,
    borderWidth: 1.5,
  },
  resultBannerSuccess: { backgroundColor: Colors.successBg, borderColor: Colors.success + '40' },
  resultBannerError: { backgroundColor: Colors.dangerBg, borderColor: Colors.danger + '40' },
  resultText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  resultTextSuccess: { color: '#065F46' },
  resultTextError: { color: Colors.danger },
});
