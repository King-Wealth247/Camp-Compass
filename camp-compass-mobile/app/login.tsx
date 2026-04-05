import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Calendar, Clock } from 'lucide-react-native';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = () => {
    setError('');
    const user = login(email.trim(), password);
    if (user) {
      router.replace(`/(app)/${user.role}/dashboard` as any);
    } else {
      setError('Invalid email or password');
    }
  };

  const fillDemo = (role: string) => {
    const demos: Record<string, { email: string; pass: string }> = {
      student: { email: 'student@campus.edu', pass: 'student123' },
      staff: { email: 'staff@campus.edu', pass: 'staff123' },
      admin: { email: 'admin@campus.edu', pass: 'admin123' },
      registrar: { email: 'registrar@campus.edu', pass: 'registrar123' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].pass);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logoBox}>
            <MapPin color="#2563EB" size={36} />
          </View>
          <Text style={styles.appName}>Camp-Compass</Text>
          <Text style={styles.tagline}>University Campus Mapping & Timetable Management System</Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: '#2563EB' }]}>
                <MapPin color="#fff" size={18} />
              </View>
              <View>
                <Text style={styles.featureTitle}>Interactive Campus Maps</Text>
                <Text style={styles.featureSubtitle}>Navigate indoor & outdoor spaces</Text>
              </View>
            </View>
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: '#4F46E5' }]}>
                <Calendar color="#fff" size={18} />
              </View>
              <View>
                <Text style={styles.featureTitle}>Smart Timetables</Text>
                <Text style={styles.featureSubtitle}>Automated scheduling & updates</Text>
              </View>
            </View>
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: '#7C3AED' }]}>
                <Clock color="#fff" size={18} />
              </View>
              <View>
                <Text style={styles.featureTitle}>Real-time Notifications</Text>
                <Text style={styles.featureSubtitle}>Stay updated on changes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to access your campus portal</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Institutional Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@campus.edu"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.signInButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          {/* Demo Accounts */}
          <View style={styles.demoSection}>
            <Text style={styles.demoLabel}>Demo Accounts (tap to fill):</Text>
            <View style={styles.demoGrid}>
              {['student', 'staff', 'admin', 'registrar'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.demoCard}
                  onPress={() => fillDemo(role)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.demoRole}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                  <Text style={styles.demoEmail}>{role}@campus.edu</Text>
                  <Text style={styles.demoPass}>{role}123</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  demoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '500',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    width: '47%',
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  demoEmail: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  demoPass: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
});
