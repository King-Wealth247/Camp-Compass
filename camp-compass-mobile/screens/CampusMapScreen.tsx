import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { MapPin, Building2, Navigation, ChevronLeft } from 'lucide-react-native';
import { campuses, buildings, halls } from '@/data/mockData';

export default function CampusMapScreen() {
  const [selectedCampus, setSelectedCampus] = useState(campuses[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const campusBuildings = buildings.filter((b) => b.campusId === selectedCampus.id);
  const buildingHalls = selectedBuilding
    ? halls.filter((h) => h.buildingId === selectedBuilding)
    : [];

  const selectedBuildingData = buildings.find((b) => b.id === selectedBuilding);

  return (
    <AppShell title="Campus Map">
      {/* Campus Selector */}
      <View style={styles.campusRow}>
        {campuses.map((campus) => (
          <TouchableOpacity
            key={campus.id}
            style={[styles.campusBtn, selectedCampus.id === campus.id && styles.campusBtnActive]}
            onPress={() => { setSelectedCampus(campus); setSelectedBuilding(null); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.campusBtnText, selectedCampus.id === campus.id && styles.campusBtnTextActive]}>
              {campus.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Campus Info */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <MapPin color="#6B7280" size={14} />
          <Text style={styles.infoText}>{selectedCampus.city}</Text>
        </View>
        <View style={styles.infoRow}>
          <Navigation color="#6B7280" size={14} />
          <Text style={styles.infoText}>{selectedCampus.region} Region</Text>
        </View>
      </View>

      {/* Building View or Floor Plan */}
      {selectedBuilding ? (
        <>
          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedBuilding(null)} activeOpacity={0.7}>
            <ChevronLeft color="#2563EB" size={18} />
            <Text style={styles.backText}>Back to Campus</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{selectedBuildingData?.name} — Floor Plans</Text>

          {/* Map Image placeholder */}
          <View style={styles.mapImageWrap}>
            <View style={styles.mapImagePlaceholder}>
              <Building2 color="#9CA3AF" size={48} />
              <Text style={styles.mapPlaceholderText}>Floor Plan</Text>
              <Text style={styles.mapPlaceholderSub}>{selectedBuildingData?.name}</Text>
            </View>
            {/* Hall Markers */}
            {buildingHalls.slice(0, 3).map((hall, i) => (
              <View
                key={hall.id}
                style={[styles.hallMarker, { left: `${20 + i * 25}%` as any, top: `${25 + i * 20}%` as any }]}
              >
                <Text style={styles.hallMarkerCode}>{hall.code}</Text>
              </View>
            ))}
          </View>

          {/* Halls List */}
          <Text style={styles.sectionTitle}>Available Halls</Text>
          {buildingHalls.map((hall) => (
            <View key={hall.id} style={styles.hallCard}>
              <View style={styles.hallCardLeft}>
                <Text style={styles.hallCode}>{hall.code}</Text>
                <Text style={styles.hallName}>{hall.name}</Text>
                <Text style={styles.hallMeta}>Floor {hall.floor} • Capacity: {hall.capacity} • {hall.type}</Text>
              </View>
              <View style={[styles.hallStatus, { backgroundColor: hall.available ? '#DCFCE7' : '#FEE2E2' }]}>
                <Text style={[styles.hallStatusText, { color: hall.available ? '#16A34A' : '#DC2626' }]}>
                  {hall.available ? 'Available' : 'In Use'}
                </Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Buildings on {selectedCampus.name}</Text>
          {campusBuildings.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={styles.buildingCard}
              onPress={() => setSelectedBuilding(building.id)}
              activeOpacity={0.7}
            >
              <View style={styles.buildingIcon}>
                <Building2 color="#fff" size={22} />
              </View>
              <View style={styles.buildingInfo}>
                <Text style={styles.buildingName}>{building.name}</Text>
                <Text style={styles.buildingCode}>{building.code}</Text>
                <Text style={styles.buildingFloors}>{building.floors} floors</Text>
              </View>
              <View style={styles.hallsCount}>
                <Text style={styles.hallsCountNum}>
                  {halls.filter((h) => h.buildingId === building.id).length}
                </Text>
                <Text style={styles.hallsCountLabel}>halls</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  campusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  campusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  campusBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  campusBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  campusBtnTextActive: { color: '#fff' },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoText: { fontSize: 13, color: '#374151' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 4 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  backText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
  mapImageWrap: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    height: 200,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImagePlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  mapPlaceholderText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  mapPlaceholderSub: { fontSize: 12, color: '#9CA3AF' },
  hallMarker: {
    position: 'absolute',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hallMarkerCode: { color: '#fff', fontSize: 11, fontWeight: '700' },
  hallCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  hallCardLeft: { flex: 1 },
  hallCode: { fontSize: 14, fontWeight: '800', color: '#111827' },
  hallName: { fontSize: 13, color: '#374151', marginTop: 1 },
  hallMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  hallStatus: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  hallStatusText: { fontSize: 12, fontWeight: '700' },
  buildingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  buildingIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingInfo: { flex: 1 },
  buildingName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  buildingCode: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  buildingFloors: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  hallsCount: { alignItems: 'center' },
  hallsCountNum: { fontSize: 22, fontWeight: '800', color: '#2563EB' },
  hallsCountLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
});
