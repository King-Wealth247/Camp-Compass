import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppShell } from '@/components/AppShell';
import { MapPin, Building2, Navigation, ChevronLeft, ExternalLink } from 'lucide-react-native';
import { dataService } from '@/services/dataService';

export default function CampusMapScreen() {
  const params = useLocalSearchParams<{ buildingId?: string; floor?: string; hallCode?: string }>();

  const [campuses, setCampuses] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);
  const [floorsData, setFloorsData] = useState<any[]>([]);
  
  const [selectedCampus, setSelectedCampus] = useState<any | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [highlightHall, setHighlightHall] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [campusRes, buildingRes, hallRes, floorRes] = await Promise.all([
          dataService.getCampuses(),
          dataService.getBuildings(),
          dataService.getHalls(),
          dataService.getFloors(),
        ]);
        
        if (campusRes.data) setCampuses(campusRes.data);
        if (buildingRes.data) setBuildings(buildingRes.data);
        if (hallRes.data) setHalls(hallRes.data);
        if (floorRes.data) setFloorsData(floorRes.data);
        
        if (campusRes.data && campusRes.data.length > 0 && !selectedCampus) {
          setSelectedCampus(campusRes.data[0]);
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Deep-link: auto-open building/floor/hall from timetable
  useEffect(() => {
    if (params.buildingId && buildings.length > 0) {
      const building = buildings.find((b) => b.id === params.buildingId);
      if (building) {
        const campus = campuses.find((c) => c.id === building.campusId);
        if (campus) setSelectedCampus(campus);
        setSelectedBuilding(params.buildingId);
        setActiveFloor(params.floor ? Number(params.floor) : 1);
        setHighlightHall(params.hallCode ?? null);
      }
    }
  }, [params.buildingId, buildings, campuses]);

  if (loading || !selectedCampus) {
    return (
      <AppShell title="Campus Map">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading Map Data...</Text>
        </View>
      </AppShell>
    );
  }

  const campusBuildings = buildings.filter((b) => b.campusId === selectedCampus.id);
  const selectedBuildingData = buildings.find((b) => b.id === selectedBuilding);

  const floorHalls = selectedBuilding
    ? halls.filter((h) => h.building?.id === selectedBuilding && (h.floor === activeFloor || h.floorRef?.floorNum === activeFloor || h.floorId === floorsData.find(f => f.floorNum === activeFloor && f.buildingId === selectedBuilding)?.id))
    : [];

  const floorNumbers = selectedBuildingData
    ? Array.from({ length: selectedBuildingData.floors }, (_, i) => i + 1)
    : [];

  const activeFloorData = floorsData.find(f => f.buildingId === selectedBuilding && f.floorNum === activeFloor);

  const openGoogleMaps = () => {
    if (!selectedBuildingData || !selectedBuildingData.latitude || !selectedBuildingData.longitude) {
      alert("No coordinates available for this building.");
      return;
    }
    const lat = selectedBuildingData.latitude;
    const lng = selectedBuildingData.longitude;
    const label = encodeURIComponent(selectedBuildingData.name);
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
        }
      });
    }
  };

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
          <Text style={styles.infoText}>{selectedCampus.city || 'Unknown City'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Navigation color="#6B7280" size={14} />
          <Text style={styles.infoText}>{selectedCampus.region || 'Unknown'} Region</Text>
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

          {/* Floor plan rendering */}
          {activeFloorData?.floorPlan ? (
             <View style={styles.mapImageWrap}>
               <Image 
                 source={{ uri: activeFloorData.floorPlan }} 
                 style={{ width: '100%', height: '100%', position: 'absolute' }}
                 resizeMode="cover"
               />
               {/* Note: since image overlays the background, hall markers logic is kept simple here */}
             </View>
          ) : (
            <View style={styles.mapImageWrap}>
              <Building2 color="#9CA3AF" size={40} />
              <Text style={styles.mapPlaceholderText}>No Floor Plan Available</Text>
              <Text style={styles.mapPlaceholderSub}>For Floor {activeFloor}</Text>
              
              <TouchableOpacity style={styles.externalMapBtn} onPress={openGoogleMaps}>
                <ExternalLink color="#fff" size={16} />
                <Text style={styles.externalMapBtnText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </View>
          )}

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
                style={[styles.hallCard, highlightHall === (hall.code || hall.name) && styles.hallCardHighlight]}
              >
                <View style={styles.hallCardLeft}>
                  <Text style={styles.hallCode}>{hall.code || hall.name}</Text>
                  <Text style={styles.hallName}>{hall.name}</Text>
                  <Text style={styles.hallMeta}>Capacity: {hall.capacity}</Text>
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
                <Text style={styles.buildingCode}>{building.code || 'No Code'}</Text>
                <Text style={styles.buildingFloors}>{building.floors} floors</Text>
              </View>
              <View style={styles.hallsCount}>
                <Text style={styles.hallsCountNum}>
                  {halls.filter((h) => h.building?.id === building.id).length}
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
  mapPlaceholderSub: { fontSize: 12, color: '#9CA3AF', marginBottom: 10 },
  externalMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    marginTop: 8,
  },
  externalMapBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
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
