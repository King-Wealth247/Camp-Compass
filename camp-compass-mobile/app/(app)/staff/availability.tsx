import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { CheckCircle, AlertCircle, Send, Clock } from 'lucide-react-native';
import { dataService, AvailabilityPayload, Availability } from '@/lib/dataService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type Day = typeof DAYS[number];

const TIME_OPTIONS = ['08:00-12:00', '13:00-17:00', '08:00-17:00'] as const;
type TimeOption = typeof TIME_OPTIONS[number];

const TIME_LABELS: Record<TimeOption, string> = {
  '08:00-12:00': '8AM – 12PM',
  '13:00-17:00': '1PM – 5PM',
  '08:00-17:00': '8AM – 5PM (Full Day)',
};

type DayState = { available: boolean; time: TimeOption };
type WeekState = Record<Day, DayState>;

function buildInitial(): WeekState {
  return Object.fromEntries(
    DAYS.map((d) => [d, { available: false, time: '08:00-17:00' as TimeOption }])
  ) as WeekState;
}

function isWeekend(): boolean {
  const day = new Date().getDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
}

export default function AvailabilityScreen() {
  const { user } = useAuth();
  const [week, setWeek] = useState<WeekState>(buildInitial);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  const isResubmission = !isWeekend();

  useEffect(() => {
    if (!user) return;
    // Load the lecturer's most recent availability to pre-fill the form
    dataService.getAvailabilities(user.id).then((res) => {
      if (res.data && res.data.length > 0) {
        const latest = res.data[0];
        setLastSubmission(latest);
        setWeek({
          Monday:    { available: latest.monday,    time: (latest.mondayTime    as TimeOption) || '08:00-17:00' },
          Tuesday:   { available: latest.tuesday,   time: (latest.tuesdayTime   as TimeOption) || '08:00-17:00' },
          Wednesday: { available: latest.wednesday, time: (latest.wednesdayTime as TimeOption) || '08:00-17:00' },
          Thursday:  { available: latest.thursday,  time: (latest.thursdayTime  as TimeOption) || '08:00-17:00' },
          Friday:    { available: latest.friday,    time: (latest.fridayTime    as TimeOption) || '08:00-17:00' },
          Saturday:  { available: latest.saturday,  time: (latest.saturdayTime  as TimeOption) || '08:00-17:00' },
        });
      }
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  const toggleDay = (day: Day) =>
    setWeek((prev) => ({ ...prev, [day]: { ...prev[day], available: !prev[day].available } }));

  const setTime = (day: Day, time: TimeOption) =>
    setWeek((prev) => ({ ...prev, [day]: { ...prev[day], time } }));

  const availCount = DAYS.filter((d) => week[d].available).length;

  const handleSubmit = async () => {
    if (isResubmission && !description.trim()) {
      Alert.alert('Description required', 'Please explain why you are resubmitting mid-week.');
      return;
    }

    setSubmitting(true);
    const payload: AvailabilityPayload = {
      lecturerId: user.id,
      monday:    week.Monday.available,    mondayTime:    week.Monday.available    ? week.Monday.time    : null,
      tuesday:   week.Tuesday.available,   tuesdayTime:   week.Tuesday.available   ? week.Tuesday.time   : null,
      wednesday: week.Wednesday.available, wednesdayTime: week.Wednesday.available ? week.Wednesday.time : null,
      thursday:  week.Thursday.available,  thursdayTime:  week.Thursday.available  ? week.Thursday.time  : null,
      friday:    week.Friday.available,    fridayTime:    week.Friday.available    ? week.Friday.time    : null,
      saturday:  week.Saturday.available,  saturdayTime:  week.Saturday.available  ? week.Saturday.time  : null,
      description: isResubmission ? description.trim() : null,
    };

    const res = await dataService.submitAvailability(payload);
    setSubmitting(false);

    if (res.data) {
      setLastSubmission(res.data);
      Alert.alert(
        isResubmission ? 'Resubmission Sent' : 'Availability Submitted',
        isResubmission
          ? 'Your resubmission is pending admin review.'
          : 'Your availability has been saved. Admin has been notified.',
      );
      if (isResubmission) setDescription('');
    } else {
      Alert.alert('Error', res.error?.error ?? 'Failed to submit. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppShell title="Availability">
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Availability">
      <View style={styles.headerBox}>
        <Text style={styles.pageTitle}>Availability Declaration</Text>
        <Text style={styles.pageSub}>
          {isResubmission ? 'Mid-week resubmission — admin review required' : 'Weekend submission — declare your week'}
        </Text>
      </View>

      {/* Status banner */}
      {isResubmission ? (
        <View style={[styles.banner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <AlertCircle color="#D97706" size={16} />
          <Text style={[styles.bannerText, { color: '#92400E' }]}>
            Mid-week resubmission. You must provide a reason. Admin will review before timetables are updated.
          </Text>
        </View>
      ) : (
        <View style={[styles.banner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <Clock color="#2563EB" size={16} />
          <Text style={[styles.bannerText, { color: '#1D4ED8' }]}>
            Submit by <Text style={{ fontWeight: '700' }}>Sunday midnight</Text> each week.
          </Text>
        </View>
      )}

      {/* Last submission status */}
      {lastSubmission?.resubmission === 'unseen' && (
        <View style={[styles.banner, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
          <AlertCircle color="#B45309" size={16} />
          <Text style={[styles.bannerText, { color: '#92400E' }]}>Pending admin review of your last resubmission.</Text>
        </View>
      )}
      {lastSubmission?.resubmission === 'validated' && (
        <View style={[styles.banner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <CheckCircle color="#16A34A" size={16} />
          <Text style={[styles.bannerText, { color: '#15803D' }]}>Your last resubmission was validated. Timetable updated.</Text>
        </View>
      )}
      {lastSubmission?.resubmission === 'rejected' && (
        <View style={[styles.banner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <AlertCircle color="#DC2626" size={16} />
          <Text style={[styles.bannerText, { color: '#B91C1C' }]}>Your last resubmission was rejected. Original schedule stands.</Text>
        </View>
      )}

      {/* Day cards */}
      {DAYS.map((day) => {
        const state = week[day];
        return (
          <View key={day} style={[styles.dayCard, state.available && styles.dayCardActive]}>
            <TouchableOpacity style={styles.dayHeader} onPress={() => toggleDay(day)} activeOpacity={0.7}>
              <View style={[styles.checkbox, state.available && styles.checkboxChecked]}>
                {state.available && <CheckCircle color="#fff" size={14} />}
              </View>
              <Text style={[styles.dayName, state.available && styles.dayNameActive]}>{day}</Text>
              <Text style={styles.dayStatus}>{state.available ? 'Available' : 'Unavailable'}</Text>
            </TouchableOpacity>

            {state.available && (
              <View style={styles.timeRow}>
                {TIME_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.timeChip, state.time === opt && styles.timeChipActive]}
                    onPress={() => setTime(day, opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeChipText, state.time === opt && styles.timeChipTextActive]}>
                      {TIME_LABELS[opt]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#DCFCE7' }]}>
          <Text style={styles.summaryNum}>{availCount}</Text>
          <Text style={styles.summaryLabel}>Days Available</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.summaryNum}>{DAYS.length - availCount}</Text>
          <Text style={styles.summaryLabel}>Days Unavailable</Text>
        </View>
      </View>

      {/* Description — only for mid-week resubmissions */}
      {isResubmission && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reason for Resubmission <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Explain why you are changing your availability mid-week..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Send color="#fff" size={18} />
            <Text style={styles.submitText}>
              {isResubmission ? 'Submit Resubmission' : 'Submit Availability'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerBox: { marginBottom: 14 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  pageSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  banner: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12,
  },
  bannerText: { fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 18 },
  dayCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  dayCardActive: { borderColor: '#2563EB', backgroundColor: '#F8FBFF' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayName: { fontSize: 15, fontWeight: '700', color: '#374151', flex: 1 },
  dayNameActive: { color: '#1D4ED8' },
  dayStatus: { fontSize: 12, color: '#9CA3AF' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  timeChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  timeChipTextActive: { color: '#2563EB' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  summaryNum: { fontSize: 28, fontWeight: '800', color: '#111827' },
  summaryLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10 },
  textArea: {
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: '#111827', backgroundColor: '#F9FAFB',
    textAlignVertical: 'top', minHeight: 100,
  },
  submitBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 16, marginBottom: 8,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
