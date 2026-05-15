import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { jobsAPI } from '../services/api';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';

const STATUS_META = {
  pending:     { color: colors.warning,  icon: 'time-outline',         label: 'Pending' },
  in_progress: { color: colors.info,     icon: 'sync-outline',         label: 'In Progress' },
  completed:   { color: colors.success,  icon: 'checkmark-circle',     label: 'Completed' },
  cancelled:   { color: colors.error,    icon: 'close-circle-outline', label: 'Cancelled' },
};

const FILTER_OPTIONS = ['All', 'Pending', 'Completed', 'Cancelled'];

export default function JobHistoryScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const loadJobs = useCallback(async () => {
    try {
      const res = await jobsAPI.list();
      setJobs(res.data.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadJobs(); }, [loadJobs]));

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'All') return true;
    return j.status === filter.toLowerCase();
  });

  const renderItem = ({ item }) => {
    const meta = STATUS_META[item.status] || STATUS_META.pending;
    const desc = item.description?.slice(0, 80) + (item.description?.length > 80 ? '…' : '');
    const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const hasDiagnosis = !!item.diagnosis;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        activeOpacity={0.82}
      >
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, { backgroundColor: meta.color + '20', borderColor: meta.color + '50' }]}>
            <Ionicons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <Text style={styles.descText}>{desc}</Text>

        <View style={styles.cardBottom}>
          <View style={styles.metaRow}>
            {item.device_type && (
              <View style={styles.metaChip}>
                <Ionicons
                  name={item.device_type === 'laptop' ? 'laptop-outline' : 'desktop-outline'}
                  size={12}
                  color={colors.textMuted}
                />
                <Text style={styles.metaChipText}>
                  {item.device_brand ? `${item.device_brand} ${item.device_type}` : item.device_type}
                </Text>
              </View>
            )}
            {hasDiagnosis && (
              <View style={[styles.metaChip, styles.diagnosedChip]}>
                <Ionicons name="checkmark-circle-outline" size={12} color={colors.success} />
                <Text style={[styles.metaChipText, { color: colors.success }]}>Diagnosed</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Diagnosis History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredJobs.length} {filter === 'All' ? 'total' : filter.toLowerCase()} {filteredJobs.length === 1 ? 'job' : 'jobs'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Diagnose')}>
          <View style={styles.newBtn}>
            <Ionicons name="add" size={16} color={colors.electric} />
            <Text style={styles.newBtnText}>New</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={colors.electric} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadJobs(); }} tintColor={colors.electric} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No {filter === 'All' ? '' : filter.toLowerCase() + ' '}diagnoses</Text>
              <Text style={styles.emptySub}>
                {filter === 'All'
                  ? 'Start your first diagnosis from the home screen.'
                  : `No ${filter.toLowerCase()} diagnoses found.`}
              </Text>
              {filter === 'All' && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Diagnose')}>
                  <Text style={styles.emptyBtnText}>Start Diagnosis</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...typography.h3 },

  filterRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.navyBorder,
  },
  filterTabActive: { backgroundColor: colors.electricGlow, borderColor: colors.electric },
  filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: colors.electric, fontWeight: '600' },

  countRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  countText: { ...typography.bodySmall },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.electricGlow, borderRadius: 10, borderWidth: 1, borderColor: colors.electric,
  },
  newBtnText: { fontSize: 13, color: colors.electric, fontWeight: '600' },

  list: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    backgroundColor: colors.navyCard, borderRadius: 14,
    borderWidth: 1, borderColor: colors.navyBorder,
    padding: 16, marginBottom: 10, gap: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  dateText: { ...typography.caption },
  descText: { ...typography.body, color: colors.textSecondary, lineHeight: 21 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.navyBorder + '80', borderRadius: 6,
  },
  diagnosedChip: { backgroundColor: colors.success + '15' },
  metaChipText: { fontSize: 11, color: colors.textMuted },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptySub: { ...typography.bodySmall, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: colors.electric, borderRadius: 12,
  },
  emptyBtnText: { ...typography.button },
});
