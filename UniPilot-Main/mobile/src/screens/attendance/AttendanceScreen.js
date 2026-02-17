import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  ActivityIndicator,
  ProgressBar,
  Surface,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  AlertCircle,
  ChevronLeft,
  CalendarX,
  Menu,
  Bell,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import PremiumCard from '../../components/common/PremiumCard';
import attendanceService from '../../services/attendanceService';
import { useDrawer } from '../../context/DrawerContext';

const { width } = Dimensions.get('window');

const AttendanceScreen = () => {
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const { toggleDrawer } = useDrawer();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'history'
  const [selectedSemester, setSelectedSemester] = useState(
    user?.current_semester || 1,
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const attendanceDataRef = useRef(null);

  const fetchAttendance = useCallback(
    async semester => {
      // Only show main loader if we have no data at all (first load)
      if (!attendanceDataRef.current) setLoading(true);
      try {
        const data = await attendanceService.getMyAttendance({
          semester: semester || selectedSemester,
        });
        setAttendanceData(data);
        attendanceDataRef.current = data;
      } catch (error) {
        console.error('Attendance fetch error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedSemester],
  );

  useEffect(() => {
    // Initial animation only once on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchAttendance(selectedSemester);
  }, [selectedSemester, fetchAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance(selectedSemester);
  };

  const renderSummaryHeader = () => (
    <View style={styles.summaryHeader}>
      <View style={styles.overallStats}>
        <View style={styles.overallCircle}>
          <Text style={styles.overallValue}>
            {attendanceData?.summary?.percentage || 0}%
          </Text>
          <Text style={styles.overallLabel}>Overall</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={[styles.miniValue, { color: '#10b981' }]}>
              {attendanceData?.summary?.present || 0}
            </Text>
            <Text style={styles.miniLabel}>Present</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.miniStat}>
            <Text style={[styles.miniValue, { color: '#ef4444' }]}>
              {(attendanceData?.summary?.total || 0) -
                (attendanceData?.summary?.present || 0)}
            </Text>
            <Text style={styles.miniLabel}>Absent</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.miniStat}>
            <Text style={styles.miniValue}>
              {attendanceData?.summary?.total || 0}
            </Text>
            <Text style={styles.miniLabel}>Total</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSubjectItem = ({ item }) => (
    <PremiumCard style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <View>
          <Text style={styles.subjectName}>{item.course_name}</Text>
          <Text style={styles.subjectCode}>{item.course_code}</Text>
        </View>
        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor:
                parseFloat(item.percentage) < 75 ? '#fee2e2' : '#ecfdf5',
            },
          ]}
        >
          <Text
            style={[
              styles.percentText,
              {
                color: parseFloat(item.percentage) < 75 ? '#ef4444' : '#10b981',
              },
            ]}
          >
            {item.percentage}%
          </Text>
        </View>
      </View>

      <ProgressBar
        progress={parseFloat(item.percentage) / 100}
        color={
          parseFloat(item.percentage) < 75 ? '#ef4444' : theme.colors.primary
        }
        style={styles.progressBar}
      />

      <View style={styles.subjectFooter}>
        <Text style={styles.footerText}>
          Classes: {item.present}/{item.total}
        </Text>
        {parseFloat(item.percentage) < 75 && (
          <View style={styles.warningBox}>
            <AlertCircle size={14} color="#ef4444" />
            <Text style={styles.warningText}>Low Attendance</Text>
          </View>
        )}
      </View>
    </PremiumCard>
  );

  const renderHistoryItem = ({ item }) => (
    <Surface style={styles.historyItem} elevation={1}>
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor: item.status === 'present' ? '#10b981' : '#ef4444',
          },
        ]}
      />
      <View style={styles.historyContent}>
        <View style={styles.historyMain}>
          <Text style={styles.historySubject}>
            {item.course?.name || 'General'}
          </Text>
          <Text style={styles.historyDate}>
            {new Date(item.date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.historyMeta}>
          <Text
            style={[
              styles.statusText,
              { color: item.status === 'present' ? '#10b981' : '#ef4444' },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
          <Text style={styles.instructorText}>
            {item.instructor ? `By ${item.instructor.last_name}` : ''}
          </Text>
        </View>
      </View>
    </Surface>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={[theme.colors.primary, '#2563eb']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Menu size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Attendance Tracker</Text>

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={26} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Semester Selector */}
          <View style={styles.semesterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.semesterScroll}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <TouchableOpacity
                  key={sem}
                  onPress={() => setSelectedSemester(sem)}
                  style={[
                    styles.semBadge,
                    selectedSemester === sem && styles.activeSemBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.semText,
                      selectedSemester === sem && styles.activeSemText,
                    ]}
                  >
                    SEM {sem}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {renderSummaryHeader()}
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'summary' && styles.activeTabText,
            ]}
          >
            Course Summary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText,
            ]}
          >
            Recent History
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        {activeTab === 'summary' ? (
          <FlatList
            data={attendanceData?.courseWise || []}
            renderItem={renderSubjectItem}
            keyExtractor={item => item.course_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CalendarX size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>
                  No attendance records found
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={attendanceData?.records || []}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    marginBottom: 20,
  },

  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#4f46e5',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  semesterWrapper: {
    marginBottom: 20,
  },
  semesterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  semBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeSemBadge: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  semText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  activeSemText: {
    color: theme.colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryHeader: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  overallStats: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  overallCircle: {
    width: 120,
    height: 120,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  overallValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  overallLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 15,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniStat: {
    alignItems: 'center',
    width: '30%',
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  miniLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subjectCard: {
    padding: 20,
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    width: width * 0.5,
  },
  subjectCode: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
    marginLeft: 4,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 6,
  },
  historyContent: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyMain: {
    flex: 1,
  },
  historySubject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  historyDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  historyMeta: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  instructorText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default AttendanceScreen;
