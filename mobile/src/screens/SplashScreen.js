import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onReady }) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Rings expand
      Animated.spring(ringScale, {
        toValue: 1.2,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
      // Brand name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(800),
    ]).start(() => {
      if (onReady) onReady();
    });
  }, []);

  return (
    <LinearGradient colors={gradients.splash} style={styles.container}>
      {/* Decorative background rings */}
      <Animated.View style={[styles.bgRing, styles.bgRingOuter, { transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.bgRing, styles.bgRingInner, { transform: [{ scale: ringScale }] }]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <LinearGradient colors={gradients.electricButton} style={styles.logo}>
          <Ionicons name="hardware-chip" size={44} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      {/* Brand name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 24 }}>
        <Text style={styles.brandLine1}>Alexander AI</Text>
        <Text style={styles.brandLine2}>Solutions</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>AI-Powered Computer Repair</Text>
        <View style={styles.taglineDivider} />
        <Text style={styles.taglineSubtext}>Diagnose · Repair · Connect</Text>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v1.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.electric + '15',
  },
  bgRingOuter: {
    width: width * 1.2,
    height: width * 1.2,
  },
  bgRingInner: {
    width: width * 0.8,
    height: width * 0.8,
    borderColor: colors.electric + '20',
  },
  logoContainer: {
    shadowColor: colors.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLine1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  brandLine2: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.electric,
    letterSpacing: 4,
    marginTop: -4,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  taglineDivider: {
    width: 40,
    height: 1,
    backgroundColor: colors.navyBorder,
    marginVertical: 12,
  },
  taglineSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    ...typography.caption,
  },
});
