import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { jobsAPI } from '../services/api';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import DiagnosisCard from '../components/DiagnosisCard';

const STATUS_META = {
  pending:     { color: colors.warning,  icon: 'time-outline',         label: 'Pending' },
  in_progress: { color: colors.info,     icon: 'sync-outline',         label: 'In Progress' },
  completed:   { color: colors.success,  icon: 'checkmark-circle',     label: 'Completed' },
  cancelled:   { color: colors.error,    icon: 'close-circle-outline', label: 'Cancelled' },
};

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params || {};

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const res = await jobsAPI.get(jobId);
      setJob(res.data.job);
    } catch (err) {
      setError(err.message || 'Could not load job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={gradients.navyHero} style={styles.center}>
        <ActivityIndicator color={colors.electric} size="large" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </LinearGradient>
    );
  }

  if (error || !job) {
    return (
      <LinearGradient colors={gradients.navyHero} style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>{error || 'Job not found'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const meta = STATUS_META[job.status] || STATUS_META.pending;
  const diagnosis = job.diagnosis;
  const dateStr = new Date(job.created_at).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Job Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Job info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>JOB ID</Text>
            <Text style={styles.infoMono}>{job.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <View style={[styles.statusBadge, { backgroundColor: meta.color + '20', borderColor: meta.color + '50' }]}>
              <Ionicons name={meta.icon} size={12} color={meta.color} />
              <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{dateStr}</Text>
          </View>
          {job.device_type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DEVICE</Text>
              <Text style={styles.infoValue}>
                {[job.device_brand, job.device_type].filter(Boolean).join(' ') || 'Unknown'}
              </Text>
            </View>
          )}
        </View>

        {/* Problem description */}
        <View style={styles.descCard}>
          <View style={styles.descHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.electric} />
            <Text style={styles.descTitle}>Problem Description</Text>
          </View>
          <Text style={styles.descText}>{job.description}</Text>
        </View>

        {/* Image (if any) */}
        {job.image_url && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Submitted Photo</Text>
            <Image
              source={{ uri: `http://localhost:3000${job.image_url}` }}
              style={styles.jobImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Diagnosis results */}
        {diagnosis ? (
          <View style={styles.diagnosisSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics-outline" size={18} color={colors.electric} />
              <Text style={styles.sectionTitle}>AI Diagnosis</Text>
            </View>

            {diagnosis.summary && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>{diagnosis.summary}</Text>
              </View>
            )}

            {diagnosis.urgent && (
              <View style={[styles.alertBox, { borderColor: colors.error + '50', backgroundColor: colors.error + '12' }]}>
                <Ionicons name="warning" size={16} color={colors.error} />
                <Text style={[styles.alertText, { color: colors.error }]}>
                  Urgent: {diagnosis.urgent_reason || 'Immediate attention required'}
                </Text>
              </View>
            )}

            {diagnosis.data_loss_risk && (
              <View style={[styles.alertBox, { borderColor: colors.warning + '50', backgroundColor: colors.warning + '12' }]}>
                <Ionicons name="save-outline" size={16} color={colors.warning} />
                <Text style={[styles.alertText, { color: colors.warning }]}>
                  Data Loss Risk: {diagnosis.data_loss_reason || 'Back up your files immediately'}
                </Text>
              </View>
            )}

            <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>Top Causes</Text>
            {diagnosis.top_causes?.map((cause, i) => (
              <DiagnosisCard key={i} cause={cause} rank={cause.rank || i + 1} defaultOpen={i === 0} />
            ))}
          </View>
        ) : (
          <View style={styles.noDiagnosisCard}>
            <Ionicons name="time-outline" size={32} color={colors.textMuted} />
            <Text style={styles.noDiagnosisText}>Diagnosis pending</Text>
            <Text style={styles.noDiagnosisSub}>This job hasn't been diagnosed yet.</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {diagnosis && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Tech', { jobId: job.id })}
            >
              <LinearGradient colors={gradients.electricButton} style={styles.actionBtnGrad}>
                <Ionicons name="headset" size={18} color={colors.white} />
                <Text style={styles.actionBtnText}>Talk to a Tech</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => navigation.navigate('Diagnose')}
          >
            <View style={styles.actionBtnOutlineInner}>
              <Ionicons name="add-circle-outline" size={18} color={colors.electric} />
              <Text style={[styles.actionBtnText, { color: colors.electric }]}>New Diagnosis</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: 12 },
  errorTitle: { ...typography.h4, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: colors.electric, borderRadius: 12,
  },
  retryText: { ...typography.button },

  scroll: { padding: 20, paddingTop: 56 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { ...typography.h3 },

  infoCard: {
    backgroundColor: colors.navyCard, borderRadius: 14,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 16, marginBottom: 14, gap: 12,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { ...typography.label },
  infoValue: { ...typography.body, color: colors.textSecondary },
  infoMono: { ...typography.mono },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: '600' },

  descCard: {
    backgroundColor: colors.navyCard, borderRadius: 14,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 16, marginBottom: 14,
  },
  descHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  descTitle: { ...typography.h4 },
  descText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },

  imageSection: { marginBottom: 20 },
  sectionLabel: { ...typography.label, marginBottom: 10 },
  jobImage: { width: '100%', height: 200, borderRadius: 14 },

  diagnosisSection: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { ...typography.h3 },

  summaryBox: {
    backgroundColor: colors.navyCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 14, marginBottom: 12,
  },
  summaryText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },

  alertBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 10,
  },
  alertText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },

  noDiagnosisCard: {
    alignItems: 'center', padding: 32, gap: 10,
    backgroundColor: colors.navyCard, borderRadius: 14,
    borderWidth: 1, borderColor: colors.navyBorder, marginBottom: 16,
  },
  noDiagnosisText: { ...typography.h4, color: colors.textSecondary },
  noDiagnosisSub: { ...typography.bodySmall },

  actionsRow: { gap: 12, marginBottom: 30 },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionBtnGrad: {
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  actionBtnText: { ...typography.button },
  actionBtnOutline: {
    backgroundColor: colors.electricGlow, borderWidth: 1, borderColor: colors.electric,
  },
  actionBtnOutlineInner: {
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
});
