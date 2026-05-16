import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { MapPin, User, X, ChevronDown } from 'lucide-react-native';
import { TimetableEntry } from '@/data/mockData';
import { dataService } from '@/lib/dataService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const DEPT_COLORS: Record<string, string> = {
  'Computer Science': '#2563EB',
  'Engineering': '#7C3AED',
  'Science': '#059669',
};
function deptColor(dept: string) {
  return DEPT_COLORS[dept] ?? '#6B7280';
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const BASE_HOUR = 8;
const SLOT_HEIGHT = 64; // px per hour

function slotTop(startTime: string) {
  return (timeToMinutes(startTime) - BASE_HOUR * 60) * (SLOT_HEIGHT / 60);
}
function slotHeight(startTime: string, endTime: string) {
  return (timeToMinutes(endTime) - timeToMinutes(startTime)) * (SLOT_HEIGHT / 60);
}



interface SlotModalProps {
  entry: TimetableEntry;
  onClose: () => void;
  onViewMap?: () => void;
}

function SlotModal({ entry, onClose, onViewMap }: SlotModalProps) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={[styles.modalAccent, { backgroundColor: deptColor(entry.department) }]} />
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <X color="#6B7280" size={18} />
          </TouchableOpacity>

          <Text style={styles.modalCourse}>{entry.courseName}</Text>
          <Text style={styles.modalCode}>{entry.courseCode}</Text>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Time</Text>
            <Text style={styles.modalValue}>{entry.startTime} – {entry.endTime}</Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Day</Text>
            <Text style={styles.modalValue}>{entry.day}</Text>
          </View>
          <View style={styles.modalRow}>
            <User color="#6B7280" size={13} />
            <Text style={styles.modalValue}>{entry.lecturerName}</Text>
          </View>
          <View style={styles.modalRow}>
            <MapPin color="#6B7280" size={13} />
            <Text style={styles.modalValue}>{entry.hallCode} · Floor {entry.floor}</Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Dept</Text>
            <Text style={styles.modalValue}>{entry.department} · {entry.level}</Text>
          </View>

          {onViewMap && (
            <TouchableOpacity style={[styles.mapBtn, { backgroundColor: deptColor(entry.department) }]} onPress={onViewMap} activeOpacity={0.85}>
              <MapPin color="#fff" size={15} />
              <Text style={styles.mapBtnText}>View on Floor Map</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}

function Dropdown({ label, value, options, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.dropdownWrap}>
      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={styles.dropdownBtnText} numberOfLines={1}>{value || label}</Text>
        <ChevronDown color="#6B7280" size={14} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function TimetableScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [dbTimetables, setDbTimetables] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isStaff = user.role === 'staff';

  useState(() => {
    if (!user) return;
    const load = async () => {
      try {
        let res;
        if (user.role === 'student') {
          if (user.departmentId && user.levelId) {
            res = await dataService.getTimetablesByDepartmentAndLevel(user.departmentId, user.levelId);
            if (res.data && res.data.length > 0) {
              setDbTimetables([res.data[0]]); // Take only the latest one
            }
          }
        } else if (user.role === 'staff') {
          res = await dataService.getTimetablesByInstructor(user.name);
          setDbTimetables(res.data || []);
        } else {
          res = await dataService.getTimetables();
          setDbTimetables(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch timetables", err);
      }
    };
    load();
  });

  const allEntries = useMemo(() => {
    let entries: TimetableEntry[] = [];
    
    dbTimetables.forEach((tt: any) => {
      if (tt.subComponents) {
        tt.subComponents.forEach((sub: any) => {
          entries.push({
            id: sub.id,
            courseId: sub.courseId,
            courseCode: sub.courseRef?.code || sub.course,
            courseName: sub.courseRef?.title || sub.course,
            lecturerName: sub.instructor,
            department: tt.department?.departmentName || "Unknown Dept",
            level: `Level ${tt.level}`,
            day: sub.day,
            startTime: new Date(sub.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: new Date(sub.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            hallId: sub.hallId,
            hallCode: sub.hall,
            floor: sub.floor || 1,
            buildingId: sub.hallRef?.buildingId || '',
          });
        });
      }
    });

    if (isAdmin) {
      if (filterDept) entries = entries.filter((e) => e.department === filterDept);
      if (filterLevel) entries = entries.filter((e) => e.level.includes(filterLevel));
    }
    
    return entries;
  }, [dbTimetables, filterDept, filterLevel, isAdmin]);

  const dayEntries = allEntries.filter((e) => e.day === selectedDay);

  const ALL_DEPARTMENTS = [...new Set(allEntries.map((e) => e.department))].sort();
  const levelOptions = filterDept 
    ? [...new Set(allEntries.filter(e => e.department === filterDept).map((e) => e.level))].sort()
    : [...new Set(allEntries.map((e) => e.level))].sort();

  const mapRoute = isAdmin
    ? '/(app)/admin/map'
    : user.role === 'student'
    ? '/(app)/student/map'
    : null;

  const handleViewMap = (entry: TimetableEntry) => {
    if (!mapRoute) return;
    setSelectedEntry(null);
    router.push({
      pathname: mapRoute as any,
      params: {
        buildingId: entry.buildingId,
        floor: String(entry.floor),
        hallCode: entry.hallCode,
      },
    });
  };

  const totalHours = TIME_SLOTS.length;
  const gridHeight = totalHours * SLOT_HEIGHT;

  return (
    <AppShell title={isStaff ? 'Teaching Schedule' : 'Timetable'}>
      {/* Admin filters */}
      {isAdmin && (
        <View style={styles.filterRow}>
          <Dropdown
            label="All Departments"
            value={filterDept}
            options={['', ...ALL_DEPARTMENTS]}
            onSelect={(v) => { setFilterDept(v); setFilterLevel(''); }}
          />
          <Dropdown
            label="All Levels"
            value={filterLevel}
            options={['', ...levelOptions]}
            onSelect={setFilterLevel}
          />
        </View>
      )}

      {/* Info bar */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {isAdmin
            ? `${filterDept || 'All Departments'} · ${filterLevel || 'All Levels'} · ${allEntries.length} entries`
            : isStaff
            ? `${user.name} · ${allEntries.length} classes`
            : `${user.department} · ${user.level} · ${allEntries.length} courses`}
        </Text>
      </View>

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
        {DAYS.map((day) => {
          const count = allEntries.filter((e) => e.day === day).length;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayName, selectedDay === day && styles.dayNameActive]}>
                {day.slice(0, 3)}
              </Text>
              {count > 0 && (
                <View style={[styles.countDot, selectedDay === day && styles.countDotActive]}>
                  <Text style={[styles.countText, selectedDay === day && styles.countTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Calendar grid */}
      <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Time labels column */}
          <View style={styles.timeCol}>
            {TIME_SLOTS.map((t) => (
              <View key={t} style={styles.timeCell}>
                <Text style={styles.timeLabel}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Events column */}
          <View style={[styles.eventsCol, { height: gridHeight }]}>
            {/* Hour grid lines */}
            {TIME_SLOTS.map((_, i) => (
              <View key={i} style={[styles.gridLine, { top: i * SLOT_HEIGHT }]} />
            ))}

            {/* Timetable slots */}
            {dayEntries.map((entry) => {
              const top = slotTop(entry.startTime);
              const height = slotHeight(entry.startTime, entry.endTime);
              const color = deptColor(entry.department);
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={[styles.slot, { top, height, borderLeftColor: color, backgroundColor: `${color}15` }]}
                  onPress={() => setSelectedEntry(entry)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotCourse, { color }]} numberOfLines={1}>{entry.courseName}</Text>
                  <Text style={styles.slotMeta} numberOfLines={1}>{entry.hallCode} · {entry.startTime}–{entry.endTime}</Text>
                  {(isAdmin || isStaff) && (
                    <Text style={styles.slotDept} numberOfLines={1}>{entry.department} {entry.level}</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {dayEntries.length === 0 && (
              <View style={styles.emptyOverlay}>
                <Text style={styles.emptyText}>No classes on {selectedDay}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Slot detail modal */}
      {selectedEntry && (
        <SlotModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onViewMap={mapRoute ? () => handleViewMap(selectedEntry) : undefined}
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10, zIndex: 10 },
  dropdownWrap: { flex: 1, zIndex: 10 },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  dropdownBtnText: { fontSize: 12, color: '#374151', fontWeight: '600', flex: 1 },
  dropdownList: {
    position: 'absolute', top: 44, left: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, zIndex: 100, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: '#EFF6FF' },
  dropdownItemText: { fontSize: 13, color: '#374151' },
  dropdownItemTextActive: { color: '#2563EB', fontWeight: '700' },
  infoBox: {
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE',
    borderRadius: 10, padding: 10, marginBottom: 12,
  },
  infoText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  dayScroll: { marginBottom: 14 },
  dayBtn: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: '#fff', marginRight: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB', minWidth: 60,
  },
  dayBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayName: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dayNameActive: { color: '#fff' },
  countDot: {
    backgroundColor: '#E5E7EB', borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  countDotActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  countText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  countTextActive: { color: '#fff' },
  gridScroll: { flex: 1 },
  gridContainer: { flexDirection: 'row' },
  timeCol: { width: 52 },
  timeCell: { height: 64, justifyContent: 'flex-start', paddingTop: 4, paddingRight: 8 },
  timeLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', textAlign: 'right' },
  eventsCol: { flex: 1, position: 'relative' },
  gridLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: '#F3F4F6',
  },
  slot: {
    position: 'absolute', left: 4, right: 4,
    borderRadius: 8, borderLeftWidth: 4,
    paddingHorizontal: 8, paddingVertical: 6,
    justifyContent: 'center',
  },
  slotCourse: { fontSize: 12, fontWeight: '700' },
  slotMeta: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  slotDept: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  emptyOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14, color: '#D1D5DB', fontWeight: '600' },
  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: '100%', maxWidth: 380, overflow: 'hidden',
  },
  modalAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  modalClose: { position: 'absolute', top: 14, right: 14, padding: 4 },
  modalCourse: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 8, marginRight: 28 },
  modalCode: { fontSize: 13, color: '#6B7280', marginBottom: 14 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  modalLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', width: 36 },
  modalValue: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 16,
  },
  mapBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
