import React, { useState, useEffect, useCallback } from 'react';
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
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Text, Surface, Button } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Upload,
  MapPin,
  Layers,
  Globe,
  X,
  ExternalLink,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import { placementService } from '../../services/placementService';
import ResumeManager from './components/ResumeManager';

const { width } = Dimensions.get('window');

const ApplyDriveScreen = ({ route, navigation }) => {
  const { driveId } = route.params;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [formData, setFormData] = useState({});
  const [systemFields, setSystemFields] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  // console.log(drive);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [driveRes, sysRes] = await Promise.all([
        placementService.getDriveDetails(driveId),
        placementService.getSystemFields(),
      ]);

      if (driveRes.success) {
        setDrive(driveRes.data);
        const sysData = sysRes?.success ? sysRes.data : null;
        setSystemFields(sysData);
        // Initialize form data with pre-filled system fields
        if (driveRes.data?.registration_form_fields) {
          const initialData = {};
          driveRes.data.registration_form_fields.forEach(field => {
            if (field.type === 'system' && sysData) {
              const mapping = {
                email: sysData.email,
                mobile: sysData.mobile,
                cgpa: sysData.cgpa,
                ten_percent: sysData.ten_percent,
                inter_percent: sysData.inter_percent,
                resume: sysData.resume,
              };
              initialData[field.id] = mapping[field.systemField] || '';
            } else {
              initialData[field.id] = '';
            }
          });
          setFormData(initialData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch drive details:', error);
      Alert.alert('Error', 'Failed to load drive details.');
    } finally {
      setLoading(false);
    }
  }, [driveId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStepValid = () => {
    if (step === 1) return true;
    if (step === 2) {
      // Validate required fields in Step 2
      const requiredFields =
        drive?.registration_form_fields?.filter(f => f.required) || [];
      return requiredFields.every(
        f => formData[f.id] && formData[f.id].toString().trim() !== '',
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isStepValid()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await placementService.applyToDrive(driveId, formData);
      if (response.success) {
        setStep(4); // Success step
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to submit application.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.indicatorContainer}>
      {[1, 2, 3].map(s => (
        <React.Fragment key={s}>
          <View
            style={[
              styles.stepDot,
              step >= s && styles.stepDotActive,
              step === s && styles.stepDotCurrent,
            ]}
          >
            {step > s ? (
              <ShieldCheck size={14} color="#fff" />
            ) : (
              <Text
                style={[
                  styles.stepDotText,
                  step >= s && styles.stepDotTextActive,
                ]}
              >
                {s}
              </Text>
            )}
          </View>
          {s < 3 && (
            <View
              style={[styles.stepLine, step > s && styles.stepLineActive]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStepTitle = () => {
    switch (step) {
      case 1:
        return 'Job Snapshot';
      case 2:
        return 'Registration Form';
      case 3:
        return 'Final Review';
      default:
        return 'Success!';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#2563eb']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Placement')}
              style={styles.backButton}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{renderStepTitle()}</Text>
              {step < 4 && (
                <Text style={styles.headerSub}>Step {step} of 3</Text>
              )}
            </View>
            <View style={{ width: 44 }} />
          </View>
          {step < 4 && renderStepIndicator()}
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Surface style={styles.snapshotCard}>
                <View style={styles.companyInfo}>
                  <View style={styles.logoBox}>
                    {drive?.job_posting?.company?.logo_url ? (
                      <Image
                        source={{ uri: drive.job_posting.company.logo_url }}
                        style={styles.logo}
                      />
                    ) : (
                      <Building2 size={24} color={theme.colors.primary} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.driveName}>{drive?.drive_name}</Text>
                    <Text style={styles.companyName}>
                      {drive?.job_posting?.company?.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Briefcase size={16} color="#64748b" />
                    <Text style={styles.specValue}>
                      {drive?.job_posting?.designation || 'Software Engineer'}
                    </Text>
                  </View>
                  <View style={styles.specItem}>
                    <Layers size={16} color="#64748b" />
                    <Text style={styles.specValue}>{drive?.mode}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Rocket size={16} color="#fbbf24" />
                    <Text style={styles.specValue}>
                      ₹{drive?.job_posting?.ctc_lpa} LPA
                    </Text>
                  </View>
                  <View style={styles.specItem}>
                    <MapPin size={16} color="#64748b" />
                    <Text style={styles.specValue}>
                      {drive?.job_posting?.location || 'Remote'}
                    </Text>
                  </View>
                </View>
              </Surface>

              <Surface style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.sectionContent}>
                  {drive?.job_posting?.description ||
                    'Review the job description and requirements before proceeding with your application.'}
                </Text>
              </Surface>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.formInstructions}>
                Please fill in the additional details required by{' '}
                {drive?.job_posting?.company?.name}.
              </Text>

              {drive?.registration_form_fields?.map(field => (
                <View key={field.id} style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {field.label}{' '}
                    {field.required && (
                      <Text style={{ color: '#ef4444' }}>*</Text>
                    )}
                  </Text>
                  {field.type === 'system' && field.systemField === 'resume' ? (
                    <ResumeManager
                      currentResumeUrl={formData[field.id]}
                      onUploadSuccess={url => handleFieldChange(field.id, url)}
                      style={{ marginTop: 10 }}
                    />
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter ${field.label}`}
                        placeholderTextColor="#94a3b8"
                        value={formData[field.id]}
                        onChangeText={val => handleFieldChange(field.id, val)}
                        keyboardType={
                          field.type === 'number' ? 'numeric' : 'default'
                        }
                        editable={
                          !(field.type === 'system' && formData[field.id])
                        }
                      />
                      {field.type === 'system' && formData[field.id] && (
                        <Text style={styles.fieldHint}>
                          <ShieldCheck size={10} color={theme.colors.primary} />{' '}
                          Pre-filled from your profile
                        </Text>
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Surface style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>Confirm Information</Text>
                <View style={styles.reviewList}>
                  {Object.entries(formData).map(([key, value]) => (
                    <View key={key} style={styles.reviewItem}>
                      <Text style={styles.reviewLabel}>
                        {drive?.registration_form_fields?.find(
                          f => String(f.id) === String(key),
                        )?.label || key.replace(/_/g, ' ')}
                      </Text>
                      <Text style={styles.reviewValue}>
                        {value || 'Not provided'}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.consentBox}>
                  <ShieldCheck size={20} color={theme.colors.primary} />
                  <Text style={styles.consentText}>
                    By submitting, I confirm that all provided details are
                    authentic and I meet the drive constraints.
                  </Text>
                </View>
              </Surface>
            </View>
          )}

          {step === 4 && (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Rocket size={48} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Application Secured!</Text>
              <Text style={styles.successSub}>
                Your credentials have been successfully transmitted to the
                recruitment server. You can track your status in the History
                tab.
              </Text>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => navigation.navigate('Placement')}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.doneBtnGradient}
                >
                  <Text style={styles.doneBtnText}>CONTINUE TO PORTAL</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {drive?.external_registration_url && step === 1 && (
            <Surface style={styles.externalCard}>
              <View style={styles.externalHeader}>
                <Globe size={24} color={theme.colors.primary} />
                <Text style={styles.externalTitle}>External Application</Text>
              </View>
              <Text style={styles.externalText}>
                This recruitment drive requires registration on the company's
                official portal or a third-party platform.
              </Text>
              <TouchableOpacity
                style={styles.externalBtn}
                onPress={() => {
                  if (drive?.external_registration_url) {
                    Linking.openURL(drive.external_registration_url).catch(
                      err => Alert.alert('Error', 'Failed to open the link.'),
                    );
                  }
                }}
              >
                <LinearGradient
                  colors={[theme.colors.primary, '#2563eb']}
                  style={styles.externalBtnGradient}
                >
                  <Text style={styles.externalBtnText}>APPLY EXTERNALLY</Text>
                  <ExternalLink size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.externalNote}>
                Note: Applications on external portals may not be automatically
                tracked in the portal until updated by the coordinator.
              </Text>
            </Surface>
          )}
        </ScrollView>
      </View>

      {step < 4 && (
        <View style={[styles.footer, { bottom: tabBarHeight }]}>
          <TouchableOpacity
            style={[styles.backBtn, step === 1 && { opacity: 0 }]}
            disabled={step === 1}
            onPress={() => setStep(prev => prev - 1)}
          >
            <ChevronLeft size={20} color="#64748b" />
            <Text style={styles.backBtnText}>PREVIOUS</Text>
          </TouchableOpacity>

          {step < 3 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !isStepValid() && styles.disabledBtn]}
              onPress={() => isStepValid() && setStep(prev => prev + 1)}
              disabled={!isStepValid()}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#2563eb']}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>NEXT STEP</Text>
                <ChevronRight size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.nextBtnGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.nextBtnText}>SUBMIT APPLICATION</Text>
                    <Rocket size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 10,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#fff',
  },
  stepDotCurrent: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
  },
  stepDotTextActive: {
    color: '#2563eb',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 180,
  },
  stepContainer: {
    flex: 1,
  },
  snapshotCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  driveName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 20,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    fontWeight: '500',
  },
  formInstructions: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 8,
    paddingLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  reviewList: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 15,
    marginBottom: 24,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  consentBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '08',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '15',
    alignItems: 'flex-start',
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: 10,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
    marginLeft: 8,
    letterSpacing: 1,
  },
  nextBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    marginRight: 10,
    letterSpacing: 1,
  },
  submitBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successIconBox: {
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
    marginBottom: 10,
  },
  successSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 40,
  },
  doneBtn: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
  },
  doneBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  fieldHint: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 4,
    paddingLeft: 4,
  },
  externalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  externalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  externalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginLeft: 10,
    letterSpacing: -0.5,
  },
  externalText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 20,
  },
  externalBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 20,
  },
  externalBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  externalBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    marginRight: 10,
    letterSpacing: 1,
  },
  externalNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
});

export default ApplyDriveScreen;
