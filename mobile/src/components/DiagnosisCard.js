import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import ConfidenceBar from './ConfidenceBar';

const DIFFICULTY_COLORS = {
  Easy: colors.difficultyEasy,
  Moderate: colors.difficultyModerate,
  Advanced: colors.difficultyAdvanced,
  Professional: colors.difficultyProfessional,
};

/**
 * DiagnosisCard — Renders a single diagnosis cause with expandable details.
 *
 * Props:
 *   cause  {Object}  one item from diagnosis.top_causes
 *   rank   {number}  1-indexed rank
 *   defaultOpen {boolean}
 */
export default function DiagnosisCard({ cause, rank, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(defaultOpen);

  const difficultyColor = DIFFICULTY_COLORS[cause.difficulty] || colors.textSecondary;

  return (
    <View style={[styles.card, rank === 1 && styles.cardTop]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.8}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.causeTitle}>{cause.cause}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '25', borderColor: difficultyColor }]}>
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {cause.difficulty}
              </Text>
            </View>
            <Text style={styles.costText}>{cause.estimated_cost}</Text>
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Confidence bar always visible */}
      <View style={styles.barContainer}>
        <ConfidenceBar confidence={cause.confidence} height={6} />
      </View>

      {/* Expandable detail section */}
      {expanded && (
        <View style={styles.detail}>
          {/* Description */}
          <Text style={styles.sectionLabel}>What's happening</Text>
          <Text style={styles.descriptionText}>{cause.description}</Text>

          {/* Fix guide */}
          {cause.fix_guide && cause.fix_guide.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Step-by-Step Fix</Text>
              {cause.fix_guide.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </>
          )}

          {/* Parts needed */}
          {cause.parts_needed && cause.parts_needed.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Parts Needed</Text>
              <View style={styles.tagRow}>
                {cause.parts_needed.map((part, i) => (
                  <View key={i} style={styles.tag}>
                    <Ionicons name="hardware-chip-outline" size={12} color={colors.electric} />
                    <Text style={styles.tagText}>{part}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Tools needed */}
          {cause.tools_needed && cause.tools_needed.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Tools Needed</Text>
              <View style={styles.tagRow}>
                {cause.tools_needed.map((tool, i) => (
                  <View key={i} style={[styles.tag, styles.tagTool]}>
                    <Ionicons name="construct-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tool}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Warning */}
          {cause.warning && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={styles.warningText}>{cause.warning}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navyCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardTop: {
    borderColor: colors.electric,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.electric,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  headerContent: {
    flex: 1,
  },
  causeTitle: {
    ...typography.h4,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  costText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  barContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  detail: {
    padding: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.navyBorder,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: 8,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.electricGlow,
    borderWidth: 1,
    borderColor: colors.electric,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.electric,
  },
  stepText: {
    flex: 1,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.electricGlow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.electric + '40',
  },
  tagTool: {
    backgroundColor: colors.navyBorder + '80',
    borderColor: colors.navyBorder,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.electric,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.warning + '15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    padding: 12,
    marginTop: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    lineHeight: 18,
  },
});
