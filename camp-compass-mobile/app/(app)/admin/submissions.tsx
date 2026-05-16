import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Clock, Filter, AlertCircle, CheckCircle2, XCircle } from 'lucide-react-native';

export default function SubmissionsScreen() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterResubmissions, setFilterResubmissions] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/availability').then(r => r.json()).then(data => {
      setSubmissions(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleReview = async (id: string, action: 'validate' | 'reject') => {
    try {
      await fetch(`http://localhost:3000/api/availability/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      setSubmissions(submissions.map(s => s.id === id ? { ...s, resubmission: action } : s));
    } catch (err) {
      console.log('Failed to review', err);
    }
  };

  const filtered = submissions.filter(s => {
    if (filterResubmissions) return s.resubmission !== null;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.filterBtn, filterResubmissions && styles.filterBtnActive]} 
          onPress={() => setFilterResubmissions(!filterResubmissions)}
        >
          <Filter color={filterResubmissions ? '#1D4ED8' : '#6B7280'} size={16} />
          <Text style={[styles.filterText, filterResubmissions && styles.filterTextActive]}>
            {filterResubmissions ? 'Showing Resubmissions' : 'Filter: Resubmissions'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{padding: 16}}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.lecturerName}>{item.lecturer?.name || 'Unknown'}</Text>
                  <Text style={styles.lecturerEmail}>{item.lecturer?.email}</Text>
                </View>
                {item.resubmission !== null ? (
                  <View style={[styles.badge, {backgroundColor: '#FFF7ED'}]}>
                    <Clock color="#EA580C" size={12} />
                    <Text style={[styles.badgeText, {color: '#EA580C'}]}>Resubmission</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, {backgroundColor: '#F3F4F6'}]}>
                    <Text style={[styles.badgeText, {color: '#4B5563'}]}>Initial</Text>
                  </View>
                )}
              </View>

              <Text style={styles.desc}>{item.description || 'No reason provided'}</Text>

              <View style={styles.statusRow}>
                {item.resubmission === 'unseen' && (
                  <View style={{flexDirection: 'row', gap: 8}}>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#DCFCE7'}]} onPress={() => handleReview(item.id, 'validate')}>
                      <Text style={[styles.actionBtnText, {color: '#16A34A'}]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#FEE2E2'}]} onPress={() => handleReview(item.id, 'reject')}>
                      <Text style={[styles.actionBtnText, {color: '#DC2626'}]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.resubmission === 'validated' && (
                  <View style={styles.statusBadge}><CheckCircle2 color="#16A34A" size={14} /><Text style={{color:'#16A34A', fontSize:12, fontWeight:'600'}}>Approved</Text></View>
                )}
                {item.resubmission === 'rejected' && (
                  <View style={styles.statusBadge}><XCircle color="#DC2626" size={14} /><Text style={{color:'#DC2626', fontSize:12, fontWeight:'600'}}>Rejected</Text></View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No submissions found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'flex-end' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  filterBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterTextActive: { color: '#1D4ED8' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity:0.05, shadowRadius:4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  lecturerName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  lecturerEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  desc: { fontSize: 13, color: '#4B5563', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 }
});
