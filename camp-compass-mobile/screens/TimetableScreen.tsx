import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { MapPin, User, Calendar } from 'lucide-react-native';
import { timetableData } from '@/data/mockData';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Monday');

  if (!user) return null;

  const getUserTimetable = () => {
    if (user.role === 'student') {
      return timetableData.filter(
        (e) => e.department === user.department && e.level === user.level
      );
    } else if (user.role === 'staff') {
      return timetableData.filter((e) => e.lecturerName === user.name);
    }
    return timetableData;
  };

  const allEntries = getUserTimetable();
  const dayEntries = allEntries.filter((e) => e.day === selectedDay);

  return (
    <AppShell title={user.role === 'student' ? 'My Timetable' : 'Teaching Schedule'}>
      <View style={styles.infoBox}>
        <Calendar color="#2563EB" size={16} />
        <Text style={styles.infoText}>
          {user.role === 'student'
            ? `${user.department} • ${user.level} • ${allEntries.length} courses`
            : `Week of March 24–28, 2026`}
        </Text>
      </View>

      {/* Day Selector */}
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
                  <Text style={[styles.countText, selectedDay === day && styles.countTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Entries */}
      {dayEntries.length > 0 ? (
        dayEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeStart}>{entry.startTime}</Text>
              <Text style={styles.timeSep}>—</Text>
              <Text style={styles.timeEnd}>{entry.endTime}</Text>
            </View>
            <View style={styles.entryInfo}>
              <Text style={styles.courseName}>{entry.courseName}</Text>
              <Text style={styles.courseCode}>{entry.courseCode}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin color="#9CA3AF" size={12} />
                  <Text style={styles.metaText}>{entry.hallCode}</Text>
                </View>
                {user.role !== 'staff' && (
                  <View style={styles.metaItem}>
                    <User color="#9CA3AF" size={12} />
                    <Text style={styles.metaText}>{entry.lecturerName}</Text>
                  </View>
                )}
                {user.role === 'admin' && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>{entry.department} {entry.level}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Calendar color="#D1D5DB" size={48} />
          <Text style={styles.emptyTitle}>No Classes</Text>
          <Text style={styles.emptyText}>No classes scheduled on {selectedDay}</Text>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600' },
  dayScroll: { marginBottom: 16 },
  dayBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 60,
  },
  dayBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayName: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dayNameActive: { color: '#fff' },
  countDot: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  countDotActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  countText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  countTextActive: { color: '#fff' },
  entryCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  timeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  timeStart: { fontSize: 14, fontWeight: '800', color: '#2563EB' },
  timeSep: { fontSize: 10, color: '#93C5FD' },
  timeEnd: { fontSize: 12, fontWeight: '600', color: '#60A5FA' },
  entryInfo: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  courseCode: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  metaRow: { gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#9CA3AF' },
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
