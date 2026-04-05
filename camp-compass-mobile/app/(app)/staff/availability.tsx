import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { CheckCircle, AlertCircle, Send } from 'lucide-react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

type Availability = Record<string, Record<string, boolean>>;

function buildInitial(): Availability {
  const a: Availability = {};
  DAYS.forEach((d) => {
    a[d] = {};
    TIME_SLOTS.forEach((s) => { a[d][s] = true; });
  });
  return a;
}

export default function AvailabilityScreen() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<Availability>(buildInitial);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  if (!user) return null;

  const toggle = (day: string, slot: string) =>
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }));

  const toggleDay = (day: string) => {
    const allAvail = TIME_SLOTS.every((s) => availability[day][s]);
    setAvailability((prev) => ({
      ...prev,
      [day]: Object.fromEntries(TIME_SLOTS.map((s) => [s, !allAvail])),
    }));
  };

  const getAvailCount = () =>
    DAYS.reduce((acc, d) => acc + TIME_SLOTS.filter((s) => availability[d][s]).length, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <AppShell title="Availability">
      <View style={styles.headerBox}>
        <Text style={styles.pageTitle}>Availability Declaration</Text>
        <Text style={styles.pageSub}>Week of March 31 – April 4, 2026</Text>
      </View>

      {submitted && (
        <View style={styles.successBox}>
          <CheckCircle color="#16A34A" size={18} />
          <Text style={styles.successText}>Availability submitted! Admin has been notified.</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <AlertCircle color="#2563EB" size={16} />
        <Text style={styles.infoText}>Submit by <Text style={{ fontWeight: '700' }}>Friday 5:00 PM</Text> each week.</Text>
      </View>

      {/* Day Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
        {DAYS.map((day) => {
          const availCount = TIME_SLOTS.filter((s) => availability[day][s]).length;
          const isActive = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, isActive && styles.dayTabActive]}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                {day.slice(0, 3)}
              </Text>
              <Text style={[styles.dayTabCount, isActive && styles.dayTabCountActive]}>
                {availCount}/{TIME_SLOTS.length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slots for selected day */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{selectedDay}</Text>
          <TouchableOpacity onPress={() => toggleDay(selectedDay)} activeOpacity={0.7}>
            <Text style={styles.toggleAllText}>
              {TIME_SLOTS.every((s) => availability[selectedDay][s]) ? 'Mark All Unavailable' : 'Mark All Available'}
            </Text>
          </TouchableOpacity>
        </View>
        {TIME_SLOTS.map((slot) => {
          const isAvail = availability[selectedDay][slot];
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotRow, { backgroundColor: isAvail ? '#F0FDF4' : '#FEF2F2', borderColor: isAvail ? '#BBF7D0' : '#FECACA' }]}
              onPress={() => toggle(selectedDay, slot)}
              activeOpacity={0.7}
            >
              <Text style={styles.slotTime}>{slot}</Text>
              <View style={[styles.slotStatus, { backgroundColor: isAvail ? '#DCFCE7' : '#FEE2E2' }]}>
                {isAvail ? (
                  <CheckCircle color="#16A34A" size={18} />
                ) : (
                  <Text style={styles.unavailX}>✕</Text>
                )}
                <Text style={[styles.slotStatusText, { color: isAvail ? '#16A34A' : '#DC2626' }]}>
                  {isAvail ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#DCFCE7' }]}>
          <CheckCircle color="#16A34A" size={22} />
          <Text style={styles.summaryNum}>{getAvailCount()}</Text>
          <Text style={styles.summaryLabel}>Available</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.unavailX2}>✕</Text>
          <Text style={styles.summaryNum}>{DAYS.length * TIME_SLOTS.length - getAvailCount()}</Text>
          <Text style={styles.summaryLabel}>Unavailable</Text>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Additional Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any comments or special requests..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
        <Send color="#fff" size={18} />
        <Text style={styles.submitText}>Submit Availability</Text>
      </TouchableOpacity>
      <Text style={styles.deadline}>Deadline: Friday, March 28, 5:00 PM</Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerBox: { marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  pageSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  successBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  successText: { fontSize: 13, color: '#15803D', fontWeight: '500', flex: 1 },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: '#1D4ED8', flex: 1 },
  dayScroll: { marginBottom: 14 },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 68,
  },
  dayTabActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayTabText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dayTabTextActive: { color: '#fff' },
  dayTabCount: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  dayTabCountActive: { color: 'rgba(255,255,255,0.75)' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  toggleAllText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  slotTime: { fontSize: 13, fontWeight: '700', color: '#374151' },
  slotStatus: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slotStatusText: { fontSize: 12, fontWeight: '700' },
  unavailX: { fontSize: 16, color: '#DC2626' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  summaryNum: { fontSize: 28, fontWeight: '800', color: '#111827' },
  summaryLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  unavailX2: { fontSize: 24, color: '#DC2626', fontWeight: '700' },
  notesInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
    minHeight: 100,
    marginTop: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deadline: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
});
