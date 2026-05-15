import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { diagnoseAPI } from '../services/api';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';
import LoadingDiagnosis from '../components/LoadingDiagnosis';

const DEVICE_TYPES = [
  { value: 'laptop', label: 'Laptop', icon: 'laptop-outline' },
  { value: 'desktop', label: 'Desktop', icon: 'desktop-outline' },
];

const COMMON_SYMPTOMS = [
  "Won't turn on",
  'Overheating',
  'Random shutdowns',
  'Slow performance',
  'Blue screen (BSOD)',
  'No display',
  'Strange noises',
  'Won\'t boot',
  'Keyboard issues',
  'Battery draining fast',
];

export default function DiagnoseScreen({ navigation }) {
  const [description, setDescription] = useState('');
  const [deviceType, setDeviceType] = useState('laptop');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [imageAsset, setImageAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [descError, setDescError] = useState('');

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const pickImage = async (fromCamera) => {
    try {
      let result;
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Photo library access is needed.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets?.length > 0) {
        setImageAsset(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not access image picker: ' + err.message);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: () => pickImage(true) },
      { text: 'Photo Library', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDiagnose = async () => {
    if (!description.trim() || description.trim().length < 10) {
      setDescError('Please describe the problem (at least 10 characters)');
      return;
    }
    setDescError('');
    setLoading(true);

    try {
      const response = await diagnoseAPI.submit({
        description: description.trim(),
        imageAsset,
        deviceType,
        deviceBrand: deviceBrand.trim() || 'Unknown',
        symptoms: selectedSymptoms,
      });

      navigation.navigate('Result', {
        diagnosis: response.data.diagnosis,
        jobId: response.data.jobId,
        description: description.trim(),
      });
    } catch (err) {
      Alert.alert(
        'Diagnosis Failed',
        err.message || 'Could not complete diagnosis. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingDiagnosis fullScreen />;
  }

  return (
    <LinearGradient colors={gradients.navyHero} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>New Diagnosis</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Device type selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Device Type</Text>
            <View style={styles.deviceRow}>
              {DEVICE_TYPES.map((dt) => (
                <TouchableOpacity
                  key={dt.value}
                  style={[styles.deviceBtn, deviceType === dt.value && styles.deviceBtnActive]}
                  onPress={() => setDeviceType(dt.value)}
                >
                  <Ionicons
                    name={dt.icon}
                    size={22}
                    color={deviceType === dt.value ? colors.electric : colors.textMuted}
                  />
                  <Text style={[styles.deviceLabel, deviceType === dt.value && styles.deviceLabelActive]}>
                    {dt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Brand */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Brand (optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Dell, HP, Apple, Lenovo"
                placeholderTextColor={colors.placeholder}
                value={deviceBrand}
                onChangeText={setDeviceBrand}
              />
            </View>
          </View>

          {/* Common symptoms */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Common Symptoms (select all that apply)</Text>
            <View style={styles.symptomsGrid}>
              {COMMON_SYMPTOMS.map((s) => {
                const active = selectedSymptoms.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.symptomChip, active && styles.symptomChipActive]}
                    onPress={() => toggleSymptom(s)}
                  >
                    {active && <Ionicons name="checkmark" size={12} color={colors.electric} />}
                    <Text style={[styles.symptomText, active && styles.symptomTextActive]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Describe the Problem *</Text>
            <View style={[styles.textAreaWrapper, descError ? styles.inputError : null]}>
              <TextInput
                style={styles.textArea}
                placeholder="Be specific — when did it start? What have you already tried? Any error messages?"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={(t) => { setDescription(t); if (descError) setDescError(''); }}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            {!!descError && <Text style={styles.errorText}>{descError}</Text>}
            <Text style={styles.charCount}>{description.length} characters</Text>
          </View>

          {/* Photo upload */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photo (optional but recommended)</Text>
            {imageAsset ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: imageAsset.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setImageAsset(null)}
                >
                  <Ionicons name="close-circle" size={26} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={showImageOptions}>
                <Ionicons name="camera-outline" size={28} color={colors.electric} />
                <Text style={styles.uploadTitle}>Add a Photo</Text>
                <Text style={styles.uploadSub}>Camera or photo library · Max 10MB</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.diagnoseBtn}
            onPress={handleDiagnose}
            activeOpacity={0.85}
          >
            <LinearGradient colors={gradients.electricButton} style={styles.diagnoseBtnGradient}>
              <Ionicons name="scan" size={22} color={colors.white} />
              <Text style={styles.diagnoseBtnText}>Run AI Diagnosis</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Powered by OpenAI Vision · Results are AI-generated suggestions, not professional guarantees.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 56 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.navyCard, borderWidth: 1, borderColor: colors.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: { ...typography.h3 },

  section: { marginBottom: 24 },
  sectionLabel: { ...typography.label, marginBottom: 10 },

  deviceRow: { flexDirection: 'row', gap: 12 },
  deviceBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.navyCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.navyBorder,
    padding: 14, justifyContent: 'center',
  },
  deviceBtnActive: { borderColor: colors.electric, backgroundColor: colors.electricGlow },
  deviceLabel: { ...typography.body, color: colors.textMuted },
  deviceLabelActive: { color: colors.electric, fontWeight: '600' },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.navyCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.navyBorder,
    paddingHorizontal: 14, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  inputError: { borderColor: colors.error },

  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: colors.navyCard, borderColor: colors.navyBorder,
  },
  symptomChipActive: { backgroundColor: colors.electricGlow, borderColor: colors.electric },
  symptomText: { fontSize: 13, color: colors.textSecondary },
  symptomTextActive: { color: colors.electric, fontWeight: '500' },

  textAreaWrapper: {
    backgroundColor: colors.navyCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.navyBorder, padding: 14,
  },
  textArea: {
    ...typography.body, color: colors.textPrimary,
    minHeight: 120, lineHeight: 22,
  },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4 },
  charCount: { ...typography.caption, marginTop: 6, textAlign: 'right' },

  uploadBtn: {
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.navyCard, borderRadius: 14,
    borderWidth: 2, borderColor: colors.navyBorder,
    borderStyle: 'dashed', paddingVertical: 30,
  },
  uploadTitle: { ...typography.h4, color: colors.electric },
  uploadSub: { ...typography.caption },

  imagePreviewWrapper: { position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 14, resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: -10, right: -10 },

  diagnoseBtn: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    shadowColor: colors.electric,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  diagnoseBtnGradient: {
    height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  diagnoseBtnText: { ...typography.buttonLarge },

  disclaimer: { ...typography.caption, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
});
