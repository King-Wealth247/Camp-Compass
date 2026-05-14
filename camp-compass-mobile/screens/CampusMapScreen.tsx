import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppShell } from '@/components/AppShell';
import { MapPin, Building2, Navigation, ChevronLeft } from 'lucide-react-native';
import { campuses, buildings, halls } from '@/data/mockData';

export default function CampusMapScreen() {
  const params = useLocalSearchParams<{ buildingId?: string; floor?: string; hallCode?: string }>();

  const [selectedCampus, setSelectedCampus] = useState(campuses[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [highlightHall, setHighlightHall] = useState<string | null>(null);

  // Deep-link: auto-open building/floor/hall from timetable
  useEffect(() => {
    if (params.buildingId) {
      const building = buildings.find((b) => b.id === params.buildingId);
      if (building) {
        const campus = campuses.find((c) => c.id === building.campusId);
        if (campus) setSelectedCampus(campus);
        setSelectedBuilding(params.buildingId);
        setActiveFloor(params.floor ? Number(params.floor) : 1);
        setHighlightHall(params.hallCode ?? null);
      }
    }
  }, [params.buildingId]);

  const campusBuildings = buildings.filter((b) => b.campusId === selectedCampus.id);
  const selectedBuildingData = buildings.find((b) => b.id === selectedBuilding);

  const floorHalls = selectedBuilding
    ? halls.filter((h) => h.buildingId === selectedBuilding && h.floor === activeFloor)
    : [];

  const allBuildingHalls = selectedBuilding
    ? halls.filter((h) => h.buildingId === selectedBuilding)
    : [];

  const floorNumbers = selectedBuildingData
    ? Array.from({ length: selectedBuildingData.floors }, (_, i) => i + 1)
    : [];

  return (
    <AppShell title="Campus Map">
      {/* Campus Selector */}
      <View style={styles.campusRow}>
        {campuses.map((campus) => (
          <TouchableOpacity
            key={campus.id}
            style={[styles.campusBtn, selectedCampus.id === campus.id && styles.campusBtnActive]}
            onPress={() => { setSelectedCampus(campus); setSelectedBuilding(null); setHighlightHall(null); }}
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

      {selectedBuilding ? (
        <>
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { setSelectedBuilding(null); setHighlightHall(null); }}
            activeOpacity={0.7}
          >
            <ChevronLeft color="#2563EB" size={18} />
            <Text style={styles.backText}>Back to Campus</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{selectedBuildingData?.name}</Text>

          {/* Floor selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floorScroll}>
            {floorNumbers.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.floorBtn, activeFloor === f && styles.floorBtnActive]}
                onPress={() => setActiveFloor(f)}
                activeOpacity={0.7}
              >
                <Text style={[styles.floorBtnText, activeFloor === f && styles.floorBtnTextActive]}>
                  Floor {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Floor plan placeholder */}
          <View style={styles.mapImageWrap}>
            <Building2 color="#9CA3AF" size={40} />
            <Text style={styles.mapPlaceholderText}>{selectedBuildingData?.name}</Text>
            <Text style={styles.mapPlaceholderSub}>Floor {activeFloor} Plan</Text>

            {/* Hall markers */}
            {floorHalls.slice(0, 4).map((hall, i) => (
              <View
                key={hall.id}
                style={[
                  styles.hallMarker,
                  { left: `${15 + i * 22}%` as any, top: `${30 + (i % 2) * 30}%` as any },
                  highlightHall === hall.code && styles.hallMarkerHighlight,
                ]}
              >
                <Text style={styles.hallMarkerCode}>{hall.code}</Text>
              </View>
            ))}
          </View>

          {/* Halls on this floor */}
          <Text style={styles.sectionTitle}>
            Floor {activeFloor} Halls
            {highlightHall && <Text style={styles.highlightNote}> · Navigating to {highlightHall}</Text>}
          </Text>

          {floorHalls.length === 0 ? (
            <Text style={styles.noHalls}>No halls on this floor</Text>
          ) : (
            floorHalls.map((hall) => (
              <View
                key={hall.id}
                style={[styles.hallCard, highlightHall === hall.code && styles.hallCardHighlight]}
              >
                <View style={styles.hallCardLeft}>
                  <Text style={styles.hallCode}>{hall.code}</Text>
                  <Text style={styles.hallName}>{hall.name}</Text>
                  <Text style={styles.hallMeta}>Floor {hall.floor} · Capacity: {hall.capacity} · {hall.type}</Text>
                </View>
                <View style={[styles.hallStatus, { backgroundColor: hall.available ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[styles.hallStatusText, { color: hall.available ? '#16A34A' : '#DC2626' }]}>
                    {hall.available ? 'Available' : 'In Use'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Buildings on {selectedCampus.name}</Text>
          {campusBuildings.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={styles.buildingCard}
              onPress={() => { setSelectedBuilding(building.id); setActiveFloor(1); }}
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
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#F3F4F6', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  campusBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  campusBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  campusBtnTextActive: { color: '#fff' },
  infoBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 16, gap: 6 },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoText: { fontSize: 13, color: '#374151' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 4 },
  highlightNote: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  backText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
  floorScroll: { marginBottom: 14 },
  floorBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#F3F4F6', marginRight: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  floorBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  floorBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  floorBtnTextActive: { color: '#fff' },
  mapImageWrap: {
    backgroundColor: '#E5E7EB', borderRadius: 16, height: 200,
    marginBottom: 20, overflow: 'hidden', position: 'relative',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  mapPlaceholderText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  mapPlaceholderSub: { fontSize: 12, color: '#9CA3AF' },
  hallMarker: {
    position: 'absolute', backgroundColor: '#2563EB',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  hallMarkerHighlight: { backgroundColor: '#DC2626', transform: [{ scale: 1.15 }] },
  hallMarkerCode: { color: '#fff', fontSize: 11, fontWeight: '700' },
  noHalls: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
  hallCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  hallCardHighlight: { borderColor: '#2563EB', borderWidth: 2, backgroundColor: '#EFF6FF' },
  hallCardLeft: { flex: 1 },
  hallCode: { fontSize: 14, fontWeight: '800', color: '#111827' },
  hallName: { fontSize: 13, color: '#374151', marginTop: 1 },
  hallMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  hallStatus: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  hallStatusText: { fontSize: 12, fontWeight: '700' },
  buildingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1.5, borderColor: '#F3F4F6',
  },
  buildingIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
  },
  buildingInfo: { flex: 1 },
  buildingName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  buildingCode: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  buildingFloors: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  hallsCount: { alignItems: 'center' },
  hallsCountNum: { fontSize: 22, fontWeight: '800', color: '#2563EB' },
  hallsCountLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
});
