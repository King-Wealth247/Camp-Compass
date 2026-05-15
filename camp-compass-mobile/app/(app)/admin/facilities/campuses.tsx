import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { dataService } from '@/lib/dataService';
import { MapPin, Plus, X, Edit2, Trash2 } from 'lucide-react-native';

export default function ManageCampuses() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', city: '', region: '', latitude: '', longitude: '', institutionId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, iRes] = await Promise.all([
        dataService.getCampuses(),
        dataService.getInstitutions()
      ]);
      if (cRes.data) setCampuses(cRes.data);
      if (iRes.data) setInstitutions(iRes.data);
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
        city: item.city || '',
        region: item.region || '',
        latitude: item.latitude?.toString() || '',
        longitude: item.longitude?.toString() || '',
        institutionId: item.institutionId || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', city: '', region: '', latitude: '', longitude: '', institutionId: institutions[0]?.id || '' });
    }
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this campus?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await dataService.deleteCampus(id);
          loadData();
        } catch(e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.institutionId) {
      Alert.alert('Error', 'Name and Institution are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      if (editingItem) {
        await dataService.updateCampus(editingItem.id, payload as any);
      } else {
        await dataService.createCampus(payload as any);
      }
      setModalVisible(false);
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to save campus');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={campuses}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBg}><MapPin color="#2563EB" size={20} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.city} {item.region}</Text>
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
              <Text style={styles.modalTitle}>{editingItem ? 'Edit Campus' : 'New Campus'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X color="#6B7280" size={24}/></TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} placeholder="Main Campus" />
            
            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 8}}>
                <Text style={styles.label}>City</Text>
                <TextInput style={styles.input} value={formData.city} onChangeText={t => setFormData({...formData, city: t})} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Region</Text>
                <TextInput style={styles.input} value={formData.region} onChangeText={t => setFormData({...formData, region: t})} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Campus</Text>}
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
  iconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#F3F4F6' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: '#111827' },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
