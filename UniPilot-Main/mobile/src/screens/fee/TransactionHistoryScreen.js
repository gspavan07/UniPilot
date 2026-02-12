import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import {
  ChevronLeft,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import feeService from '../../services/feeService';
import * as ReceiptUtils from '../../utils/receiptGenerator';

const TransactionHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await feeService.getMyStatus(); // Reusing status for now as it contains logs
      if (res?.success) {
        setTransactions(res.data?.transactions || []);
        setStudentInfo(res.data?.studentInfo || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = status => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircle2 size={16} color="#10b981" />;
      case 'pending':
        return <Clock size={16} color="#f59e0b" />;
      case 'failed':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Receipt size={16} color="#64748b" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Receipt size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>No transaction history found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Surface style={styles.transactionCard}>
            <View style={styles.cardTop}>
              <View style={styles.infoGroup}>
                <Text style={styles.transactionId}>
                  #{item.transaction_id?.slice(-8).toUpperCase()}
                </Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '15' },
                ]}
              >
                {getStatusIcon(item.status)}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.methodLabel}>Payment Method</Text>
                <Text style={styles.methodValue}>
                  {item.payment_method?.toUpperCase() || 'ONLINE'}
                </Text>
              </View>
              <View style={styles.amountGroup}>
                <Text style={styles.amountLabel}>Amount Paid</Text>
                <Text style={styles.amountValue}>
                  ₹{item.amount?.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {item.status === 'success' || item.status === 'completed' ? (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() =>
                  ReceiptUtils.generateReceiptPDF({
                    ...item,
                    student: studentInfo,
                    // If it's a history item, we might not have the semester mapping easily,
                    // but we can pass whatever is in item.semester
                  })
                }
              >
                <Download size={16} color={theme.colors.primary} />
                <Text style={styles.downloadText}>Download Receipt</Text>
              </TouchableOpacity>
            ) : null}
          </Surface>
        )}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  listContent: {
    padding: 20,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f8fafc',
    marginVertical: 15,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  methodValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  amountLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
    marginTop: 2,
  },
  downloadBtn: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  downloadText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default TransactionHistoryScreen;
