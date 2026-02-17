import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import {
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import { pick, isCancel, types } from '@react-native-documents/picker';
import theme from '../../../theme/theme';
import { placementService } from '../../../services/placementService';
import { BASE_URL } from '../../../services/api';

const ResumeManager = ({ onUploadSuccess, currentResumeUrl, style }) => {
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = async () => {
    try {
      const res = await pick({
        type: [types.pdf],
      });

      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('resume', {
        uri: res[0].uri,
        name: res[0].name || 'resume.pdf',
        type: res[0].type || 'application/pdf',
      });

      const response = await placementService.uploadResume(uploadFormData);
      if (response.success) {
        if (onUploadSuccess) {
          onUploadSuccess(response.data.resume_url);
        }
        Alert.alert('Success', 'Resume updated successfully!');
      } else {
        Alert.alert('Error', response.message || 'Upload failed.');
      }
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Upload Error:', err);
        Alert.alert('Error', 'Failed to pick or upload document.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = url => {
    if (!url) return '';
    const finalUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const separator = finalUrl.includes('?') ? '&' : '?';
    return `${finalUrl}${separator}t=${new Date().getTime()}`;
  };

  const fileName = currentResumeUrl
    ? currentResumeUrl.split('/').pop()
    : 'No file selected';

  return (
    <Surface style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Master Resume</Text>
          {currentResumeUrl && (
            <View style={styles.activeBadge}>
              <CheckCircle2 size={10} color={theme.colors.primary} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          This document is shared with recruiters. Keep it polished.
        </Text>
      </View>

      {currentResumeUrl ? (
        <View style={styles.fileCard}>
          <View style={styles.fileInfo}>
            <View style={styles.fileIconBox}>
              <FileText size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {fileName}
              </Text>
              <Text style={styles.fileMeta}>PDF • Ready for review</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => {
                const url = getFullUrl(currentResumeUrl);
                console.log('Opening URL:', url);
                Linking.openURL(url).catch(err => {
                  console.error('Linking Error:', err);
                  Alert.alert('Error', 'Cannot open link');
                });
              }}
            >
              <ExternalLink size={16} color="#64748b" />
              <Text style={styles.viewBtnText}>VIEW</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateBtn}
              onPress={handleResumeUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Upload size={16} color="#fff" />
                  <Text style={styles.updateBtnText}>UPDATE</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadPlaceholder}
          onPress={handleResumeUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              <View style={styles.uploadIconBox}>
                <Upload size={32} color="#94a3b8" />
              </View>
              <Text style={styles.uploadTitle}>Upload Master Resume</Text>
              <Text style={styles.uploadSub}>Select a PDF file (Max 10MB)</Text>
              <View style={styles.selectBtn}>
                <Text style={styles.selectBtnText}>SELECT PDF FILE</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.tipBox}>
        <View style={styles.tipIcon}>
          <Info size={12} color="#94a3b8" />
        </View>
        <Text style={styles.tipText}>
          Tip: Use a professional name like{' '}
          <Text style={styles.mono}>name_resume.pdf</Text>
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 18,
  },
  fileCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  fileMeta: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  updateBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  updateBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
  },
  uploadIconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 1,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 20,
  },
  selectBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
  },
  selectBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    gap: 10,
  },
  tipIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tipText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#334155',
  },
});

export default ResumeManager;
