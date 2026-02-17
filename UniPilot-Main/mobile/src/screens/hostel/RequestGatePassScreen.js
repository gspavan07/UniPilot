import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  ClipboardList,
  AlertCircle,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import {
  createGatePass,
  resetOperationStatus,
} from '../../redux/slices/hostelSlice';
import LinearGradient from 'react-native-linear-gradient';

const RequestGatePassScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { operationStatus, operationError } = useSelector(
    state => state.hostel,
  );

  const [formData, setFormData] = useState({
    purpose: '',
    destination: '',
    pass_type: 'long',
    going_date: new Date().toISOString().split('T')[0],
    coming_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    expected_out_time: '09:00',
    expected_in_time: '18:00',
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setShowSuccessDialog(true);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  const handleSubmit = () => {
    dispatch(createGatePass(formData));
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[theme.colors.primary, '#2563eb']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Hostel')}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Request Gate Pass</Text>

            <TouchableOpacity style={styles.notificationButton}>
              {/* <Bell size={26} color="#fff" />
              <View style={styles.notificationDot} /> */}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formSection}>
              <Text style={styles.label}>Pass Type</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.pass_type === 'day' && styles.activeToggle,
                  ]}
                  onPress={() => setFormData({ ...formData, pass_type: 'day' })}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.pass_type === 'day' && styles.activeToggleText,
                    ]}
                  >
                    Day Outing
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.pass_type === 'long' && styles.activeToggle,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, pass_type: 'long' })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.pass_type === 'long' && styles.activeToggleText,
                    ]}
                  >
                    Long Leave
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Going Date</Text>
                <View style={styles.inputWrapper}>
                  <Calendar
                    size={20}
                    color="#94a3b8"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    mode="flat"
                    value={formData.going_date}
                    onChangeText={val =>
                      setFormData({ ...formData, going_date: val })
                    }
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    underlineColor="transparent"
                  />
                </View>
              </View>

              {formData.pass_type === 'long' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Coming Date</Text>
                  <View style={styles.inputWrapper}>
                    <Calendar
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      mode="flat"
                      value={formData.coming_date}
                      onChangeText={val =>
                        setFormData({ ...formData, coming_date: val })
                      }
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      underlineColor="transparent"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.row}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}
                  >
                    <Text style={styles.label}>Out Time</Text>
                    <View style={styles.inputWrapper}>
                      <Clock
                        size={20}
                        color="#94a3b8"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        mode="flat"
                        value={formData.expected_out_time}
                        onChangeText={val =>
                          setFormData({ ...formData, expected_out_time: val })
                        }
                        style={styles.input}
                        placeholder="HH:MM"
                        underlineColor="transparent"
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>In Time</Text>
                    <View style={styles.inputWrapper}>
                      <Clock
                        size={20}
                        color="#94a3b8"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        mode="flat"
                        value={formData.expected_in_time}
                        onChangeText={val =>
                          setFormData({ ...formData, expected_in_time: val })
                        }
                        style={styles.input}
                        placeholder="HH:MM"
                        underlineColor="transparent"
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Destination</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    mode="flat"
                    value={formData.destination}
                    onChangeText={val =>
                      setFormData({ ...formData, destination: val })
                    }
                    style={styles.input}
                    placeholder="Where are you going?"
                    underlineColor="transparent"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Purpose</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { alignItems: 'flex-start', paddingTop: 12 },
                  ]}
                >
                  <ClipboardList
                    size={20}
                    color="#94a3b8"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    mode="flat"
                    value={formData.purpose}
                    onChangeText={val =>
                      setFormData({ ...formData, purpose: val })
                    }
                    style={[styles.input, { height: 100 }]}
                    placeholder="Reason for outing"
                    multiline
                    underlineColor="transparent"
                  />
                </View>
              </View>

              <View style={styles.infoBanner}>
                <AlertCircle size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  An SMS with OTP will be sent to your parent's registered
                  mobile number for verification.
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={operationStatus === 'loading'}
                disabled={operationStatus === 'loading'}
                style={styles.submitButton}
                labelStyle={styles.submitButtonLabel}
              >
                Request Pass
              </Button>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <Portal>
          <Dialog
            visible={showSuccessDialog}
            onDismiss={handleSuccessClose}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Success</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Your gate pass request has been submitted successfully.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={handleSuccessClose}
                labelStyle={{ color: theme.colors.primary, fontWeight: '800' }}
              >
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 10,
  },
  header: {
    paddingBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  safeArea: {
    flex: 1,
  },

  backButton: {
    marginRight: 15,
  },

  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  activeToggleText: {
    color: theme.colors.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    fontWeight: '600',
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4338ca',
    fontWeight: '600',
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 15,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    fontWeight: '900',
    color: '#1e293b',
  },
  dialogText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default RequestGatePassScreen;
