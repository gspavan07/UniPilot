import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  Menu,
  Bell,
  CalendarCheck,
  TrendingUp,
  CalendarClock,
  Banknote,
  Home,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import PremiumCard from '../../components/common/PremiumCard';
import CircularProgress from '../../components/common/CircularProgress';
import dashboardService from '../../services/dashboardService';
import { useDrawer } from '../../context/DrawerContext';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { toggleDrawer } = useDrawer();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await dashboardService.getDashboard(user?.current_semester);

      // 1. Map Attendance
      const att = data.attendance;
      const attendance = {
        overall: parseFloat(att.percentage) || 0,
        present: att.present || 0,
        absent: (att.total || 0) - (att.present || 0),
        total: att.total || 0,
      };

      // 2. Map Schedule (Filter for Today)
      const formatTime = timeString => {
        if (!timeString) return '';
        const parts = timeString.split(':');
        if (parts.length < 2) return timeString;
        return `${parts[0]}:${parts[1]}`;
      };

      const getSlotStatus = (startTime, endTime) => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        console.log(currentMinutes);
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startTotal = startHour * 60 + startMin;
        const endTotal = endHour * 60 + endMin;
        console.log(startTotal, endTotal);

        if (currentMinutes < startTotal) return 'COMPLETED';
        if (currentMinutes >= startTotal && currentMinutes <= endTotal)
          return 'ON-GOING';
        return 'UPCOMING';
      };

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const schedule = (data.timetable?.slots || [])
        .filter(slot => slot.day_of_week === today)
        .map(slot => ({
          id: slot.id,
          subject: slot.course?.name || slot.activity_name || 'Self Study',
          time: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
          room: slot.room?.room_number || slot.room_number || 'TBD',
          faculty: slot.faculty?.name || 'N/A',
          status: getSlotStatus(slot.start_time, slot.end_time),
        }));

      setDashboardData({ attendance, schedule });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchDashboardData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const quickActions = [
    {
      id: 1,
      name: 'Attendance',
      icon: CalendarCheck,
      color: '#6366f1',
      screen: 'Attendance',
    },
    {
      id: 2,
      name: 'Marks',
      icon: TrendingUp,
      color: '#10b981',
      screen: 'Marks',
    },
    {
      id: 3,
      name: 'Timetable',
      icon: CalendarClock,
      color: '#f59e0b',
      screen: 'Timetable',
    },
    {
      id: 4,
      name: 'Fees',
      icon: Banknote,
      color: '#ef4444',
      screen: 'Fees',
    },
    {
      id: 5,
      name: 'Hostel',
      icon: Home,
      color: '#6366f1',
      screen: 'Hostel',
    },
  ].filter(action => {
    if (action.name === 'Hostel') return !!user?.is_hosteller;
    return true;
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Subtle Premium Header */}
      <LinearGradient
        colors={[theme.colors.primary, '#2563eb']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Menu size={28} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/8074/8074800.png', // Placeholder College Logo
              }}
              style={styles.collegeLogo}
              resizeMode="contain"
            />

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={26} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greetingText}>{greeting},</Text>
              <Text style={styles.userName}>
                {user?.first_name || 'Student'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarContainer}
            >
              <Avatar.Text
                size={46}
                label={user?.first_name?.charAt(0) || 'P'}
                style={styles.avatar}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Enhanced Attendance Card */}
          <PremiumCard style={styles.mainFeatureCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Attendance Overview</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {user?.department?.code} - {user?.current_semester} SEM
                </Text>
              </View>
            </View>

            <View style={styles.attendanceBody}>
              <View style={styles.progressCircleContainer}>
                <CircularProgress
                  value={dashboardData?.attendance?.overall || 0}
                  size={120}
                  strokeWidth={8}
                  color={theme.colors.primary}
                  label="Overall"
                />
              </View>

              <View style={styles.statsList}>
                <View style={styles.statLine}>
                  <Text style={styles.statLabel}>Present</Text>
                  <Text style={[styles.statValue, { color: '#10b981' }]}>
                    {dashboardData?.attendance?.present}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statLine}>
                  <Text style={styles.statLabel}>Absent</Text>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>
                    {dashboardData?.attendance?.absent}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statLine}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statValue}>
                    {dashboardData?.attendance?.total}
                  </Text>
                </View>
              </View>
            </View>
          </PremiumCard>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              {quickActions.map(action => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => navigation.navigate(action.screen)}
                  style={styles.actionItem}
                  activeOpacity={0.7}
                >
                  <PremiumCard style={styles.actionCard}>
                    <View
                      style={[
                        styles.actionIconContainer,
                        { backgroundColor: action.color + '10' },
                      ]}
                    >
                      <action.icon size={26} color={action.color} />
                    </View>
                    <Text style={styles.actionName}>{action.name}</Text>
                  </PremiumCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Today's Schedule</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {dashboardData?.schedule?.length > 0 ? (
              dashboardData.schedule.map((item, index) => (
                <PremiumCard key={item.id} style={styles.scheduleTile}>
                  <View style={styles.scheduleRow}>
                    <View
                      style={[
                        styles.indicator,
                        {
                          backgroundColor:
                            item.status === 'ON-GOING'
                              ? '#10b981'
                              : item.status === 'UPCOMING'
                              ? '#6366f1'
                              : '#94a3b8',
                        },
                      ]}
                    />
                    <View style={styles.scheduleTimeBox}>
                      <Text style={styles.timeLabel}>
                        {item.time.split(' - ')[0]}
                      </Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                      <Text style={styles.facultyMeta}>
                        Room {item.room} • {item.faculty}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.nowBadge,
                        {
                          backgroundColor:
                            item.status === 'ON-GOING'
                              ? '#ecfdf5'
                              : item.status === 'UPCOMING'
                              ? '#eef2ff'
                              : '#f1f5f9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.nowText,
                          {
                            color:
                              item.status === 'ON-GOING'
                                ? '#10b981'
                                : item.status === 'UPCOMING'
                                ? '#6366f1'
                                : '#64748b',
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </PremiumCard>
              ))
            ) : (
              <PremiumCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No classes scheduled for today
                </Text>
              </PremiumCard>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    paddingBottom: Platform.OS === 'android' ? 10 : 30,
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
  collegeLogo: {
    width: 36,
    height: 36,
    // tintColor: '#fff',
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
    borderColor: '#2563eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    // marginBottom: 10,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    padding: 2,
  },
  avatar: {
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 15 : -15,
  },
  scrollContent: {
    paddingHorizontal: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 40,
  },
  mainFeatureCard: {
    padding: 20,
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  attendanceBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginRight: 24,
  },
  statsList: {
    flex: 1,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 56) / 2,
    marginBottom: 16,
  },
  actionCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  scheduleTile: {
    padding: 18,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15,
  },
  scheduleTimeBox: {
    width: 60,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  scheduleInfo: {
    flex: 1,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  facultyMeta: {
    fontSize: 13,
    color: '#94a3b8',
  },
  nowBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nowText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6366f1',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default DashboardScreen;
