import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Compass, MapPin, Calendar, Bell, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { Colors, Shadow, Radius, Spacing, Typography } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const ROLE_DEMOS = [
  { role: 'student', label: 'Student', color: Colors.roleStudent, email: 'student@campus.edu', pass: 'student123' },
  { role: 'staff', label: 'Lecturer', color: Colors.roleStaff, email: 'staff@campus.edu', pass: 'staff123' },
  { role: 'admin', label: 'Admin', color: Colors.roleAdmin, email: 'admin@campus.edu', pass: 'admin123' },
  { role: 'registrar', label: 'Registrar', color: Colors.roleRegistrar, email: 'registrar@campus.edu', pass: 'registrar123' },
];

const FEATURES = [
  { icon: MapPin, color: Colors.primary, bg: 'rgba(79,70,229,0.15)', title: 'Interactive Campus Maps', sub: 'Navigate buildings & floor plans' },
  { icon: Calendar, color: Colors.accent, bg: 'rgba(6,182,212,0.15)', title: 'Smart Timetables', sub: 'Auto-scheduled & conflict-free' },
  { icon: Bell, color: Colors.success, bg: 'rgba(16,185,129,0.15)', title: 'Live Notifications', sub: 'Instant timetable change alerts' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.stagger(150, [
      Animated.spring(logoAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(formAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();

    // Floating logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Pulse on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user) {
        router.replace(`/(app)/${user.role}/dashboard` as any);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: typeof ROLE_DEMOS[0]) => {
    setEmail(role.email);
    setPassword(role.pass);
    setError('');
  };

  const logoTranslateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const logoOpacity = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const formOpacity = formAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const formTranslateY = formAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Decorations */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />
      <View style={styles.bgBlob3} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo + Branding */}
        <Animated.View style={[styles.brandingSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoTranslateY }] }]}>
            <Animated.View style={[styles.logoPulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.logoBox}>
              <Compass color="#fff" size={40} strokeWidth={2} />
            </View>
          </Animated.View>

          <Text style={styles.appName}>Camp-Compass</Text>
          <View style={styles.taglineRow}>
            <View style={styles.taglineDot} />
            <Text style={styles.tagline}>University Campus Management System</Text>
            <View style={styles.taglineDot} />
          </View>

          {/* Feature Pills */}
          <View style={styles.featurePills}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.featurePill, { backgroundColor: f.bg, borderColor: f.color + '30' }]}>
                <f.icon color={f.color} size={14} strokeWidth={2} />
                <Text style={[styles.featurePillText, { color: f.color }]}>{f.title.split(' ')[0]} {f.title.split(' ')[1]}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Login Form */}
        <Animated.View
          style={[
            styles.formCard,
            { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your campus portal</Text>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Institutional Email</Text>
            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                placeholder="your.email@campus.edu"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass
                  ? <EyeOff color={Colors.textMuted} size={18} />
                  : <Eye color={Colors.textMuted} size={18} />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <View style={styles.signInBtnInner}>
              <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              {!loading && <ChevronRight color="#fff" size={18} strokeWidth={2.5} />}
            </View>
            {loading && (
              <View style={styles.signInLoadingBar} />
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Quick Demo Access</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo Cards */}
          <View style={styles.demoGrid}>
            {ROLE_DEMOS.map((demo) => (
              <TouchableOpacity
                key={demo.role}
                style={[styles.demoCard, { borderColor: demo.color + '40' }]}
                onPress={() => fillDemo(demo)}
                activeOpacity={0.75}
              >
                <View style={[styles.demoRoleBadge, { backgroundColor: demo.color }]}>
                  <Text style={styles.demoRoleLetter}>{demo.label[0]}</Text>
                </View>
                <Text style={[styles.demoRoleText, { color: demo.color }]}>{demo.label}</Text>
                <Text style={styles.demoEmailText} numberOfLines={1}>{demo.role}@campus.edu</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.versionText}>Camp-Compass v1.0.0 · Secure Portal</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgHeader,
  },
  bgBlob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.15,
    top: -80,
    right: -80,
  },
  bgBlob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent,
    opacity: 0.08,
    top: 100,
    left: -60,
  },
  bgBlob3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.primaryLight,
    opacity: 0.06,
    bottom: 200,
    right: -50,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(79,70,229,0.4)',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: -1,
    marginBottom: 8,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryLight,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    textAlign: 'center',
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xxl,
    padding: 24,
    width: '100%',
    ...Shadow.lg,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 4,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadow.primary,
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  signInBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  signInLoadingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  demoCard: {
    width: '47%',
    backgroundColor: '#F8FAFF',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1.5,
    alignItems: 'flex-start',
    gap: 4,
  },
  demoRoleBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  demoRoleLetter: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  demoRoleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoEmailText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 8,
  },
});
