import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/dataService';
import {
  CheckCircle, Clock, Archive, RotateCcw, Upload, AlertTriangle,
  ChevronRight, RefreshCw,
} from 'lucide-react-native';
import { Colors, Shadow, Radius } from '@/constants/theme';

type TimetableStatus = 'draft' | 'published' | 'archived';

interface TimetableSummary {
  id: string;
  level: number;
  status: TimetableStatus;
  generationMode: 'absolute' | 'batch' | 'unit';
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  department: { departmentName: string };
  _count: { subComponents: number };
}

const STATUS_CONFIG: Record<TimetableStatus, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  published: { color: Colors.success, bg: Colors.successBg, icon: CheckCircle, label: 'Published' },
  draft: { color: Colors.warning, bg: Colors.warningBg, icon: Clock, label: 'Draft' },
  archived: { color: Colors.textMuted, bg: Colors.bg, icon: Archive, label: 'Archived' },
};

const MODE_LABELS: Record<string, string> = {
  absolute: 'Full Reset',
  batch: 'Batch',
  unit: 'Unit',
};

function TimetableCard({
  item,
  onPublish,
  onRollback,
  onValidate,
}: {
  item: TimetableSummary;
  onPublish: (id: string, dept: string, level: number) => void;
  onRollback: (levelId: string, deptId: string) => void;
  onValidate: (id: string) => void;
}) {
  const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;
  const modeLabel = MODE_LABELS[item.generationMode] ?? item.generationMode;
  const publishDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <View style={[styles.card, item.status === 'published' && styles.cardPublished]}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.department.departmentName}
          </Text>
          <Text style={styles.cardSub}>Level {item.level} · {item._count.subComponents} classes</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '40' }]}>
          <StatusIcon color={statusCfg.color} size={12} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.cardMeta}>
        <View style={[styles.modeBadge, { backgroundColor: Colors.primary + '12' }]}>
          <Text style={[styles.modeBadgeText, { color: Colors.primary }]}>{modeLabel}</Text>
        </View>
        {publishDate && (
          <Text style={styles.publishDate}>Published {publishDate}</Text>
        )}
      </View>

      {/* Actions */}
      {item.status !== 'archived' && (
        <View style={styles.cardActions}>
          {item.status === 'draft' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.success + '15', borderColor: Colors.success + '30' }]}
              onPress={() => onPublish(item.id, item.department.departmentName, item.level)}
            >
              <Upload color={Colors.success} size={14} strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: Colors.success }]}>Publish</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.accent + '12', borderColor: Colors.accent + '30' }]}
            onPress={() => onValidate(item.id)}
          >
            <AlertTriangle color={Colors.accent} size={14} strokeWidth={2} />
            <Text style={[styles.actionBtnText, { color: Colors.accent }]}>Validate</Text>
          </TouchableOpacity>
          {item.status === 'published' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.danger + '10', borderColor: Colors.danger + '25' }]}
              onPress={() => onRollback(item.id, item.id)}
            >
              <RotateCcw color={Colors.danger} size={14} strokeWidth={2} />
              <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Rollback</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function AdminTimetableManager() {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<TimetableSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | TimetableStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { loadTimetables(); }, []);

  const loadTimetables = async () => {
    setLoading(true);
    try {
      const res = await dataService.getTimetablePublicationStatus();
      if (res.data) setTimetables(res.data as TimetableSummary[]);
    } catch (e) {
      console.error('Load timetables error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string, dept: string, level: number) => {
    if (!user) return;
    Alert.alert(
      'Publish Timetable',
      `Publish ${dept} Level ${level}? This will notify all affected students and staff.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: 'default',
          onPress: async () => {
            setProcessingId(id);
            try {
              const res = await dataService.publishTimetable(id, user.id);
              if (res.data?.success) {
                Alert.alert('✅ Published', res.data.message);
                await loadTimetables();
              } else {
                Alert.alert('Error', String(res.error) ?? 'Publish failed.');
              }
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRollback = async (levelId: string, departmentId: string) => {
    Alert.alert(
      'Rollback Timetable',
      'This will restore the previous published version. The current published timetable will be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rollback',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(levelId);
            try {
              const res = await dataService.rollbackTimetable(levelId, departmentId);
              if (res.data?.success) {
                Alert.alert('↩️ Rolled Back', res.data.message);
                await loadTimetables();
              } else {
                Alert.alert('Error', String(res.error) ?? 'Rollback failed.');
              }
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleValidate = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await dataService.validateTimetable({ timetableId: id });
      if (res.data) {
        const { valid, conflicts, warnings } = res.data;
        if (valid && warnings.length === 0) {
          Alert.alert('✅ Valid', 'No conflicts or warnings found.');
        } else if (!valid) {
          Alert.alert(
            `❌ ${conflicts.length} Conflict(s) Found`,
            conflicts.slice(0, 3).join('\n\n') + (conflicts.length > 3 ? `\n\n+ ${conflicts.length - 3} more` : '')
          );
        } else {
          Alert.alert(
            `⚠️ ${warnings.length} Warning(s)`,
            warnings.join('\n\n')
          );
        }
      }
    } catch (e) {
      Alert.alert('Validation Error', 'Could not validate timetable.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = activeFilter === 'all'
    ? timetables
    : timetables.filter((t) => t.status === activeFilter);

  const counts = {
    all: timetables.length,
    published: timetables.filter((t) => t.status === 'published').length,
    draft: timetables.filter((t) => t.status === 'draft').length,
    archived: timetables.filter((t) => t.status === 'archived').length,
  };

  if (!user) return null;

  return (
    <AppShell title="Timetable Manager" showBack>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'published', 'draft', 'archived'] as const).map((f) => {
          const isActive = activeFilter === f;
          const color = f === 'published' ? Colors.success : f === 'draft' ? Colors.warning : f === 'archived' ? Colors.textMuted : Colors.primary;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, isActive && { borderColor: color, backgroundColor: color + '12' }]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterTabText, isActive && { color }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reload */}
      <TouchableOpacity style={styles.reloadBtn} onPress={loadTimetables}>
        <RefreshCw color={Colors.textMuted} size={14} strokeWidth={2} />
        <Text style={styles.reloadText}>Refresh</Text>
      </TouchableOpacity>

      {/* List */}
      {loading ? (
        <View style={styles.loadingState}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.skeleton, { opacity: 1 - i * 0.25 }]} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Clock color={Colors.border} size={40} />
          <Text style={styles.emptyTitle}>No timetables found</Text>
          <Text style={styles.emptySub}>Generate timetables from the Admin Dashboard first.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ position: 'relative' }}>
              <TimetableCard
                item={item}
                onPublish={handlePublish}
                onRollback={handleRollback}
                onValidate={handleValidate}
              />
              {processingId === item.id && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator color={Colors.primary} size="small" />
                </View>
              )}
            </View>
          )}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  filterTab: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  filterTabText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  reloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-end', marginBottom: 12,
    backgroundColor: Colors.bgCard, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  reloadText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm,
  },
  cardPublished: { borderColor: Colors.success + '50' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitleSection: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modeBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  modeBadgeText: { fontSize: 10, fontWeight: '700' },
  publishDate: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  loadingState: { gap: 10 },
  skeleton: { height: 120, borderRadius: Radius.lg, backgroundColor: Colors.border },
  emptyState: {
    alignItems: 'center', paddingVertical: 40, gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },
  processingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
});
