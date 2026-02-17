import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  Shield,
  Wrench,
  ChevronLeft,
  Plus,
  Search,
  History,
  Ticket,
  Menu,
  Bell,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import PremiumCard from '../../components/common/PremiumCard';
import {
  fetchGatePasses,
  fetchComplaints,
} from '../../redux/slices/hostelSlice';
import { useDrawer } from '../../context/DrawerContext';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const HostelDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { gatePasses, complaints, status } = useSelector(state => state.hostel);
  const { user } = useSelector(state => state.auth);
  const { toggleDrawer } = useDrawer();

  const [activeTab, setActiveTab] = useState('gate-pass');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(() => {
    dispatch(fetchGatePasses());
    dispatch(fetchComplaints());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  };

  const tabs = [
    { id: 'gate-pass', label: 'Gate Pass', icon: Shield },
    { id: 'complaints', label: 'Complaints', icon: Wrench },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const renderGatePasses = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Requests</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RequestGatePass')}
        >
          <View style={styles.addButton}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>New Request</Text>
          </View>
        </TouchableOpacity>
      </View>

      {gatePasses.length > 0 ? (
        gatePasses.map(pass => (
          <PremiumCard key={pass.id} style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <View style={styles.typeBadge}>
                <Ticket size={14} color={theme.colors.primary} />
                <Text style={styles.typeText}>
                  {pass.pass_type === 'day' ? 'Day Outing' : 'Long Leave'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(pass.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(pass.status) },
                  ]}
                >
                  {pass.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.destinationText}>{pass.destination}</Text>
              <Text style={styles.dateText}>
                {new Date(pass.going_date).toLocaleDateString()} •{' '}
                {pass.expected_out_time}
              </Text>
            </View>
            {pass.status === 'pending' && (
              <View style={styles.otpBanner}>
                <Text style={styles.otpTitle}>PARENT OTP</Text>
                <Text style={styles.otpValue}>{pass.parent_otp}</Text>
              </View>
            )}
          </PremiumCard>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Search size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No active passes</Text>
          <Text style={styles.emptySubtitle}>
            Your gate pass requests will appear here
          </Text>
        </View>
      )}
    </View>
  );

  const renderComplaints = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Maintenance Issues</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ReportComplaint')}
        >
          <View style={[styles.addButton, { backgroundColor: '#ef4444' }]}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Report Issue</Text>
          </View>
        </TouchableOpacity>
      </View>

      {complaints.length > 0 ? (
        complaints.map(complaint => (
          <PremiumCard key={complaint.id} style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeBadge, { backgroundColor: '#fee2e2' }]}>
                <Wrench size={14} color="#ef4444" />
                <Text style={[styles.typeText, { color: '#ef4444' }]}>
                  {complaint.complaint_type.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(complaint.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(complaint.status) },
                  ]}
                >
                  {complaint.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.destinationText}>
                {complaint.description}
              </Text>
              <Text style={styles.dateText}>
                Room {complaint.room?.room_number} • Priority:{' '}
                {complaint.priority}
              </Text>
            </View>
          </PremiumCard>
        ))
      ) : (
        <View style={styles.emptyState}>
          <History size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptySubtitle}>
            Maintenance requests will appear here
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[theme.colors.primary, '#2563eb']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Menu size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>My Hostel</Text>

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={26} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          >
            <tab.icon
              size={18}
              color={activeTab === tab.id ? '#fff' : '#94a3b8'}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'gate-pass' ? renderGatePasses() : renderComplaints()}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#1e293b',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  activeTabLabel: {
    color: '#fff',
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  contentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 6,
  },
  dataCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  otpBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginTop: 8,
  },
  otpTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9a3412',
  },
  otpValue: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#cbd5e1',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HostelDashboardScreen;
