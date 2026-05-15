import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

/**
 * Animated horizontal confidence bar.
 *
 * Props:
 *   confidence  {number}  0–100
 *   label       {string}  optional override label (default: "Confidence")
 *   height      {number}  bar height (default: 8)
 *   showValue   {boolean} show % value (default: true)
 */
export default function ConfidenceBar({
  confidence = 0,
  label = 'Confidence',
  height = 8,
  showValue = true,
}) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: Math.min(Math.max(confidence, 0), 100),
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const barColor =
    confidence >= 70
      ? colors.confidenceHigh
      : confidence >= 40
      ? colors.confidenceMed
      : colors.confidenceLow;

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {showValue && (
          <Text style={[styles.value, { color: barColor }]}>{confidence}%</Text>
        )}
      </View>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              height,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    width: '100%',
    backgroundColor: colors.navyBorder,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 99,
  },
});
