import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
} from 'lucide-react-native';
import theme from '../../../theme/theme';
import examService from '../../../services/examService';

const { width } = Dimensions.get('window');

const ReverificationTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [reason, setReason] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [eligibilityData, requestsData] = await Promise.all([
        examService.getEligibleForReverification(),
        examService.getReverificationRequests(),
      ]);
      console.log('Requests:', requestsData);
      console.log('Eligibility:', eligibilityData);
      setEligibility(eligibilityData);
      setRequests(requestsData?.data || []);
    } catch (error) {
      console.error('Error fetching reverification data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleSubject = scheduleId => {
    if (selectedSubjects.includes(scheduleId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== scheduleId));
    } else {
      setSelectedSubjects([...selectedSubjects, scheduleId]);
    }
  };

  const handleApply = () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a reason for reverification');
      return;
    }
    // Navigate to payment screen or open payment modal
    alert('Navigate to reverification payment screen');
  };

  const availableSubjects =
    eligibility?.eligibleExams?.[0]?.available_subjects || [];
  const feePerPaper = eligibility?.eligibleExams?.[0]?.fee_per_paper || 0;
  const totalFee = selectedSubjects.length * feePerPaper;

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Application Section */}
      <Surface style={styles.applicationCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconBox}>
            <RefreshCw size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Apply for Reverification</Text>
        </View>

        {availableSubjects.length > 0 ? (
          <>
            <View style={styles.subjectsGrid}>
              {availableSubjects.map(subject => {
                const isSelected = selectedSubjects.includes(
                  subject.schedule_id,
                );
                return (
                  <TouchableOpacity
                    key={subject.schedule_id}
                    onPress={() => toggleSubject(subject.schedule_id)}
                    style={[
                      styles.subjectCard,
                      isSelected && styles.subjectCardSelected,
                    ]}
                  >
                    <View style={styles.subjectHeader}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <CheckCircle2 size={18} color="#fff" />}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.subjectName,
                        isSelected && styles.subjectNameSelected,
                      ]}
                    >
                      {subject.course_name}
                    </Text>
                    <Text
                      style={[
                        styles.subjectCode,
                        isSelected && styles.subjectCodeSelected,
                      ]}
                    >
                      {subject.course_code}
                    </Text>
                    <View style={styles.gradeRow}>
                      <Text
                        style={[
                          styles.gradeLabel,
                          isSelected && styles.gradeLabelSelected,
                        ]}
                      >
                        Grade:
                      </Text>
                      <Text
                        style={[
                          styles.gradeValue,
                          isSelected && styles.gradeValueSelected,
                        ]}
                      >
                        {subject.grade}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.reasonSection}>
              <Text style={styles.inputLabel}>Reason for Application</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Explain why you are requesting reverification..."
                style={styles.textInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Surface style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Selected Subjects</Text>
                <Text style={styles.summaryValue}>
                  {selectedSubjects.length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee per Paper</Text>
                <Text style={styles.summaryValue}>₹{feePerPaper}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.totalLabel}>Total Fee</Text>
                <Text style={styles.totalValue}>₹{totalFee}</Text>
              </View>
            </Surface>

            <TouchableOpacity style={styles.submitButton} onPress={handleApply}>
              <Text style={styles.submitButtonText}>Proceed to Payment</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              No exams currently eligible for reverification
            </Text>
          </View>
        )}
      </Surface>

      {/* Recent Requests */}
      <View style={styles.requestsSection}>
        <Text style={styles.requestsTitle}>Recent Requests</Text>
        {requests.length > 0 ? (
          requests.map(req => (
            <Surface key={req.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View
                  style={[
                    styles.requestIconBox,
                    {
                      backgroundColor:
                        req.status === 'completed' ? '#10b98115' : '#f59e0b15',
                    },
                  ]}
                >
                  <Award
                    size={20}
                    color={req.status === 'completed' ? '#10b981' : '#f59e0b'}
                  />
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestCourse}>
                    {req.schedule?.course?.name}
                  </Text>
                  <Text style={styles.requestCode}>
                    {req.schedule?.course?.code}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        req.status === 'completed'
                          ? '#10b98115'
                          : req.status === 'pending'
                          ? '#f59e0b15'
                          : theme.colors.primary + '15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          req.status === 'completed'
                            ? '#10b981'
                            : req.status === 'pending'
                            ? '#f59e0b'
                            : theme.colors.primary,
                      },
                    ]}
                  >
                    {req.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.gradeComparison}>
                <View style={styles.gradeBox}>
                  <Text style={styles.gradeBoxLabel}>Original</Text>
                  <Text style={styles.gradeBoxValue}>
                    {req.original_grade || 'N/A'}
                  </Text>
                </View>
                {req.status === 'completed' && (
                  <>
                    <ArrowRight size={16} color="#94a3b8" />
                    <View style={[styles.gradeBox, styles.gradeBoxRevised]}>
                      <Text style={styles.gradeBoxLabelRevised}>Revised</Text>
                      <Text style={styles.gradeBoxValueRevised}>
                        {req.revised_grade || req.exam_mark?.grade || 'N/A'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Surface>
          ))
        ) : (
          <Surface style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No requests to track</Text>
          </Surface>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  subjectCard: {
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  subjectCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  subjectHeader: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subjectNameSelected: {
    color: '#fff',
  },
  subjectCode: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subjectCodeSelected: {
    color: '#e0e7ff',
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  gradeLabelSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  gradeValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  gradeValueSelected: {
    color: '#fff',
  },
  reasonSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
  },
  summaryCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRowTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary + '20',
    marginTop: 4,
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  requestsSection: {
    marginBottom: 20,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestCourse: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  requestCode: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gradeComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  gradeBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  gradeBoxRevised: {
    backgroundColor: theme.colors.primary + '15',
  },
  gradeBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gradeBoxLabelRevised: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gradeBoxValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  gradeBoxValueRevised: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
  },
  emptyCardText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ReverificationTab;
