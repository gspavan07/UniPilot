import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import {
  History,
  CheckCircle2,
  Download,
  RefreshCw,
  Award,
  Clock,
  Receipt,
} from 'lucide-react-native';
import theme from '../../../theme/theme';
import examService from '../../../services/examService';

const { width } = Dimensions.get('window');

const MyExamsTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [subTab, setSubTab] = useState('active'); // active | history
  const [downloading, setDownloading] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      const data = await examService.getMyRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistrations();
  };

  const handleDownloadReceipt = async (registrationId, cycleName) => {
    setDownloading(`receipt-${registrationId}`);
    try {
      const result = await examService.downloadReceipt(
        registrationId,
        cycleName,
        registrationId.toString(),
      );
      if (result.success) {
        alert(`Receipt downloaded to ${result.path}`);
      }
    } catch (error) {
      alert('Failed to download receipt');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadHallTicket = async (cycleId, cycleName) => {
    setDownloading(`hall-${cycleId}`);
    try {
      const result = await examService.downloadHallTicket(
        cycleId,
        cycleName,
        'Student',
      );
      if (result.success) {
        alert(`Hall ticket downloaded to ${result.path}`);
      }
    } catch (error) {
      alert('Failed to download hall ticket');
    } finally {
      setDownloading(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const activeRegistrations = registrations.filter(
    r => r.cycle?.reg_end_date && r.cycle.reg_end_date >= today,
  );
  const historyRegistrations = registrations.filter(
    r => !r.cycle?.reg_end_date || r.cycle.reg_end_date < today,
  );

  const displayRegistrations =
    subTab === 'active' ? activeRegistrations : historyRegistrations;

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
            onPress={() => setSubTab('active')}
            style={[
              styles.tabButton,
              subTab === 'active' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                subTab === 'active' && styles.tabButtonTextActive,
              ]}
            >
              ACTIVE ({activeRegistrations.length})
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
              HISTORY ({historyRegistrations.length})
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
        {displayRegistrations.length > 0 ? (
          displayRegistrations.map(reg => (
            <Surface key={reg.id} style={styles.registrationCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          reg.fee_status === 'paid' ? '#10b98115' : '#f59e0b15',
                      },
                    ]}
                  >
                    {reg.fee_status === 'paid' ? (
                      <CheckCircle2 size={24} color="#10b981" />
                    ) : (
                      <Clock size={24} color="#f59e0b" />
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cycleName}>{reg.cycle?.name}</Text>
                    <Text style={styles.cycleSubtitle}>
                      {reg.cycle?.exam_month} {reg.cycle?.exam_year}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        reg.fee_status === 'paid' ? '#10b98115' : '#f59e0b15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          reg.fee_status === 'paid' ? '#10b981' : '#f59e0b',
                      },
                    ]}
                  >
                    {reg.fee_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Total Fee</Text>
                  <Text style={styles.feeValue}>₹{reg.total_fee || 0}</Text>
                </View>

                {reg.fee_status === 'paid' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() =>
                        handleDownloadReceipt(reg.id, reg.cycle?.name)
                      }
                      disabled={downloading === `receipt-${reg.id}`}
                      style={styles.actionButton}
                    >
                      {downloading === `receipt-${reg.id}` ? (
                        <RefreshCw size={16} color={theme.colors.primary} />
                      ) : (
                        <Receipt size={16} color={theme.colors.primary} />
                      )}
                      <Text style={styles.actionText}>Receipt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleDownloadHallTicket(
                          reg.exam_cycle_id,
                          reg.cycle?.name,
                        )
                      }
                      disabled={downloading === `hall-${reg.exam_cycle_id}`}
                      style={[styles.actionButton, styles.actionButtonPrimary]}
                    >
                      {downloading === `hall-${reg.exam_cycle_id}` ? (
                        <RefreshCw size={16} color="#fff" />
                      ) : (
                        <Download size={16} color="#fff" />
                      )}
                      <Text style={styles.actionTextWhite}>Hall Ticket</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Surface>
          ))
        ) : (
          <Surface style={styles.emptyCard}>
            <History size={64} color="#e0e7ff" />
            <Text style={styles.emptyTitle}>No Registrations</Text>
            <Text style={styles.emptySubtitle}>
              {subTab === 'active'
                ? 'You have no active exam registrations.'
                : 'No past registration records found.'}
            </Text>
          </Surface>
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
  registrationCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cycleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  cycleSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feeValue: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MyExamsTab;
