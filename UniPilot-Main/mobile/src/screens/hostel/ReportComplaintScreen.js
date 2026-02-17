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
  Wrench,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import {
  createComplaint,
  resetOperationStatus,
} from '../../redux/slices/hostelSlice';
import LinearGradient from 'react-native-linear-gradient';

const ReportComplaintScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { operationStatus, operationError } = useSelector(
    state => state.hostel,
  );

  const [formData, setFormData] = useState({
    complaint_type: 'plumbing',
    description: '',
    priority: 'medium',
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setShowSuccessDialog(true);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  const handleSubmit = () => {
    dispatch(createComplaint(formData));
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigation.goBack();
  };

  const categories = [
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'wifi', label: 'Wifi' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'other', label: 'Other' },
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: '#10b981' },
    { id: 'medium', label: 'Medium', color: '#f59e0b' },
    { id: 'urgent', label: 'Urgent', color: '#ef4444' },
  ];

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

            <Text style={styles.headerTitle}>Report Complaint</Text>

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
              <Text style={styles.label}>Issue Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      formData.complaint_type === cat.id &&
                        styles.activeCategory,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, complaint_type: cat.id })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.complaint_type === cat.id &&
                          styles.activeCategoryText,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.priorityContainer}>
                {priorities.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.priorityItem,
                      formData.priority === p.id && {
                        backgroundColor: p.color + '20',
                        borderColor: p.color,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, priority: p.id })}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            formData.priority === p.id ? p.color : '#94a3b8',
                        },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Issue Description</Text>
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
                    value={formData.description}
                    onChangeText={val =>
                      setFormData({ ...formData, description: val })
                    }
                    style={[styles.input, { height: 120 }]}
                    placeholder="Describe the problem in detail..."
                    multiline
                    underlineColor="transparent"
                  />
                </View>
              </View>

              <View style={styles.infoBanner}>
                <AlertTriangle size={20} color="#f59e0b" />
                <Text style={styles.infoText}>
                  Your request will be assigned to a technician. Response time
                  depends on priority level.
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
                Submit Request
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
            <Dialog.Title style={styles.dialogTitle}>
              Request Logged
            </Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Your maintenance request has been registered and will be
                reviewed shortly.
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
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 10,
    marginBottom: 10,
  },
  activeCategory: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  activeCategoryText: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  priorityItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#f8fafc',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 15,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
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

export default ReportComplaintScreen;
