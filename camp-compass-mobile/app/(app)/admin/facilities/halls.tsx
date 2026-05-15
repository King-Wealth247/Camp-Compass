import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { dataService } from '@/lib/dataService';
import { DoorOpen, Plus, X, Edit2, Trash2 } from 'lucide-react-native';

export default function ManageHalls() {
  const [halls, setHalls] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', capacity: '30', floor: '1', buildingId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, bRes] = await Promise.all([
        dataService.getHalls(),
        dataService.getBuildings()
      ]);
      if (hRes.data) setHalls(hRes.data);
      if (bRes.data) setBuildings(bRes.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        capacity: item.capacity?.toString() || '30',
        floor: item.floor?.toString() || '1',
        buildingId: item.buildingId || item.building?.id || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', capacity: '30', floor: '1', buildingId: buildings[0]?.id || '' });
    }
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this hall?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await dataService.deleteHall(id);
          loadData();
        } catch(e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        capacity: parseInt(formData.capacity) || 30,
        floor: parseInt(formData.floor) || 1,
        buildingId: formData.buildingId,
        available: true
      };

      if (editingItem) {
        await dataService.updateHall(editingItem.id, payload as any);
      } else {
        await dataService.createHall(payload as any);
      }
      setModalVisible(false);
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to save hall');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={halls}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBg}><DoorOpen color="#7C3AED" size={20} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.building?.name} • Floor {item.floor} • {item.capacity} seats</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
                <Edit2 color="#4B5563" size={18} />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderLeftWidth: 1, borderColor: '#E5E7EB' }]} onPress={() => handleDelete(item.id)}>
                <Trash2 color="#EF4444" size={18} />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Edit Hall' : 'New Hall'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X color="#6B7280" size={24}/></TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} placeholder="Room 101" />
            
            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 8}}>
                <Text style={styles.label}>Capacity</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.capacity} onChangeText={t => setFormData({...formData, capacity: t})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Floor</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.floor} onChangeText={t => setFormData({...formData, floor: t})} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Hall</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  iconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#F3F4F6' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', shadowColor: '#7C3AED', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: '#111827' },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
