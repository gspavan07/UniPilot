import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  CreditCard,
  Wallet,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Menu,
  Bell,
  Receipt,
  ArrowUpRight,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import feeService from '../../services/feeService';
import { useDrawer } from '../../context/DrawerContext';

const { width } = Dimensions.get('window');

const FeeDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const { toggleDrawer } = useDrawer();
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const feeStatus = await feeService.getMyStatus();
      setData(feeStatus);
    } catch (err) {
      setError(err);
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

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderSummaryCard = (label, amount, icon, color, subLabel) => (
    <Surface style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <Text style={[styles.cardAmount, { color: color }]}>
        {formatCurrency(amount)}
      </Text>
      {subLabel && <Text style={styles.cardSubLabel}>{subLabel}</Text>}
    </Surface>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const { grandTotals, studentInfo } = data || {};

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#4f46e5']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Menu size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Fee Dashboard</Text>

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={26} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
          {/* <View style={styles.headerContent}>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Fee Dashboard</Text>
              <Text style={styles.headerSubtitle}>
                {studentInfo?.admission_number || 'Student ID'} •{' '}
                {studentInfo?.is_hosteller ? 'Hosteller' : 'Day Scholar'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => navigation.navigate('TransactionHistoryScreen')}
            >
              <Receipt size={20} color="#fff" />
            </TouchableOpacity>
          </View> */}
        </SafeAreaView>
      </LinearGradient>

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
        {/* Main Due Alert */}
        {grandTotals?.due > 0 && (
          <Surface style={styles.dueAlert}>
            <LinearGradient colors={['#fff', '#fef2f2']}>
              <View style={styles.dueAlertContent}>
                <View style={styles.dueTextRow}>
                  <AlertCircle size={24} color="#ef4444" />
                  <View style={styles.dueInfo}>
                    <Text style={styles.dueTitle}>Outstanding Balance</Text>
                    <Text style={styles.dueValue}>
                      {formatCurrency(grandTotals.due)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.payNowBtn}
                  onPress={() => navigation.navigate('FeeLedger')}
                >
                  <Text style={styles.payNowText}>Pay Now</Text>
                  <ArrowUpRight size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Surface>
        )}

        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          {renderSummaryCard(
            'Total Payable',
            grandTotals?.payable,
            <CreditCard size={20} color={theme.colors.primary} />,
            theme.colors.primary,
            'Total course & sem fees',
          )}
          {renderSummaryCard(
            'Amount Paid',
            grandTotals?.paid,
            <CheckCircle2 size={20} color="#10b981" />,
            '#10b981',
            'Successfully cleared',
          )}
          {grandTotals?.excessBalance > 0 &&
            renderSummaryCard(
              'Wallet Balance',
              grandTotals.excessBalance,
              <Wallet size={20} color="#f59e0b" />,
              '#f59e0b',
              'Available for future sem',
            )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Your Fees</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('FeeLedger')}
          >
            <View style={styles.actionIconBox}>
              <Receipt size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Detailed Ledger</Text>
              <Text style={styles.actionSubtitle}>
                View semester breakdown & receipts
              </Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View
              style={[styles.actionIconBox, { backgroundColor: '#f59e0b15' }]}
            >
              <AlertCircle size={24} color="#f59e0b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Fines & Penalties</Text>
              <Text style={styles.actionSubtitle}>
                Late payment or discipline fines
              </Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 10,
  },
  menuButton: {
    padding: 5,
  },
  notificationButton: {
    padding: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dueAlert: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 24,
  },
  dueAlertContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueInfo: {
    marginLeft: 15,
  },
  dueTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 2,
  },
  payNowBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payNowText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 15,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  actionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});

export default FeeDashboardScreen;
