import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Building2, DoorOpen, ChevronRight } from 'lucide-react-native';

export default function FacilitiesIndex() {
  const router = useRouter();

  const options = [
    { id: 'campuses', title: 'Campuses', desc: 'Manage campus locations', icon: MapPin, route: '/(app)/admin/facilities/campuses', bg: '#EFF6FF', color: '#2563EB' },
    { id: 'buildings', title: 'Buildings', desc: 'Manage buildings on campus', icon: Building2, route: '/(app)/admin/facilities/buildings', bg: '#DCFCE7', color: '#16A34A' },
    { id: 'halls', title: 'Halls', desc: 'Manage halls and capacities', icon: DoorOpen, route: '/(app)/admin/facilities/halls', bg: '#EDE9FE', color: '#7C3AED' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Select a facility type to manage</Text>
      
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={styles.card}
          onPress={() => router.push(opt.route as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: opt.bg }]}>
            <opt.icon color={opt.color} size={24} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{opt.title}</Text>
            <Text style={styles.desc}>{opt.desc}</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  headerText: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  desc: { fontSize: 14, color: '#6B7280' },
});
