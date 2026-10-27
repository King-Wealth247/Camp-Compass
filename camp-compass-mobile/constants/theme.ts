// Camp-Compass Design System — Premium Color Tokens
export const Colors = {
  // Primary Palette — Deep Indigo/Electric Blue
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  primaryGlow: 'rgba(79, 70, 229, 0.25)',

  // Accent
  accent: '#06B6D4', // Cyan
  accentGlow: 'rgba(6, 182, 212, 0.2)',

  // Semantic
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#DBEAFE',

  // Backgrounds
  bg: '#F0F4FF',
  bgCard: '#FFFFFF',
  bgHeader: '#1E1B4B',
  bgNavBar: '#FFFFFF',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textAccent: '#4F46E5',

  // Borders
  border: '#E2E8F0',
  borderFocus: '#4F46E5',

  // Gradients (used as arrays in LinearGradient)
  gradientHeader: ['#1E1B4B', '#2D2A6E', '#3730A3'] as string[],
  gradientCard: ['#4F46E5', '#6366F1'] as string[],
  gradientSuccess: ['#059669', '#10B981'] as string[],
  gradientWarn: ['#D97706', '#F59E0B'] as string[],

  // Role Colors
  roleStudent: '#4F46E5',
  roleStaff: '#059669',
  roleAdmin: '#DC2626',
  roleRegistrar: '#7C3AED',

  // Department Colors
  deptCS: '#4F46E5',
  deptEng: '#7C3AED',
  deptSci: '#059669',
  deptBus: '#D97706',
  deptMath: '#DC2626',
  deptArt: '#EC4899',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  primary: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Typography = {
  displayLg: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -1 },
  displayMd: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  h4: { fontSize: 16, fontWeight: '700' as const },
  bodyLg: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const },
  captionSm: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export function getRoleColor(role: string): string {
  switch (role) {
    case 'student': return Colors.roleStudent;
    case 'staff': return Colors.roleStaff;
    case 'admin': return Colors.roleAdmin;
    case 'registrar': return Colors.roleRegistrar;
    default: return Colors.primary;
  }
}

export function getDeptColor(dept: string): string {
  const map: Record<string, string> = {
    'Computer Science': Colors.deptCS,
    'Engineering': Colors.deptEng,
    'Science': Colors.deptSci,
    'Business': Colors.deptBus,
    'Mathematics': Colors.deptMath,
    'Arts': Colors.deptArt,
  };
  return map[dept] ?? Colors.primary;
}
