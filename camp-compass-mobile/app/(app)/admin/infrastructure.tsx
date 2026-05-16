import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, TextInput, Modal, Button } from 'react-native';
import { Building2, Layers, DoorOpen, Plus, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function InfrastructureScreen() {
  const [activeTab, setActiveTab] = useState<"buildings" | "floors" | "halls">("buildings");

  const tabs = [
    { id: "buildings", label: "Buildings", icon: Building2 },
    { id: "floors", label: "Floors", icon: Layers },
    { id: "halls", label: "Halls", icon: DoorOpen },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} style={[styles.tab, isActive && styles.activeTab]} onPress={() => setActiveTab(tab.id)}>
              <tab.icon color={isActive ? '#2563EB' : '#6B7280'} size={18} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === 'buildings' && <BuildingsTab />}
        {activeTab === 'floors' && <FloorsTab />}
        {activeTab === 'halls' && <HallsTab />}
      </View>
    </View>
  );
}

function BuildingsTab() {
  // Mobile mock or simplified layout for brevity
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/buildings').then(r => r.json()).then(data => {
      setBuildings(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{marginTop:20}} />;
  return (
    <FlatList
      data={buildings}
      keyExtractor={i => i.id}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>Code: {item.code || '-'}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No buildings found</Text>}
    />
  );
}

function FloorsTab() {
  const [floors, setFloors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imageUri, setImageUri] = useState<string|null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/floors').then(r => r.json()).then(data => {
      setFloors(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  if (loading) return <ActivityIndicator style={{marginTop:20}} />;
  return (
    <View style={{flex: 1}}>
      <FlatList
        data={floors}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Floor {item.floorNum}</Text>
            {item.floorPlan && <Text style={{color:'green', fontSize:12}}>Plan Uploaded</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No floors found</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{padding:20, paddingTop: 40}}>
          <Text style={{fontSize: 20, fontWeight:'bold', marginBottom:20}}>Add Floor</Text>
          <Button title="Pick Floorplan Image" onPress={pickImage} />
          {imageUri && <Text style={{marginVertical: 10, color:'green'}}>Image selected!</Text>}
          <View style={{marginTop: 20}}>
            <Button title="Cancel" color="red" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HallsTab() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/halls').then(r => r.json()).then(data => {
      setHalls(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{marginTop:20}} />;
  return (
    <FlatList
      data={halls}
      keyExtractor={i => i.id}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>Capacity: {item.capacity} • Floor: {item.floor}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No halls found</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 11, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  activeTabText: { color: '#2563EB', fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity:0.05, shadowRadius:4, shadowOffset:{width:0, height:2} },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  fab: { position:'absolute', bottom:20, right:20, width:56, height:56, borderRadius:28, backgroundColor:'#2563EB', justifyContent:'center', alignItems:'center', elevation:4 }
});
