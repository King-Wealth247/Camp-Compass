import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, Save } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(authUser?.name || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [phone, setPhone] = useState("");

  // In a real app we'd fetch full profile to get phone number, but we'll simulate for now
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if(data) {
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!name || !email) return Alert.alert("Error", "Name and email are required");
    setSaving(true);
    try {
      await fetch(`http://localhost:3000/api/users/${authUser?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  if (loading) return <ActivityIndicator style={{marginTop:40}} />;

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.headerBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.roleText}>{authUser?.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+1 234 567 8900" />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <Save color="#fff" size={18} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFF', padding: 16 },
  headerBox: { alignItems: 'center', marginVertical: 32 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  nameText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  roleText: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginTop: 4, letterSpacing: 1 },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16, color: '#111827' },
  saveBtn: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 12, gap: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
