import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import {
  CreditCard,
  History,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronRight,
  Download,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import theme from '../../../theme/theme';
import examService from '../../../services/examService';
import { useSelector } from 'react-redux';
import usePayment from '../../../hooks/usePayment';

const { width } = Dimensions.get('window');

const PaymentsTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exams, setExams] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [subTab, setSubTab] = useState('due'); // due | history
  const [paying, setPaying] = useState(null);
  const { user } = useSelector(state => state.auth);

  const { initiatePayment, isProcessing } = usePayment({
    onSuccess: () => {
      Alert.alert('Success', 'Payment verified successfully!');
      fetchData();
    },
    onError: err => console.log('Payment Error:', err),
  });

  const fetchData = useCallback(async () => {
    try {
      const [examsRes, historyRes] = await Promise.all([
        examService.getMyExams(),
        examService.getExamPaymentHistory(),
      ]);
      // The backend returns { success: true, data: [...] }
      setExams(examsRes || []);
      setPaymentHistory(historyRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const calculateTotalFee = (cycle, eligibility) => {
    if (!cycle?.fee_configuration) return 0;
    const config = cycle.fee_configuration;
    let total = parseFloat(config.base_fee);
    const today = new Date().toISOString().split('T')[0];

    if (today > config.regular_end_date) {
      const slabs = [...(config.slabs || [])].sort(
        (a, b) => new Date(b.end_date) - new Date(a.end_date),
      );
      const applicableSlab = slabs.find(
        s => today >= s.start_date && today <= s.end_date,
      );
      if (applicableSlab) {
        total += parseFloat(applicableSlab.fine_amount);
      }
    }

    if (eligibility?.has_condonation && cycle.condonation_fee_amount) {
      total += parseFloat(cycle.condonation_fee_amount);
    }

    return total;
  };

  const handlePayFee = async cycle => {
    try {
      setPaying(cycle.id);
      const eligibility = cycle.student_eligibilities?.[0];
      const totalAmount = calculateTotalFee(cycle, eligibility);

      const response = await examService.payExamFee(cycle.id);

      if (response.success && response.data.razorpay_order) {
        // Prepare options for Razorpay direct call or use our hook logic
        // Since usePayment is tied to feeService.payMyFees, we'll need to manually call verification
        // or update usePayment. For now, let's keep it simple and use the hook if possible,
        // but the backend endpoint for verification is different.

        // Actually, let's look at usePayment again. It calls feeService.payMyFees.
        // I should probably just implement the Razorpay flow here or modify usePayment to be more generic.
        // Given the constraints, I'll implement the flow here using the logic from usePayment.

        const options = {
          key:
            response.data.razorpay_order.key ||
            process.env.VITE_RAZORPAY_KEY_ID, // fallback
          amount: response.data.razorpay_order.amount,
          currency: 'INR',
          name: 'Exam Fee Payment',
          description: cycle.cycle_name.replace(/_/g, ' '),
          order_id: response.data.razorpay_order.id,
          prefill: {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
          },
          theme: { color: theme.colors.primary },
        };

        // Importing RazorpayCheckout directly as in usePayment
        const RazorpayCheckout = require('react-native-razorpay').default;

        RazorpayCheckout.open(options)
          .then(async data => {
            try {
              await examService.verifyPayment(cycle.id, {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
                amount: response.data.amount,
              });
              Alert.alert('Success', 'Payment successful!');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Payment verification failed');
            }
          })
          .catch(error => {
            if (error.code !== 2) {
              Alert.alert('Error', error.description || 'Payment failed');
            }
          });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Payment initiation failed',
      );
    } finally {
      setPaying(null);
    }
  };

  const cyclesNeedingFee = exams.filter(c => c.needs_fee);

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sub-Tab Toggle */}
      <View style={styles.tabToggleContainer}>
        <View style={styles.tabToggle}>
          <TouchableOpacity
            onPress={() => setSubTab('due')}
            style={[
              styles.tabButton,
              subTab === 'due' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                subTab === 'due' && styles.tabButtonTextActive,
              ]}
            >
              DUE (
              {
                cyclesNeedingFee.filter(c => c.student_payments?.length === 0)
                  .length
              }
              )
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSubTab('history')}
            style={[
              styles.tabButton,
              subTab === 'history' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                subTab === 'history' && styles.tabButtonTextActive,
              ]}
            >
              HISTORY ({paymentHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
        {subTab === 'due' ? (
          cyclesNeedingFee.length > 0 ? (
            cyclesNeedingFee.map(cycle => {
              const isPaid = cycle.student_payments?.length > 0;
              const eligibility = cycle.student_eligibilities?.[0];
              const totalAmount = calculateTotalFee(cycle, eligibility);
              const today = new Date().toISOString().split('T')[0];
              const isLate = today > cycle.fee_configuration?.regular_end_date;
              const isBlocked =
                eligibility &&
                (!eligibility.hod_permission ||
                  !eligibility.fee_clear_permission);

              return (
                <Surface key={cycle.id} style={styles.paymentCard}>
                  <View
                    style={[
                      styles.statusStrip,
                      {
                        backgroundColor: isPaid
                          ? '#10b981'
                          : isBlocked
                          ? '#94a3b8'
                          : theme.colors.primary,
                      },
                    ]}
                  />

                  <View style={styles.cardHeader}>
                    <View style={styles.headerTitleContainer}>
                      <Text style={styles.cycleName}>
                        {cycle.cycle_name.replace(/_/g, ' ')}
                      </Text>
                      <View style={styles.deadlineRow}>
                        <Clock size={12} color="#94a3b8" />
                        <Text style={styles.deadlineText}>
                          Closes{' '}
                          {new Date(
                            cycle.fee_configuration?.final_registration_date,
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text style={styles.amountValue}>
                        ₹{totalAmount.toLocaleString()}
                      </Text>
                      <Text style={styles.amountLabel}>TOTAL FEE</Text>
                    </View>
                  </View>

                  <View style={styles.breakdownContainer}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Base Exam Fee</Text>
                      <Text style={styles.breakdownValue}>
                        ₹
                        {parseFloat(
                          cycle.fee_configuration?.base_fee || 0,
                        ).toLocaleString()}
                      </Text>
                    </View>
                    {isLate && (
                      <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLabelWithIcon}>
                          <AlertCircle size={14} color="#94a3b8" />
                          <Text style={styles.breakdownLabel}>
                            Late Registration Fine
                          </Text>
                        </View>
                        <Text
                          style={[styles.breakdownValue, { color: '#ef4444' }]}
                        >
                          + ₹
                          {parseFloat(
                            cycle.fee_configuration?.slabs?.find(
                              s => today >= s.start_date && today <= s.end_date,
                            )?.fine_amount || 0,
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    {eligibility?.has_condonation && (
                      <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLabelWithIcon}>
                          <AlertTriangle size={14} color="#94a3b8" />
                          <Text style={styles.breakdownLabel}>
                            Condonation Fee
                          </Text>
                        </View>
                        <Text
                          style={[styles.breakdownValue, { color: '#f59e0b' }]}
                        >
                          + ₹
                          {parseFloat(
                            cycle.condonation_fee_amount || 0,
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {isBlocked && !isPaid && (
                    <View style={styles.blockerContainer}>
                      <XCircle size={18} color="#1e293b" />
                      <View style={styles.blockerTextContainer}>
                        <Text style={styles.blockerTitle}>
                          REGISTRATION BLOCKED
                        </Text>
                        {!eligibility.hod_permission && (
                          <Text style={styles.blockerDetail}>
                            • Attendance below threshold. HOD Approval required.
                          </Text>
                        )}
                        {!eligibility.fee_clear_permission && (
                          <Text style={styles.blockerDetail}>
                            • Outstanding tuition fees pending.
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <View style={styles.secureTextRow}>
                      <ShieldCheck size={14} color="#94a3b8" />
                      <Text style={styles.secureText}>Secured by Razorpay</Text>
                    </View>

                    {isPaid ? (
                      <View style={styles.paidBadge}>
                        <CheckCircle size={16} color="#10b981" />
                        <Text style={styles.paidText}>PAID & VERIFIED</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handlePayFee(cycle)}
                        disabled={paying === cycle.id || isBlocked}
                        style={[
                          styles.payButton,
                          isBlocked && styles.payButtonDisabled,
                        ]}
                      >
                        {paying === cycle.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Text style={styles.payButtonText}>
                              PROCEED TO PAYMENT
                            </Text>
                            <ChevronRight size={18} color="#fff" />
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </Surface>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <CheckCircle size={64} color="#e0e7ff" />
              <Text style={styles.emptyText}>No pending exam fees found.</Text>
            </View>
          )
        ) : paymentHistory.length > 0 ? (
          paymentHistory.map(payment => (
            <Surface key={payment.id} style={styles.historyCard}>
              <View style={styles.historyStrip} />
              <View style={styles.historyContent}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(payment.payment_date).toLocaleDateString(
                      'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' },
                    )}
                  </Text>
                  <Text style={styles.historyAmount}>
                    ₹{parseFloat(payment.amount_paid).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.historyCycleName}>
                  {payment.exam_cycle?.cycle_name?.replace(/_/g, ' ')}
                </Text>
                {payment.payment_status === 'success' && (
                  <TouchableOpacity style={styles.receiptButton}>
                    <Download size={14} color="#4b5563" />
                    <Text style={styles.receiptButtonText}>
                      DOWNLOAD RECEIPT
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <History size={64} color="#e0e7ff" />
            <Text style={styles.emptyText}>No payment history found.</Text>
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
  tabToggleContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  tabButtonTextActive: {
    color: theme.colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  statusStrip: {
    height: 4,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  cycleName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  amountContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minWidth: 110,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginTop: 2,
  },
  breakdownContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  blockerContainer: {
    flexDirection: 'row',
    padding: 15,
    margin: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  blockerTextContainer: {
    flex: 1,
  },
  blockerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  blockerDetail: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    lineHeight: 16,
  },
  cardFooter: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secureTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#10b98115',
    borderRadius: 12,
  },
  paidText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  historyStrip: {
    width: 4,
    backgroundColor: '#f1f5f9',
  },
  historyContent: {
    flex: 1,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  historyCycleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  receiptButtonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4b5563',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: '#fff',
    borderRadius: 32,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PaymentsTab;
