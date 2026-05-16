import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { CalendarDays, Wand2, ChevronDown, ChevronRight } from 'lucide-react-native';

export default function TimetablesScreen() {
  const [activeTab, setActiveTab] = useState<"view" | "generate">("view");

  const tabs = [
    { id: "view", label: "View Timetables", icon: CalendarDays },
    { id: "generate", label: "Generate", icon: Wand2 },
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
        {activeTab === 'view' && <ViewTimetablesTab />}
        {activeTab === 'generate' && <GenerateTab onComplete={() => setActiveTab("view")} />}
      </View>
    </View>
  );
}

function ViewTimetablesTab() {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('http://localhost:3000/api/timetable').then(r => r.json()).then(data => {
      setTimetables(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  if (loading) return <ActivityIndicator style={{marginTop:20}} />;
  return (
    <FlatList
      data={timetables}
      keyExtractor={i => i.id}
      renderItem={({item}) => {
        const isExpanded = expanded.has(item.id);
        return (
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.id)}>
              <View>
                <Text style={styles.cardTitle}>{item.department?.departmentName || 'Dept'}</Text>
                <Text style={styles.cardSub}>Level {item.level} • {item.subComponents?.length || 0} classes</Text>
              </View>
              {isExpanded ? <ChevronDown color="#9CA3AF" /> : <ChevronRight color="#9CA3AF" />}
            </TouchableOpacity>
            
            {isExpanded && item.subComponents && item.subComponents.length > 0 && (
              <View style={styles.expandedContent}>
                {item.subComponents.map((sub: any) => (
                  <View key={sub.id} style={styles.subItem}>
                    <Text style={styles.subCourse}>{sub.course}</Text>
                    <Text style={styles.subDetails}>{sub.day} • {new Date(sub.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(sub.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                    <Text style={styles.subDetails}>{sub.hall} (Flr {sub.floor}) • {sub.instructor}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      }}
      ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No timetables found</Text>}
    />
  );
}

function GenerateTab({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<"all" | "department" | "single">("all");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch('http://localhost:3000/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      Alert.alert('Success', 'Timetable generated successfully');
      onComplete();
    } catch (e) {
      Alert.alert('Error', 'Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{gap: 12, marginBottom: 20}}>
        {[
          { id: 'all', title: 'All Departments', sub: 'Generate for every level' },
          { id: 'department', title: 'Single Department', sub: 'Generate for all levels within a department' },
          { id: 'single', title: 'Single Level', sub: 'Generate for one specific level' },
        ].map(m => (
          <TouchableOpacity 
            key={m.id} 
            style={[styles.modeCard, mode === m.id && styles.modeCardActive]}
            onPress={() => setMode(m.id as any)}
          >
            <Text style={[styles.modeTitle, mode === m.id && styles.modeTitleActive]}>{m.title}</Text>
            <Text style={styles.modeSub}>{m.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.genBtn, generating && {backgroundColor: '#93C5FD'}]} 
        onPress={handleGenerate}
        disabled={generating}
      >
        {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.genBtnText}>Start Generation</Text>}
      </TouchableOpacity>
    </ScrollView>
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
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity:0.05, shadowRadius:4, overflow:'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  expandedContent: { backgroundColor: '#F9FAFB', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  subItem: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  subCourse: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  subDetails: { fontSize: 12, color: '#4B5563', marginTop: 1 },
  modeCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB' },
  modeCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  modeTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modeTitleActive: { color: '#1D4ED8' },
  modeSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  genBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  genBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
