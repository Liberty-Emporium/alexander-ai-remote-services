import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';

const STATUS_META = {
  pending:     { color: colors.warning,  icon: 'time-outline',         label: 'Pending' },
  in_progress: { color: colors.info,     icon: 'sync-outline',         label: 'In Progress' },
  completed:   { color: colors.success,  icon: 'checkmark-circle',     label: 'Completed' },
  cancelled:   { color: colors.error,    icon: 'close-circle-outline', label: 'Cancelled' },
};

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      const res = await jobsAPI.list();
      setJobs(res.data.jobs || []);
    } catch (err) {
      // Silently fail for now — jobs may be empty on first login
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const recentJobs = jobs.slice(0, 5);
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.electric} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>What needs fixing today?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => logout()}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.electric} />
          </TouchableOpacity>
        </View>

        {/* Hero CTA */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => navigation.navigate('Diagnose')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#0E2A5A', '#0A1628']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Glow dot */}
            <View style={styles.heroDot} />

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroLabel}>AI DIAGNOSIS</Text>
              <Text style={styles.heroTitle}>Start Diagnosis</Text>
              <Text style={styles.heroSubtitle}>
                Describe your problem or upload a photo. Get instant AI-powered repair guidance.
              </Text>
            </View>

            <View style={styles.heroCTA}>
              <LinearGradient colors={gradients.electricButton} style={styles.heroBtn}>
                <Ionicons name="scan" size={20} color={colors.white} />
                <Text style={styles.heroBtnText}>Diagnose Now</Text>
              </LinearGradient>
            </View>

            {/* Decorative icon */}
            <View style={styles.heroIconBg}>
              <Ionicons name="hardware-chip-outline" size={80} color={colors.electric + '18'} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <QuickAction
            icon="people-outline"
            label="Tech Support"
            sub="Talk to a real tech"
            color={colors.success}
            onPress={() => navigation.navigate('Tech')}
          />
          <QuickAction
            icon="time-outline"
            label="History"
            sub="Past diagnoses"
            color={colors.info}
            onPress={() => navigation.navigate('JobHistory')}
          />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Total Diagnoses" value={jobs.length} icon="analytics-outline" />
          <StatCard
            label="Completed"
            value={jobs.filter((j) => j.status === 'completed').length}
            icon="checkmark-done-outline"
            color={colors.success}
          />
        </View>

        {/* Recent jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Diagnoses</Text>
            {jobs.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('JobHistory')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color={colors.electric} style={{ marginTop: 20 }} />
          ) : recentJobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No diagnoses yet</Text>
              <Text style={styles.emptyText}>
                Tap "Diagnose Now" above to get started with your first AI diagnosis.
              </Text>
            </View>
          ) : (
            recentJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function QuickAction({ icon, label, sub, color, onPress }) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.quickIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, icon, color = colors.electric }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function JobRow({ job, onPress }) {
  const meta = STATUS_META[job.status] || STATUS_META.pending;
  const desc = job.description?.slice(0, 60) + (job.description?.length > 60 ? '…' : '');
  const date = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity style={styles.jobRow} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.jobStatusDot, { backgroundColor: meta.color }]} />
      <View style={styles.jobContent}>
        <Text style={styles.jobDesc}>{desc}</Text>
        <View style={styles.jobMeta}>
          <Ionicons name={meta.icon} size={12} color={meta.color} />
          <Text style={[styles.jobStatus, { color: meta.color }]}>{meta.label}</Text>
          <Text style={styles.jobDate}>{date}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: { ...typography.h2 },
  subGreeting: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  profileBtn: { padding: 4 },

  // Hero card
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.electric + '40',
    shadowColor: colors.electric,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroGradient: { padding: 22, overflow: 'hidden' },
  heroDot: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.electric + '10',
  },
  heroIconBg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.5,
  },
  heroTextBlock: { marginBottom: 18 },
  heroLabel: { ...typography.label, color: colors.electric, marginBottom: 6 },
  heroTitle: { ...typography.h1, marginBottom: 8 },
  heroSubtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  heroCTA: { alignSelf: 'flex-start' },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroBtnText: { ...typography.button },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 16,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: { ...typography.h4, marginBottom: 3 },
  quickSub: { ...typography.caption },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.navyCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.electric,
  },
  statLabel: { ...typography.caption, textAlign: 'center' },

  // Section
  section: { padding: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { ...typography.h3 },
  seeAll: { ...typography.body, color: colors.electric, fontWeight: '600' },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    gap: 12,
  },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },

  // Job row
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navyCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  jobStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  jobContent: { flex: 1 },
  jobDesc: { ...typography.body, marginBottom: 4 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobStatus: { fontSize: 12, fontWeight: '500' },
  jobDate: { ...typography.caption, marginLeft: 6 },
});
