import { Platform } from 'react-native';
import { colors } from './colors';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    mono: 'Courier New',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto',
    semiBold: 'Roboto',
    bold: 'Roboto',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    mono: 'monospace',
  },
});

export const typography = {
  // Display / Hero
  hero: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 40,
  },

  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Labels & Captions
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 15,
  },

  // Button text
  buttonLarge: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.3,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.1,
  },

  // Monospace (code, IDs)
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
    color: colors.electric,
  },
};

export { fontFamily };
