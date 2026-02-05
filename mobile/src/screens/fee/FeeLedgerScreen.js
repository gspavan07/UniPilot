import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput as RNTextInput,
  Platform,
} from 'react-native';
import { useAlert } from '../../context/AlertContext';
import { Text, Surface, ActivityIndicator, Checkbox } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  Download,
  ChevronLeft,
  Info,
  Wallet,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Printer,
} from 'lucide-react-native';
import * as ReceiptUtils from '../../utils/receiptGenerator';
import theme from '../../theme/theme';
import feeService from '../../services/feeService';
import usePayment from '../../hooks/usePayment';
import PaymentFooter from '../../components/PaymentFooter';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FeeLedgerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);

  // Selection State
  const [selectedFees, setSelectedFees] = useState(new Set());
  const [customAmounts, setCustomAmounts] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const feeStatus = await feeService.getMyStatus();
      if (feeStatus?.success) {
        const statusData = feeStatus.data;
        setData(statusData);

        // Set initial active semester if not set
        if (statusData?.semesterWise && !activeSemester) {
          const semesters = Object.keys(statusData.semesterWise);
          if (semesters.length > 0) setActiveSemester(semesters[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeSemester]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Payment Hook
  const { showAlert } = useAlert();
  const { isProcessing, initiatePayment } = usePayment({
    onSuccess: res => {
      const master = res?.data?.[0];
      showAlert({
        title: 'Success',
        message: 'Payment Successful!',
        type: 'success',
        transactionId: master?.transaction_id,
        receiptUrl: master?.receipt_url,
        transactionData: { ...master, student: studentInfo },
      });
      setSelectedFees(new Set());
      setCustomAmounts({});
      fetchData();
    },
    onError: err => {
      console.error('Payment Error:', err);
    },
  });

  const toggleFeeSelection = (feeId, fullDue) => {
    const next = new Set(selectedFees);
    if (next.has(feeId)) {
      next.delete(feeId);
      const newAmounts = { ...customAmounts };
      delete newAmounts[feeId];
      setCustomAmounts(newAmounts);
    } else {
      next.add(feeId);
      setCustomAmounts(prev => ({ ...prev, [feeId]: fullDue }));
    }
    setSelectedFees(next);
  };

  const handleAmountChange = (feeId, val, maxLimit) => {
    const amount = parseFloat(val) || 0;
    if (amount < 0 || amount > maxLimit) return;
    setCustomAmounts(prev => ({ ...prev, [feeId]: amount }));
  };

  const selectedTotal = useMemo(() => {
    let total = 0;
    selectedFees.forEach(feeId => {
      total += customAmounts[feeId] || 0;
    });
    return total;
  }, [selectedFees, customAmounts]);

  const handlePayment = async () => {
    if (selectedTotal <= 0) return;

    const walletCredit = grandTotals?.excessBalance || 0;
    const appliedWallet = Math.min(selectedTotal, walletCredit);
    const netPayable = selectedTotal - appliedWallet;

    // Build payment batch
    const paymentBatch = [];
    selectedFees.forEach(feeId => {
      const amount = customAmounts[feeId];
      if (amount > 0) {
        if (feeId.toString().startsWith('fine:')) {
          const sem = feeId.split(':')[1];
          paymentBatch.push({
            type: 'fine',
            semester: parseInt(sem),
            amount: amount,
          });
        } else {
          let feeType = 'structure';
          let found = false;
          Object.entries(semesterWise).forEach(([sem, semData]) => {
            if (found) return;
            const feeObj = semData.fees.find(f => f.id === feeId);
            if (feeObj) {
              if (feeObj.is_charge) feeType = 'charge';
              found = true;
              paymentBatch.push({
                type: feeType,
                structure_id: feeId,
                semester: parseInt(sem),
                amount: amount,
              });
            }
          });
        }
      }
    });

    if (netPayable > 0) {
      await initiatePayment({
        amount: netPayable,
        payments: paymentBatch,
        description: 'Student Fee Payment',
      });
    } else {
      // Full Wallet Payment
      try {
        const res = await feeService.payMyFees({
          payments: paymentBatch,
          payment_method: 'wallet',
          remarks: 'Paid via Wallet (Mobile)',
        });
        const master = res?.data?.[0];
        showAlert({
          title: 'Success',
          message: 'Payment Successful (Wallet applied)!',
          type: 'success',
          transactionId: master?.transaction_id,
          receiptUrl: master?.receipt_url,
          transactionData: { ...master, student: studentInfo },
        });
        setSelectedFees(new Set());
        setCustomAmounts({});
        fetchData();
      } catch (err) {
        showAlert({
          title: 'Payment Failed',
          message: err.toString(),
          type: 'error',
        });
      }
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = date => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const {
    semesterWise = {},
    grandTotals = {},
    scholarships = [],
    studentInfo = {},
  } = data || {};
  const currentSemData = activeSemester ? semesterWise[activeSemester] : null;

  return (
    <View edges={['top']} style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Ledger</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      {/* Semester Tabs */}
      <View style={styles.tabWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {Object.keys(semesterWise).map(sem => (
            <TouchableOpacity
              key={sem}
              onPress={() => setActiveSemester(sem)}
              style={[styles.tab, activeSemester === sem && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeSemester === sem && styles.activeTabText,
                ]}
              >
                SEM {sem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Timeline Deadlines (Rich UI) */}
        {Object.values(semesterWise).some(d => d.fine.deadline) && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionHeader}>Payment Deadlines Timeline</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timelineContainer}
            >
              {Object.entries(semesterWise)
                .filter(([_, d]) => d.fine.deadline)
                .map(([sem, d]) => {
                  const isPaid = d.totals.due <= 0;
                  return (
                    <View
                      key={sem}
                      style={[
                        styles.timelineCard,
                        isPaid
                          ? styles.timelinePaid
                          : d.fine.isOverdue
                          ? styles.timelineOverdue
                          : styles.timelinePending,
                      ]}
                    >
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineSemText}>SEM {sem}</Text>
                        {isPaid && <CheckCircle2 size={12} color="#10b981" />}
                      </View>
                      <Text style={styles.timelineDate}>
                        {formatDate(d.fine.deadline)}
                      </Text>
                      <Text
                        style={[
                          styles.timelineStatus,
                          {
                            color: isPaid
                              ? '#10b981'
                              : d.fine.isOverdue
                              ? '#ef4444'
                              : '#f59e0b',
                          },
                        ]}
                      >
                        {isPaid
                          ? 'Cleared'
                          : d.fine.isOverdue
                          ? 'Overdue'
                          : 'Pending'}
                      </Text>
                    </View>
                  );
                })}
            </ScrollView>
          </View>
        )}

        {/* Semester Stats */}
        {currentSemData && (
          <View style={styles.semStatsRow}>
            <View style={styles.semStat}>
              <Text style={styles.semStatLabel}>Payable</Text>
              <Text style={styles.semStatValue}>
                {formatCurrency(currentSemData.totals.payable)}
              </Text>
            </View>
            <View style={[styles.semStat, styles.semStatBorder]}>
              <Text style={styles.semStatLabel}>Paid</Text>
              <Text style={[styles.semStatValue, { color: '#10b981' }]}>
                {formatCurrency(currentSemData.totals.paid)}
              </Text>
            </View>
            <View style={styles.semStat}>
              <Text style={styles.semStatLabel}>Due</Text>
              <Text style={[styles.semStatValue, { color: '#ef4444' }]}>
                {formatCurrency(currentSemData.totals.due)}
              </Text>
            </View>
          </View>
        )}

        {/* Fee Items */}
        {currentSemData?.fees.map(fee => {
          return (
            <View
              key={fee.id}
              style={[
                styles.feeCard,
                selectedFees.has(fee.id) && styles.selectedFeeCard,
              ]}
            >
              <View style={styles.feeHeader}>
                <View style={styles.feeInfoMain}>
                  <Text style={styles.feeCategory}>{fee.category}</Text>
                  {fee.is_charge && (
                    <View style={styles.chargeBadge}>
                      <Text style={styles.chargeBadgeText}>
                        ONE-TIME CHARGE
                      </Text>
                    </View>
                  )}
                </View>
                {fee.due > 0 && (
                  <Checkbox.Android
                    status={selectedFees.has(fee.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleFeeSelection(fee.id, fee.due)}
                    color={theme.colors.primary}
                  />
                )}
              </View>

              <View style={styles.feeDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Total Payable</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(fee.payable)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Paid</Text>
                  <Text style={[styles.detailValue, { color: '#10b981' }]}>
                    {formatCurrency(fee.paid)}
                  </Text>
                </View>
                {fee.waiver > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Waiver</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.primary },
                      ]}
                    >
                      -{formatCurrency(fee.waiver)}
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Outstanding</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: fee.due > 0 ? '#ef4444' : '#10b981' },
                    ]}
                  >
                    {formatCurrency(fee.due)}
                  </Text>
                </View>
              </View>

              {/* Custom Amount Input if Selected */}
              {selectedFees.has(fee.id) && (
                <View style={styles.amountInputRow}>
                  <Text style={styles.amountPrompt}>Amount to pay:</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <RNTextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      value={customAmounts[fee.id]?.toString()}
                      onChangeText={val =>
                        handleAmountChange(fee.id, val, fee.due)
                      }
                    />
                  </View>
                </View>
              )}

              {/* Receipts */}
              {fee.receipts.length > 0 && (
                <View style={styles.receiptsRow}>
                  <Text style={styles.receiptLabel}>Receipts:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {fee.receipts.map((r, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.receiptChip}
                        onPress={() =>
                          ReceiptUtils.generateReceiptPDF({
                            ...r,
                            student: studentInfo,
                            category: fee.category,
                            semester: fee.semester || activeSemester,
                          })
                        }
                      >
                        <Printer size={14} color={theme.colors.primary} />
                        <Text style={styles.receiptText}>
                          #{r.number.slice(-6)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}

        {/* Fine Row */}
        {currentSemData?.fine?.amount > 0 && (
          <View
            style={[
              styles.feeCard,
              styles.fineCard,
              selectedFees.has(`fine:${activeSemester}`) &&
                styles.selectedFeeCard,
            ]}
          >
            <View style={styles.feeHeader}>
              <View style={styles.feeInfoMain}>
                <View style={styles.fineTitleRow}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text style={styles.fineTitle}>Late Payment Fine</Text>
                </View>
                <Text style={styles.fineDeadline}>
                  Deadline: {formatDate(currentSemData.fine.deadline)}
                </Text>
              </View>
              {currentSemData.fine.due > 0 && (
                <Checkbox.Android
                  status={
                    selectedFees.has(`fine:${activeSemester}`)
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() =>
                    toggleFeeSelection(
                      `fine:${activeSemester}`,
                      currentSemData.fine.due,
                    )
                  }
                  color="#ef4444"
                />
              )}
            </View>
            <View style={styles.feeDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fine Amount</Text>
                <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                  {formatCurrency(currentSemData.fine.amount)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Paid</Text>
                <Text style={[styles.detailValue, { color: '#10b981' }]}>
                  {formatCurrency(currentSemData.fine.paid)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color:
                        currentSemData.fine.due > 0 ? '#ef4444' : '#10b981',
                    },
                  ]}
                >
                  {currentSemData.fine.due > 0 ? 'Pending' : 'Cleared'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Outstanding Fine</Text>
                <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                  {formatCurrency(currentSemData.fine.due)}
                </Text>
              </View>
            </View>
            {selectedFees.has(`fine:${activeSemester}`) && (
              <View style={styles.amountInputRow}>
                <Text style={styles.amountPrompt}>Amount to pay:</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <RNTextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={customAmounts[`fine:${activeSemester}`]?.toString()}
                    onChangeText={val =>
                      handleAmountChange(
                        `fine:${activeSemester}`,
                        val,
                        currentSemData.fine.due,
                      )
                    }
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Scholarships List */}
        {scholarships?.length > 0 && (
          <View style={styles.scholarshipsSection}>
            <Text style={styles.sectionHeader}>Applied Scholarships</Text>
            {scholarships.map(s => (
              <Surface key={s.id} style={styles.scholarshipCard} elevation={1}>
                <View>
                  <Text style={styles.scholarshipType}>{s.type}</Text>
                  <Text style={styles.scholarshipDate}>
                    Approved on {formatDate(s.approved_at)}
                  </Text>
                </View>
                <Text style={styles.scholarshipAmount}>
                  {formatCurrency(parseFloat(s.amount))}
                </Text>
              </Surface>
            ))}
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Reusable Modular Payment Footer */}
      <PaymentFooter
        total={selectedTotal}
        walletApplied={Math.min(selectedTotal, grandTotals?.excessBalance || 0)}
        netPayable={Math.max(
          0,
          selectedTotal - (grandTotals?.excessBalance || 0),
        )}
        onPay={handlePayment}
        isProcessing={isProcessing}
      />
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
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  tabWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  tabsContainer: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineContainer: {
    paddingRight: 20,
  },
  timelineCard: {
    minWidth: 150,
    padding: 12,
    borderRadius: 16,
    marginRight: 10,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineSemText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  timelineStatus: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  timelinePaid: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  timelineOverdue: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  timelinePending: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },

  semStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  semStat: {
    flex: 1,
    alignItems: 'center',
  },
  semStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#f1f5f9',
  },
  semStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  semStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  feeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  selectedFeeCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feeInfoMain: {
    flex: 1,
  },
  feeCategory: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  chargeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  chargeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
  },
  feeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    borderTopWidth: 1,
    borderColor: '#f8fafc',
    paddingTop: 15,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#f8fafc',
  },
  amountPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    width: 140,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'right',
  },
  receiptsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#f8fafc',
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginRight: 10,
  },
  receiptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },
  receiptText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: 5,
  },
  fineCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  fineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  fineDeadline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f43f5e',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  scholarshipsSection: {
    marginTop: 10,
  },
  scholarshipCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  scholarshipType: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  scholarshipDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6d28d9',
    marginTop: 2,
  },
  scholarshipAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6d28d9',
  },
});

export default FeeLedgerScreen;
