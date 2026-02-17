import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  Briefcase,
  BadgeCheck,
  Clock,
  UserCircle,
  ChevronRight,
  ArrowRight,
  Menu,
  Bell,
  TrendingUp,
  Target,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import theme from '../../theme/theme';
import { placementService } from '../../services/placementService';
import { useDrawer } from '../../context/DrawerContext';

const { width } = Dimensions.get('window');

const PlacementDashboardScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { toggleDrawer } = useDrawer();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    eligibleDrives: [],
    myApplications: [],
    myOffers: [],
    myProfile: null,
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await placementService.getPlacementStats();
      if (data.success) {
        setStats({
          eligibleDrives: data.eligibleDrives,
          myApplications: data.myApplications,
          myOffers: data.myOffers,
          myProfile: data.myProfile,
        });
      }
    } catch (error) {
      console.error('Failed to fetch placement stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  console.log(stats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const profileCompletion = stats.myProfile ? 85 : 0;

  const statCards = [
    {
      label: 'Eligible',
      value: stats.eligibleDrives.length,
      icon: Briefcase,
      color: '#3b82f6',
      screen: 'EligibleDrives',
    },
    {
      label: 'Applied',
      value: stats.myApplications.length,
      icon: Clock,
      color: '#8b5cf6',
      screen: 'ApplicationHistory',
    },
    {
      label: 'Offers',
      value: stats.myOffers.length,
      icon: BadgeCheck,
      color: '#10b981',
      screen: 'MyOffers',
    },
  ];

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, '#2563eb']}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Menu size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Placement Portal</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={26} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Hello, {user?.first_name}!</Text>
          <Text style={styles.subWelcomeText}>
            Your professional journey starts here.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading career data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => navigation.navigate(card.screen)}
              activeOpacity={0.7}
              style={[styles.statCardWrapper, { width: (width - 60) / 3 }]}
            >
              <Surface style={styles.statCard}>
                <View
                  style={[
                    styles.statIconBox,
                    { backgroundColor: card.color + '15' },
                  ]}
                >
                  <card.icon size={20} color={card.color} />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Readiness Widget */}
        <Surface style={styles.readinessCard}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.readinessGradient}
          >
            <View style={{ padding: 24 }}>
              <View style={styles.readinessHeader}>
                <View>
                  <Text style={styles.readinessLabel}>PROFILE STATUS</Text>
                  <Text style={styles.readinessTitle}>Readiness</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PlacementProfile')}
                >
                  <Surface style={styles.optimizeBtn}>
                    <Text style={styles.optimizeBtnText}>OPTIMIZE</Text>
                  </Surface>
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressPercent}>
                    {profileCompletion}%
                  </Text>
                  <Text style={styles.progressStatus}>Completed</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${profileCompletion}%` },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.readinessTip}>
                Complete profiles are{' '}
                <Text style={styles.boldTip}>3x more likely</Text> to get
                shortlisted by top-tier firms.
              </Text>
            </View>
          </LinearGradient>
        </Surface>

        {/* Latest Opportunities Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Opportunities</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EligibleDrives')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {stats.eligibleDrives.length === 0 ? (
          <Surface style={styles.emptyDrivesCard}>
            <Briefcase size={40} color="#e2e8f0" />
            <Text style={styles.emptyDrivesText}>No active drives yet.</Text>
          </Surface>
        ) : (
          stats.eligibleDrives.slice(0, 3).map((drive, idx) => (
            <TouchableOpacity
              key={drive.id}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('DriveDetail', { driveId: drive.id })
              }
            >
              <Surface style={styles.opportunityCard}>
                <View style={styles.companyBox}>
                  {drive.job_posting?.company?.logo_url ? (
                    <Image
                      source={{ uri: drive.job_posting.company.logo_url }}
                      style={styles.companyLogo}
                    />
                  ) : (
                    <View style={styles.placeholderLogo}>
                      <Text style={styles.placeholderLogoText}>
                        {drive.job_posting?.company?.name?.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.opportunityInfo}>
                  <Text style={styles.driveName} numberOfLines={1}>
                    {drive.drive_name}
                  </Text>
                  <Text style={styles.companyName}>
                    {drive.job_posting?.company?.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.ctcText}>
                      ₹{drive.job_posting?.ctc_lpa} LPA
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.tierText}>
                      {drive.job_posting?.tier || 'Regular'}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={20} color="#cbd5e1" />
              </Surface>
            </TouchableOpacity>
          ))
        )}

        {/* Quick Links */}
        {/* <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Manage Career</Text>
        </View>
        <View style={styles.quickLinksRow}>
          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('ApplicationHistory')}
          >
            <Surface style={styles.quickLinkCircle}>
              <TrendingUp size={22} color={theme.colors.primary} />
            </Surface>
            <Text style={styles.quickLinkLabel}>Funnel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('PlacementProfile')}
          >
            <Surface style={styles.quickLinkCircle}>
              <UserCircle size={22} color={theme.colors.primary} />
            </Surface>
            <Text style={styles.quickLinkLabel}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('MyOffers')}
          >
            <Surface style={styles.quickLinkCircle}>
              <Target size={22} color={theme.colors.primary} />
            </Surface>
            <Text style={styles.quickLinkLabel}>Offers</Text>
          </TouchableOpacity>
        </View> */}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingBottom: Platform.OS === 'android' ? 25 : 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 20,
  },
  menuButton: {
    padding: 5,
  },
  notificationButton: {
    padding: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 34,
  },
  subWelcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: -45,
    marginBottom: 24,
  },
  statCardWrapper: {
    height: 110,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  readinessCard: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
  },
  readinessGradient: {
    // padding: 24,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  readinessLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: 1.5,
  },
  readinessTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  optimizeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optimizeBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  progressSection: {
    marginBottom: 15,
    // padding: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progressPercent: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    marginRight: 6,
  },
  progressStatus: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  readinessTip: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  boldTip: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  opportunityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  companyBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginRight: 16,
    overflow: 'hidden',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  opportunityInfo: {
    flex: 1,
  },
  driveName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctcText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  emptyDrivesCard: {
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  emptyDrivesText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickLinkItem: {
    width: (width - 60) / 3,
    alignItems: 'center',
  },
  quickLinkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
});

export default PlacementDashboardScreen;
