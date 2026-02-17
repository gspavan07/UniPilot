import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  UserCircle,
  Mail,
  Phone,
  BookOpen,
  Award,
  UploadCloud,
  Save,
  ChevronRight,
  Menu,
  Bell,
  FileText,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import theme from '../../theme/theme';
import { placementService } from '../../services/placementService';
import { useDrawer } from '../../context/DrawerContext';
import ResumeManager from './components/ResumeManager';

const PlacementProfileScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { toggleDrawer } = useDrawer();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    skills: '',
    resume_url: '',
    experience: '',
    github_link: '',
    linkedin_link: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await placementService.getPlacementProfile();
      if (response.success) {
        setProfile(response.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch placement profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await placementService.updatePlacementProfile(profile);
      if (response.success) {
        Alert.alert('Success', 'Placement profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, '#2563eb']}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Placement')}
            style={styles.menuButton}
          >
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Career Settings</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={26} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.tagline}>Polish your professional presence.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            <Surface style={styles.formCard}>
              <View style={styles.sectionHeader}>
                <UserCircle size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>
              <View style={styles.readOnlyInfo}>
                <Text style={styles.infoLabel}>NAME</Text>
                <Text style={styles.infoValue}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.infoLabel}>STUDENT ID</Text>
                <Text style={styles.infoValue}>{user?.student_id}</Text>
              </View>
            </Surface>

            <Surface style={styles.formCard}>
              <View style={styles.sectionHeader}>
                <Award size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Skills & Expertise</Text>
              </View>
              <TextInput
                multiline
                placeholder="e.g. React Native, Node.js, AWS, UI/UX Design..."
                placeholderTextColor="#94a3b8"
                style={styles.textArea}
                value={profile.skills}
                onChangeText={val =>
                  setProfile(prev => ({ ...prev, skills: val }))
                }
              />
            </Surface>

            <ResumeManager
              currentResumeUrl={profile.resume_url}
              onUploadSuccess={url =>
                setProfile(prev => ({ ...prev, resume_url: url }))
              }
            />

            <Surface style={styles.formCard}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Social Presence</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>LinkedIn URL</Text>
                <TextInput
                  style={styles.input}
                  value={profile.linkedin_link}
                  onChangeText={val =>
                    setProfile(prev => ({ ...prev, linkedin_link: val }))
                  }
                  placeholder="linkedin.com/in/username"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>GitHub URL</Text>
                <TextInput
                  style={styles.input}
                  value={profile.github_link}
                  onChangeText={val =>
                    setProfile(prev => ({ ...prev, github_link: val }))
                  }
                  placeholder="github.com/username"
                />
              </View>
            </Surface>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#2563eb']}
                style={styles.saveBtnGradient}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Save size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>SAVE PROFILE</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingBottom: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 20,
  },
  menuButton: {
    padding: 5,
  },
  notificationButton: {
    padding: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  readOnlyInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 15,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 12,
    opacity: 0.3,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  saveBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 10,
    letterSpacing: 1.5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
});

export default PlacementProfileScreen;
