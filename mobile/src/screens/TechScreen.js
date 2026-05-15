import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { techniciansAPI } from '../services/api';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';

export default function TechScreen({ route, navigation }) {
  const jobId = route.params?.jobId || null;

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const res = await techniciansAPI.list();
      setTechnicians(res.data.technicians || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load technicians: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedTech) {
      Alert.alert('Select a Technician', 'Please choose a technician before booking.');
      return;
    }

    setBooking(true);
    try {
      const res = await techniciansAPI.request({
        technician_id: selectedTech.id,
        job_id: jobId || undefined,
        notes: notes.trim() || undefined,
      });

      const session = res.data.session;

      Alert.alert(
        '🎉 Session Booked!',
        `Your session with ${session.technician.full_name} is confirmed.\n\nScheduled: ${new Date(session.scheduled_at).toLocaleString()}\n\nMeeting link will be sent to your email.`,
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('JobHistory'),
          },
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]
      );
    } catch (err) {
      Alert.alert('Booking Failed', err.message || 'Could not book session. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Book a Technician</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Ionicons name="headset" size={28} color={colors.electric} />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Remote Tech Support</Text>
            <Text style={styles.introSub}>
              Our certified technicians connect via secure screen sharing to diagnose and fix your computer remotely.
            </Text>
          </View>
        </View>

        {/* Technician list */}
        <Text style={styles.listLabel}>Available Technicians</Text>

        {loading ? (
          <ActivityIndicator color={colors.electric} style={{ marginTop: 30 }} />
        ) : technicians.length === 0 ? (
          <Text style={styles.emptyText}>No technicians available right now. Check back soon.</Text>
        ) : (
          technicians.map((tech) => (
            <TechCard
              key={tech.id}
              tech={tech}
              selected={selectedTech?.id === tech.id}
              onSelect={() => setSelectedTech(selectedTech?.id === tech.id ? null : tech)}
            />
          ))
        )}

        {/* Notes */}
        {selectedTech && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionLabel}>Notes for your technician (optional)</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your issue, or mention the job ID..."
                placeholderTextColor={colors.placeholder}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Book button */}
        <TouchableOpacity
          style={[styles.bookBtn, !selectedTech && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={!selectedTech || booking}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selectedTech ? gradients.electricButton : [colors.navyBorder, colors.navyBorder]}
            style={styles.bookBtnGradient}
          >
            {booking ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="calendar" size={20} color={colors.white} />
                <Text style={styles.bookBtnText}>
                  {selectedTech ? `Book with ${selectedTech.full_name.split(' ')[0]}` : 'Select a Technician'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            { icon: 'person-outline', step: '1', text: 'Choose a technician based on your issue type' },
            { icon: 'calendar-outline', step: '2', text: 'Book a session (available in ~30 minutes)' },
            { icon: 'laptop-outline', step: '3', text: 'Connect via secure screen sharing link' },
            { icon: 'checkmark-circle-outline', step: '4', text: 'Your tech diagnoses and fixes the problem live' },
          ].map((item) => (
            <View key={item.step} style={styles.howRow}>
              <View style={styles.howStep}>
                <Text style={styles.howStepText}>{item.step}</Text>
              </View>
              <Ionicons name={item.icon} size={18} color={colors.electric} />
              <Text style={styles.howText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function TechCard({ tech, selected, onSelect }) {
  const starCount = Math.round(tech.rating);

  return (
    <TouchableOpacity
      style={[styles.techCard, selected && styles.techCardSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {selected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
        </View>
      )}

      <View style={styles.techAvatar}>
        <Text style={styles.techAvatarText}>
          {tech.full_name.split(' ').map((n) => n[0]).join('')}
        </Text>
      </View>

      <View style={styles.techInfo}>
        <Text style={styles.techName}>{tech.full_name}</Text>

        <View style={styles.techRating}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < starCount ? 'star' : 'star-outline'}
              size={12}
              color={i < starCount ? '#FFD700' : colors.textMuted}
            />
          ))}
          <Text style={styles.techRatingText}>{tech.rating}</Text>
        </View>

        <Text style={styles.techBio} numberOfLines={2}>{tech.bio}</Text>

        <View style={styles.techMeta}>
          <View style={styles.techMetaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.techMetaText}>~{tech.response_time_min} min</Text>
          </View>
          <View style={styles.techMetaItem}>
            <Ionicons name="cash-outline" size={12} color={colors.textMuted} />
            <Text style={styles.techMetaText}>${tech.hourly_rate}/hr</Text>
          </View>
        </View>

        <View style={styles.specialties}>
          {(tech.specialties || []).slice(0, 3).map((s, i) => (
            <View key={i} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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

  introCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: colors.navyCard, borderRadius: 14,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 16, marginBottom: 24,
  },
  introTitle: { ...typography.h4, marginBottom: 4 },
  introSub: { ...typography.bodySmall, lineHeight: 18 },

  listLabel: { ...typography.label, marginBottom: 14 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 20 },

  techCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: colors.navyCard, borderRadius: 16,
    borderWidth: 1, borderColor: colors.navyBorder,
    padding: 16, marginBottom: 12, position: 'relative',
  },
  techCardSelected: { borderColor: colors.electric, backgroundColor: colors.electricGlow },
  selectedBadge: {
    position: 'absolute', top: -8, right: -8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.electric,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.navyDeep,
  },
  techAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.electric + '30',
    borderWidth: 2, borderColor: colors.electric,
    alignItems: 'center', justifyContent: 'center',
  },
  techAvatarText: { fontSize: 16, fontWeight: '700', color: colors.electric },
  techInfo: { flex: 1, gap: 5 },
  techName: { ...typography.h4 },
  techRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  techRatingText: { fontSize: 12, color: '#FFD700', fontWeight: '600', marginLeft: 4 },
  techBio: { ...typography.bodySmall, lineHeight: 17 },
  techMeta: { flexDirection: 'row', gap: 16 },
  techMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  techMetaText: { fontSize: 12, color: colors.textMuted },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specialtyTag: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.navyBorder, borderRadius: 6,
  },
  specialtyText: { fontSize: 11, color: colors.textSecondary },

  notesSection: { marginVertical: 16 },
  sectionLabel: { ...typography.label, marginBottom: 10 },
  textAreaWrapper: {
    backgroundColor: colors.navyCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 14,
  },
  textArea: {
    ...typography.body, color: colors.textPrimary, minHeight: 90, lineHeight: 22,
  },

  bookBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  bookBtnDisabled: { opacity: 0.5 },
  bookBtnGradient: {
    height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  bookBtnText: { ...typography.buttonLarge },

  howItWorks: {
    backgroundColor: colors.navyCard, borderRadius: 16,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 18, marginBottom: 30,
  },
  howTitle: { ...typography.h4, marginBottom: 16 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  howStep: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.electricGlow, borderWidth: 1, borderColor: colors.electric,
    alignItems: 'center', justifyContent: 'center',
  },
  howStepText: { fontSize: 11, fontWeight: '700', color: colors.electric },
  howText: { flex: 1, ...typography.body, color: colors.textSecondary, lineHeight: 20 },
});
