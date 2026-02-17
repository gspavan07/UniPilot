import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  Building2,
  Calendar,
  Globe,
  MapPin,
  X,
  ChevronRight,
  Briefcase,
  Layers,
  FileText,
  BadgeCheck,
  Clock,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import { placementService } from '../../services/placementService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DriveDetailScreen = ({ route, navigation }) => {
  const { driveId } = route.params;
  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [applying, setApplying] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await placementService.getDriveDetails(driveId);
      if (response.success) {
        setDrive(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch drive details:', error);
    } finally {
      setLoading(false);
    }
  }, [driveId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleApply = () => {
    navigation.navigate('ApplyDrive', { driveId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderSection = (title, icon, content) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Surface style={styles.sectionCard}>
        <Text style={styles.sectionContent}>{content}</Text>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[theme.colors.primary, '#1e293b']}
            style={styles.heroGradient}
          >
            <SafeAreaView edges={['top']} style={{ paddingHorizontal: 20 }}>
              <View style={styles.topBar}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Placement')}
                  style={styles.backButton}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.jobType}>
                  {drive?.job_posting?.tier || 'Regular'}
                </Text>
              </View>

              <View style={styles.companyHeader}>
                <View style={styles.logoContainer}>
                  {drive?.job_posting?.company?.logo_url ? (
                    <Image
                      source={{ uri: drive.job_posting.company.logo_url }}
                      style={styles.logo}
                    />
                  ) : (
                    <Building2 size={32} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={styles.driveTitle}>{drive?.drive_name}</Text>
                <Text style={styles.companyName}>
                  {drive?.job_posting?.company?.name}
                </Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PACKAGE</Text>
              <Text style={styles.statValue}>
                ₹{drive?.job_posting?.ctc_lpa} LPA
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MODE</Text>
              <Text style={styles.statValue}>{drive?.mode}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>REG. ENDS</Text>
              <Text style={styles.statValue}>
                {new Date(drive?.registration_end).toLocaleDateString(
                  undefined,
                  { month: 'short', day: 'numeric' },
                )}
              </Text>
            </View>
          </View>

          {renderSection(
            'Job Description',
            <Briefcase size={18} color={theme.colors.primary} />,
            drive?.job_posting?.description || 'No description provided.',
          )}

          {renderSection(
            'Eligibility Criteria',
            <BadgeCheck size={18} color={theme.colors.primary} />,
            drive?.job_posting?.eligibility_criteria ||
              'Detailed criteria pending',
          )}

          {renderSection(
            'Selection Process',
            <Layers size={18} color={theme.colors.primary} />,
            '1. Online Assessment\n2. Technical Interview Round 1\n3. Technical Interview Round 2\n4. HR Interview',
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Floating Apply Bar */}
      <View style={[styles.applyBar, { bottom: tabBarHeight }]}>
        <View style={styles.deadlineInfo}>
          {/* <Clock size={16} color="#ef4444" />
          <Text style={styles.deadlineDays}>Apply soon</Text> */}
        </View>
        <TouchableOpacity
          style={[
            styles.applyBtn,
            (drive?.hasApplied || !drive?.isEligible || applying) &&
              styles.disabledBtn,
          ]}
          disabled={drive?.hasApplied || !drive?.isEligible || applying}
          onPress={handleApply}
        >
          <LinearGradient
            colors={[theme.colors.primary, '#2563eb']}
            style={styles.applyBtnGradient}
          >
            <Text style={styles.applyBtnText}>
              {applying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : drive?.hasApplied ? (
                'APPLIED'
              ) : drive?.external_registration_url ? (
                'APPLY EXTERNALLY'
              ) : drive?.isEligible ? (
                'APPLY NOW'
              ) : (
                'INELIGIBLE'
              )}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    height: 320,
    backgroundColor: theme.colors.primary,
  },
  heroGradient: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobType: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    letterSpacing: 1,
  },
  companyHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 24,
  },
  driveTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingVertical: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    marginBottom: 4,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  sectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    fontWeight: '500',
  },
  applyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineDays: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ef4444',
  },
  applyBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  applyBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    paddingVertical: 16,

    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DriveDetailScreen;
