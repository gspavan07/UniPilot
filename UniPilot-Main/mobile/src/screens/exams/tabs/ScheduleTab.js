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
  Calendar,
  Clock,
  MapPin,
  Award,
  Download,
  RefreshCw,
} from 'lucide-react-native';
import theme from '../../../theme/theme';
import examService from '../../../services/examService';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const ScheduleTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [subTab, setSubTab] = useState('upcoming'); // upcoming | completed
  const [downloading, setDownloading] = useState(null);
  const user = useSelector(state => state.auth.user);

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await examService.getMySchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  const handleDownloadHallTicket = async (cycleId, cycleName) => {
    setDownloading(cycleId);
    try {
      const result = await examService.downloadHallTicket(
        cycleId,
        cycleName,
        user?.student_id || 'Student',
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

  // Group schedules by cycle
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const cycleId = schedule.cycle?.id || schedule.exam_cycle_id;
    if (!acc[cycleId]) {
      acc[cycleId] = {
        id: cycleId,
        name: schedule.cycle?.name || 'Exam Cycle',
        type: schedule.cycle?.cycle_type,
        instance: schedule.cycle?.instance_number,
        latest_date: schedule.exam_date,
        schedules: [],
      };
    }
    acc[cycleId].schedules.push(schedule);
    if (schedule.exam_date > acc[cycleId].latest_date) {
      acc[cycleId].latest_date = schedule.exam_date;
    }
    return acc;
  }, {});

  const today = new Date().toISOString().split('T')[0];
  const cycles = Object.values(groupedSchedules);
  const upcomingCycles = cycles.filter(c => c.latest_date >= today);
  const completedCycles = cycles.filter(c => c.latest_date < today);
  const activeCycles = subTab === 'upcoming' ? upcomingCycles : completedCycles;

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
            onPress={() => setSubTab('upcoming')}
            style={[
              styles.tabButton,
              subTab === 'upcoming' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                subTab === 'upcoming' && styles.tabButtonTextActive,
              ]}
            >
              UPCOMING ({upcomingCycles.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSubTab('completed')}
            style={[
              styles.tabButton,
              subTab === 'completed' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                subTab === 'completed' && styles.tabButtonTextActive,
              ]}
            >
              COMPLETED ({completedCycles.length})
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
        {activeCycles.length > 0 ? (
          activeCycles.map(cycleInfo => (
            <Surface key={cycleInfo.id} style={styles.cycleCard}>
              {/* Cycle Header */}
              <View style={styles.cycleHeader}>
                <View style={styles.cycleHeaderLeft}>
                  <View style={styles.cycleIconBox}>
                    <Calendar size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.cycleInfo}>
                    <Text style={styles.cycleName}>{cycleInfo.name}</Text>
                    <View style={styles.cycleBadges}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {cycleInfo.type?.replace('_', ' ')}
                        </Text>
                      </View>
                      {cycleInfo.instance && (
                        <View style={[styles.badge, styles.badgePurple]}>
                          <Text style={styles.badgeText}>
                            Instance {cycleInfo.instance}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {subTab === 'upcoming' && (
                  <TouchableOpacity
                    onPress={() =>
                      handleDownloadHallTicket(cycleInfo.id, cycleInfo.name)
                    }
                    disabled={downloading === cycleInfo.id}
                    style={styles.downloadButton}
                  >
                    {downloading === cycleInfo.id ? (
                      <RefreshCw size={16} color="#fff" />
                    ) : (
                      <Download size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Schedule List */}
              <View style={styles.scheduleList}>
                {cycleInfo.schedules.map(schedule => (
                  <View key={schedule.id} style={styles.scheduleItem}>
                    <View style={styles.scheduleIconBox}>
                      <Award size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.scheduleDetails}>
                      <Text style={styles.courseName}>
                        {schedule.course?.name}
                      </Text>
                      <Text style={styles.courseCode}>
                        {schedule.course?.code}
                      </Text>
                      <View style={styles.scheduleMetaRow}>
                        <View style={styles.metaItem}>
                          <Calendar size={12} color="#94a3b8" />
                          <Text style={styles.metaText}>
                            {new Date(schedule.exam_date).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Clock size={12} color="#94a3b8" />
                          <Text style={styles.metaText}>
                            {schedule.start_time?.substring(0, 5)} -{' '}
                            {schedule.end_time?.substring(0, 5)}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MapPin size={12} color="#ef4444" />
                          <Text style={styles.metaText}>
                            {schedule.venue || 'TBA'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </Surface>
          ))
        ) : (
          <Surface style={styles.emptyCard}>
            <Calendar size={64} color="#e0e7ff" />
            <Text style={styles.emptyTitle}>
              {subTab === 'upcoming' ? 'Timetable Clear' : 'No Past Records'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {subTab === 'upcoming'
                ? 'Examination schedules are currently being processed.'
                : 'No past examination records found.'}
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
  cycleCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cycleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cycleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cycleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cycleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  cycleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  badgePurple: {
    backgroundColor: '#9333ea15',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  scheduleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleDetails: {
    flex: 1,
    marginLeft: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  courseCode: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
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

export default ScheduleTab;
