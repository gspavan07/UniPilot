import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Surface, ActivityIndicator, Badge } from 'react-native-paper';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Download,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import theme from '../../../theme/theme';
import examService from '../../../services/examService';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ScheduleTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exams, setExams] = useState([]);
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();

  const fetchData = useCallback(async () => {
    try {
      const response = await examService.getMyExams();
      // The backend returns { success: true, data: [...] }
      setExams(response || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  console.log(exams);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
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
        {exams.length > 0 ? (
          exams.map(exam => {
            const eligibility = exam.student_eligibilities?.[0];
            const needsFee = exam.needs_fee;
            const studentPayment = exam.student_payments?.[0];
            const isPaid = studentPayment?.status === 'completed';
            const isEligible =
              eligibility?.hod_permission && eligibility?.fee_clear_permission;

            return (
              <View key={exam.id} style={styles.examSection}>
                {/* Exam Cycle Header */}
                <View style={styles.cycleHeader}>
                  <View style={styles.cycleBadgeRow}>
                    <View style={styles.semesterBadge}>
                      <Text style={styles.semesterBadgeText}>
                        {exam.semester} SEMESTER
                      </Text>
                    </View>
                    {needsFee && (
                      <View
                        style={[
                          styles.statusBadge,
                          isPaid ? styles.paidBadge : styles.pendingBadge,
                        ]}
                      >
                        {isPaid ? (
                          <CheckCircle size={10} color="#10b981" />
                        ) : (
                          <AlertCircle size={10} color="#f59e0b" />
                        )}
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isPaid ? styles.paidText : styles.pendingText,
                          ]}
                        >
                          {isPaid ? 'REGISTERED' : 'FEE PENDING'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cycleName}>
                    {exam.cycle_name.replace(/_/g, ' ')}
                  </Text>

                  {needsFee && !isPaid && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Payments')}
                      style={styles.payPrompt}
                    >
                      <Text style={styles.payPromptText}>
                        Pay Registration Fee
                      </Text>
                      <ChevronRight size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Eligibility Alerts */}
                {eligibility && !isEligible && (
                  <Surface style={styles.alertCard}>
                    <View style={styles.alertHeader}>
                      <AlertTriangle size={18} color="#1e293b" />
                      <Text style={styles.alertTitle}>ACTION REQUIRED</Text>
                    </View>
                    <View style={styles.alertList}>
                      {!eligibility.hod_permission && (
                        <View style={styles.alertItem}>
                          <View style={styles.alertDot} />
                          <Text style={styles.alertText}>
                            Department HOD approval is pending
                          </Text>
                        </View>
                      )}
                      {!eligibility.fee_clear_permission && (
                        <View style={styles.alertItem}>
                          <View style={styles.alertDot} />
                          <Text style={styles.alertText}>
                            Tuition fee clearance pending ({'\u20B9'}
                            {(eligibility.fee_balance || 0).toLocaleString()})
                          </Text>
                        </View>
                      )}
                    </View>
                  </Surface>
                )}

                {/* Timetable Cards */}
                <View style={styles.timetableGrid}>
                  {exam.timetables?.length > 0 ? (
                    exam.timetables
                      .sort(
                        (a, b) => new Date(a.exam_date) - new Date(b.exam_date),
                      )
                      .map(timetable => (
                        <Surface
                          key={timetable.id}
                          style={styles.timetableCard}
                        >
                          <View style={styles.dateBox}>
                            <Text style={styles.monthText}>
                              {new Date(timetable.exam_date)
                                .toLocaleDateString('en-US', { month: 'short' })
                                .toUpperCase()}
                            </Text>
                            <Text style={styles.dayText}>
                              {new Date(timetable.exam_date).toLocaleDateString(
                                'en-US',
                                { day: 'numeric' },
                              )}
                            </Text>
                          </View>

                          <View style={styles.timetableInfo}>
                            <View style={styles.cardTopRow}>
                              <Text style={styles.courseCode}>
                                {timetable.course?.code}
                              </Text>
                              <View
                                style={[
                                  styles.sessionBadge,
                                  timetable.session === 'morning'
                                    ? styles.morningBadge
                                    : styles.afternoonBadge,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.sessionText,
                                    timetable.session === 'morning'
                                      ? styles.morningText
                                      : styles.afternoonText,
                                  ]}
                                >
                                  {timetable.session.toUpperCase()}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.courseName}>
                              {timetable.course?.name}
                            </Text>
                            <View style={styles.timeRow}>
                              <Clock size={12} color="#94a3b8" />
                              <Text style={styles.timeText}>
                                {timetable.start_time.slice(0, 5)} -{' '}
                                {timetable.end_time.slice(0, 5)}
                              </Text>
                              <View style={styles.venueDivider} />
                              <MapPin size={12} color="#ef4444" />
                              <Text style={styles.venueText}>
                                {timetable.venue || 'TBA'}
                              </Text>
                            </View>
                          </View>
                        </Surface>
                      ))
                  ) : (
                    <View style={styles.emptyTimetable}>
                      <Info size={24} color="#CBD5E1" />
                      <Text style={styles.emptyTimetableText}>
                        Timetable pending publication
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color="#e0e7ff" />
            <Text style={styles.emptyTitle}>No Examinations Scheduled</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for updates to your exam cycle.
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
  examSection: {
    marginBottom: 40,
  },
  cycleHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
  },
  cycleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  semesterBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  semesterBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  paidBadge: {
    backgroundColor: '#10b98110',
  },
  pendingBadge: {
    backgroundColor: '#f59e0b10',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  paidText: {
    color: '#10b981',
  },
  pendingText: {
    color: '#f59e0b',
  },
  cycleName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
  },
  payPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  payPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  alertCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  alertList: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94a3b8',
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  timetableGrid: {
    gap: 16,
  },
  timetableCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  dateBox: {
    width: 50,
    height: 65,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 2,
  },
  dayText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  timetableInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseCode: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  sessionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  morningBadge: {
    backgroundColor: '#1680F010',
  },
  afternoonBadge: {
    backgroundColor: '#f1f5f9',
  },
  sessionText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  morningText: {
    color: theme.colors.primary,
  },
  afternoonText: {
    color: '#64748b',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  venueDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  venueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  emptyTimetable: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyTimetableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ScheduleTab;
