import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  Clock,
  TrendingUp,
  CheckCircle,
  Menu,
  Bell,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp as FunnelIcon,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import { placementService } from '../../services/placementService';
import { useDrawer } from '../../context/DrawerContext';

const { width } = Dimensions.get('window');

const ApplicationHistoryScreen = ({ navigation }) => {
  const { toggleDrawer } = useDrawer();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await placementService.getMyApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const stages = [
    { label: 'Applied', key: 'applied', icon: Clock },
    { label: 'Shortlisted', key: 'shortlisted', icon: TrendingUp },
    { label: 'Technical', key: 'technical_interview', icon: FunnelIcon },
    { label: 'Hired', key: 'placed', icon: CheckCircle },
  ];

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, '#2563eb']}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Placement')}
            style={styles.menuButton}
          >
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Funnel</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={26} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.progressText}>Track Your Professional Path</Text>
          <View style={styles.statsSummary}>
            <View style={styles.statBox}>
              <Text style={styles.statLine1}>{applications.length}</Text>
              <Text style={styles.statLine2}>TOTAL</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statLine1, { color: '#fbbf24' }]}>
                {applications.filter(a => a.status === 'Placed').length}
              </Text>
              <Text style={styles.statLine2}>HIRED</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.centerContainer}>
            <TrendingUp size={64} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>Funnel is Empty</Text>
            <Text style={styles.emptySub}>
              Your applications will appear here.
            </Text>
          </View>
        ) : (
          applications.map(app => (
            <Surface key={app.id} style={styles.appCard}>
              <View style={styles.cardInfo}>
                <View style={styles.companyIconBox}>
                  <Building2 size={24} color="#94a3b8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driveTitle}>{app.drive?.drive_name}</Text>
                  <Text style={styles.companyName}>
                    {app.drive?.job_posting?.company?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('DriveDetail', {
                      driveId: app.drive_id,
                    })
                  }
                >
                  <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              <View style={styles.funnelTracker}>
                {stages.map((stage, idx) => {
                  const isCompleted =
                    app.status === 'Placed' ||
                    (app.status === 'Shortlisted' && idx <= 1) ||
                    idx === 0;
                  const isActive =
                    (app.status === 'Placed' && idx === 3) ||
                    (app.status === 'Shortlisted' && idx === 1) ||
                    (app.status === 'Applied' && idx === 0);

                  return (
                    <View key={stage.key} style={styles.stageItem}>
                      <View
                        style={[
                          styles.stageIndicator,
                          isCompleted && styles.completedIndicator,
                          isActive && styles.activeIndicator,
                        ]}
                      >
                        <stage.icon
                          size={14}
                          color={isCompleted ? '#fff' : '#cbd5e1'}
                          strokeWidth={isCompleted ? 3 : 2}
                        />
                      </View>
                      <Text
                        style={[
                          styles.stageLabel,
                          isCompleted && styles.completedLabel,
                          isActive && styles.activeLabel,
                        ]}
                      >
                        {stage.label}
                      </Text>
                      {idx < stages.length - 1 && (
                        <View
                          style={[
                            styles.connector,
                            isCompleted && styles.completedConnector,
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Calendar size={14} color="#94a3b8" />
                  <Text style={styles.footerValue}>
                    Applied on {new Date(app.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Surface>
          ))
        )}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 15,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 20,
  },
  statsSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLine1: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  statLine2: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    padding: 20,
  },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  companyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  driveTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  funnelTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  stageItem: {
    alignItems: 'center',
    width: 60,
  },
  stageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    zIndex: 2,
  },
  completedIndicator: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  activeIndicator: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#cbd5e1',
    textTransform: 'uppercase',
  },
  completedLabel: {
    color: '#1e293b',
  },
  activeLabel: {
    color: theme.colors.primary,
  },
  connector: {
    position: 'absolute',
    left: 45,
    top: 15,
    width: 45,
    height: 2,
    backgroundColor: '#f1f5f9',
    zIndex: 1,
  },
  completedConnector: {
    backgroundColor: theme.colors.primary,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerValue: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
  },
});

export default ApplicationHistoryScreen;
