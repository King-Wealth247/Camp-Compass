import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { Inbox, Send, Bell, Trash2, CheckCircle2 } from 'lucide-react-native';

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<"inbox" | "outbox">("inbox");

  const tabs = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "outbox", label: "Outbox", icon: Send },
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
        {activeTab === 'inbox' && <InboxTab />}
        {activeTab === 'outbox' && <OutboxTab onSent={() => setActiveTab('inbox')} />}
      </View>
    </View>
  );
}

function InboxTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/notifications').then(r => r.json()).then(data => {
      setNotifications(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch {}
  };

  if (loading) return <ActivityIndicator style={{marginTop:20}} />;

  return (
    <FlatList
      data={notifications}
      keyExtractor={i => i.id}
      renderItem={({item}) => (
        <View style={[styles.card, !item.read && styles.cardUnread]}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
              <Bell color={item.read ? '#9CA3AF' : '#2563EB'} size={18} />
              <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>{item.title}</Text>
            </View>
            <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={[styles.cardMsg, !item.read && styles.cardMsgUnread]}>{item.message}</Text>
          <View style={styles.actionsRow}>
            {!item.read && (
              <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={styles.iconBtn}>
                <CheckCircle2 color="#2563EB" size={20} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
              <Trash2 color="#EF4444" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20, color:'#6B7280'}}>No notifications</Text>}
    />
  );
}

function OutboxTab({ onSent }: { onSent: () => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return Alert.alert("Error", "Title and message are required");
    setSending(true);
    try {
      await fetch('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, targetRole })
      });
      Alert.alert("Success", "Broadcast sent!");
      setTitle(""); setMessage(""); setTargetRole("all");
      onSent();
    } catch {
      Alert.alert("Error", "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={{padding: 16}}>
      <Text style={styles.formLabel}>Target Audience</Text>
      <View style={styles.segmentedControl}>
        {['all', 'student', 'staff'].map(role => (
          <TouchableOpacity 
            key={role} 
            style={[styles.segmentBtn, targetRole === role && styles.segmentBtnActive]}
            onPress={() => setTargetRole(role)}
          >
            <Text style={[styles.segmentText, targetRole === role && styles.segmentTextActive]}>{role.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.formLabel}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Important Update" />

      <Text style={styles.formLabel}>Message</Text>
      <TextInput 
        style={[styles.input, {height: 120, textAlignVertical: 'top'}]} 
        value={message} 
        onChangeText={setMessage} 
        placeholder="Type your message here..." 
        multiline 
      />

      <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send Broadcast</Text>}
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
  content: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardUnread: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
  cardTitleUnread: { color: '#1E3A8A', fontWeight: '700' },
  cardTime: { fontSize: 11, color: '#9CA3AF' },
  cardMsg: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  cardMsgUnread: { color: '#1E40AF' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 12 },
  iconBtn: { padding: 4 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 14 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 8, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  segmentBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  segmentTextActive: { color: '#111827' },
  sendBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
