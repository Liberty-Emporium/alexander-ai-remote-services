import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';

const SCAN_MESSAGES = [
  'Analyzing symptoms...',
  'Scanning hardware signatures...',
  'Consulting repair database...',
  'Identifying fault patterns...',
  'Running diagnostic models...',
  'Calculating repair options...',
  'Preparing your diagnosis...',
];

/**
 * Full-screen (or inline) animated AI scanning loader.
 *
 * Props:
 *   fullScreen  {boolean}  wrap in absolute-fill overlay (default: true)
 *   message     {string}   optional static message override
 */
export default function LoadingDiagnosis({ fullScreen = true, message }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Outer ring rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Core pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scan line sweep
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Cycle messages
    if (!message) {
      const interval = setInterval(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setMsgIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [message]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scanY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const content = (
    <View style={styles.content}>
      {/* Animated scanner graphic */}
      <View style={styles.scannerContainer}>
        {/* Scan line sweep */}
        <Animated.View style={[styles.scanLine, { top: scanY }]} />

        {/* Corner brackets */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Rotating outer ring */}
        <Animated.View style={[styles.ringOuter, { transform: [{ rotate: rotation }] }]}>
          <LinearGradient
            colors={[colors.electric, 'transparent', colors.electric]}
            style={styles.ringGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Pulsing inner core */}
        <Animated.View style={[styles.core, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={gradients.electricButton}
            style={styles.coreGradient}
          >
            <Ionicons name="hardware-chip" size={32} color={colors.white} />
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Title */}
      <Text style={styles.title}>AI Diagnosis Running</Text>

      {/* Animated message */}
      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {message || SCAN_MESSAGES[msgIndex]}
      </Animated.Text>

      {/* Animated dots */}
      <DotsLoader />

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>This may take 15–30 seconds</Text>
    </View>
  );

  if (!fullScreen) {
    return <View style={styles.inlineContainer}>{content}</View>;
  }

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.fullScreen}>
      {content}
    </LinearGradient>
  );
}

function DotsLoader() {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.3)).current;
  const anim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(anim1, 0);
    animate(anim2, 200);
    animate(anim3, 400);
  }, []);

  return (
    <View style={styles.dots}>
      {[anim1, anim2, anim3].map((a, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: a }]} />
      ))}
    </View>
  );
}

const SCANNER_SIZE = 140;

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scannerContainer: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.electric,
    opacity: 0.6,
    zIndex: 10,
    shadowColor: colors.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: colors.electric,
    zIndex: 20,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 2, borderLeftWidth: 2,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 2, borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 2, borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 2, borderRightWidth: 2,
  },
  ringOuter: {
    position: 'absolute',
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: SCANNER_SIZE / 2,
    overflow: 'hidden',
  },
  ringGradient: {
    flex: 1,
    borderRadius: SCANNER_SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: colors.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  coreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.electric,
    textAlign: 'center',
    minHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.electric,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
