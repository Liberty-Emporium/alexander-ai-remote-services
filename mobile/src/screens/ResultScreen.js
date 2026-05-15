import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import DiagnosisCard from '../components/DiagnosisCard';

export default function ResultScreen({ route, navigation }) {
  const { diagnosis, jobId, description } = route.params || {};

  if (!diagnosis) {
    return (
      <LinearGradient colors={gradients.navyHero} style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>No Results</Text>
          <Text style={styles.errorSub}>Something went wrong. Please try again.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const hasAlerts = diagnosis.urgent || diagnosis.data_loss_risk || diagnosis.professional_recommended;

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.navBack} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Diagnosis Results</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <LinearGradient colors={gradients.electricButton} style={styles.summaryIcon}>
              <Ionicons name="checkmark" size={20} color={colors.white} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>AI ANALYSIS COMPLETE</Text>
              <Text style={styles.summaryTitle}>Diagnosis Ready</Text>
            </View>
          </View>

          {diagnosis.summary && (
            <Text style={styles.summaryText}>{diagnosis.summary}</Text>
          )}

          {diagnosis.device_assessment && (
            <View style={styles.deviceAssessmentRow}>
              <Ionicons name="information-circle-outline" size={14} color={colors.info} />
              <Text style={styles.deviceAssessmentText}>{diagnosis.device_assessment}</Text>
            </View>
          )}

          {jobId && (
            <View style={styles.jobIdRow}>
              <Text style={styles.jobIdLabel}>Job ID</Text>
              <Text style={styles.jobIdValue}>{jobId.slice(0, 8).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Alert banners */}
        {diagnosis.urgent && (
          <AlertBanner
            icon="warning"
            color={colors.error}
            title="Urgent Issue Detected"
            message={diagnosis.urgent_reason || 'This problem requires immediate attention to prevent further damage.'}
          />
        )}
        {diagnosis.data_loss_risk && (
          <AlertBanner
            icon="save-outline"
            color={colors.warning}
            title="Data Loss Risk"
            message={diagnosis.data_loss_reason || 'Back up your data immediately before attempting any repairs.'}
          />
        )}
        {diagnosis.professional_recommended && (
          <AlertBanner
            icon="person-outline"
            color={colors.info}
            title="Professional Repair Recommended"
            message={diagnosis.professional_reason || 'This repair is best handled by a certified technician.'}
          />
        )}

        {/* Top causes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 3 Likely Causes</Text>
          <Text style={styles.sectionSub}>Tap each card to see the full repair guide</Text>

          {diagnosis.top_causes?.map((cause, index) => (
            <DiagnosisCard
              key={index}
              cause={cause}
              rank={cause.rank || index + 1}
              defaultOpen={index === 0}
            />
          ))}
        </View>

        {/* Talk to a tech CTA */}
        <View style={styles.techCTACard}>
          <View style={styles.techCTALeft}>
            <Ionicons name="headset" size={28} color={colors.electric} />
            <View>
              <Text style={styles.techCTATitle}>Need expert help?</Text>
              <Text style={styles.techCTASub}>Connect with a certified technician live</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.techCTABtn}
            onPress={() => navigation.navigate('Tech', { jobId })}
            activeOpacity={0.85}
          >
            <LinearGradient colors={gradients.electricButton} style={styles.techCTABtnGradient}>
              <Text style={styles.techCTABtnText}>Talk to a Tech</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Actions row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('JobHistory')}
          >
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionBtnText}>View History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => navigation.navigate('Diagnose')}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.electric} />
            <Text style={[styles.actionBtnText, { color: colors.electric }]}>New Diagnosis</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Results are AI-generated based on the information provided. For hardware repairs involving
          data risk, back up your files first. When in doubt, consult a certified technician.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

function AlertBanner({ icon, color, title, message }) {
  return (
    <View style={[styles.alertBanner, { borderColor: color + '50', backgroundColor: color + '12' }]}>
      <View style={[styles.alertIconCircle, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertTitle, { color }]}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 56 },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  navBack: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { ...typography.h3 },

  summaryCard: {
    backgroundColor: colors.navyCard, borderRadius: 16,
    borderWidth: 1, borderColor: colors.electric + '40',
    padding: 18, marginBottom: 16,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  summaryIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryLabel: { ...typography.label, color: colors.electric, marginBottom: 2 },
  summaryTitle: { ...typography.h4 },
  summaryText: {
    ...typography.body, color: colors.textSecondary,
    lineHeight: 22, marginBottom: 10,
  },
  deviceAssessmentRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginBottom: 10,
  },
  deviceAssessmentText: { flex: 1, fontSize: 13, color: colors.info, lineHeight: 18 },
  jobIdRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderTopWidth: 1, borderTopColor: colors.navyBorder, paddingTop: 10, marginTop: 4,
  },
  jobIdLabel: { ...typography.caption, color: colors.textMuted },
  jobIdValue: { ...typography.mono },

  alertBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10,
  },
  alertIconCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  alertMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  section: { marginTop: 6, marginBottom: 8 },
  sectionTitle: { ...typography.h3, marginBottom: 4 },
  sectionSub: { ...typography.bodySmall, marginBottom: 16 },

  techCTACard: {
    backgroundColor: colors.navyCard, borderRadius: 16,
    borderWidth: 1, borderColor: colors.navyBorder,
    padding: 18, marginBottom: 14,
    gap: 14,
  },
  techCTALeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  techCTATitle: { ...typography.h4, marginBottom: 2 },
  techCTASub: { ...typography.bodySmall },
  techCTABtn: { borderRadius: 12, overflow: 'hidden' },
  techCTABtnGradient: {
    paddingVertical: 13, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  techCTABtnText: { ...typography.button },

  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.navyCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.navyBorder, paddingVertical: 13,
  },
  actionBtnPrimary: { borderColor: colors.electric + '50', backgroundColor: colors.electricGlow },
  actionBtnText: { ...typography.button, color: colors.textSecondary },

  disclaimer: { ...typography.caption, textAlign: 'center', lineHeight: 18, marginBottom: 30 },

  // Error state
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  errorTitle: { ...typography.h2 },
  errorSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  backBtn: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: colors.electric, borderRadius: 12,
  },
  backBtnText: { ...typography.button },
});
