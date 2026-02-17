import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  Search,
  Filter,
  Briefcase,
  ChevronRight,
  MapPin,
  Calendar,
  AlertCircle,
  Menu,
  Bell,
  ArrowLeft,
} from 'lucide-react-native';
import theme from '../../theme/theme';
import { placementService } from '../../services/placementService';
import { useDrawer } from '../../context/DrawerContext';

const { width, height } = Dimensions.get('window');

const EligibleDrivesScreen = ({ navigation }) => {
  const { toggleDrawer } = useDrawer();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('All');

  const fetchDrives = useCallback(async () => {
    try {
      setLoading(true);
      const response = await placementService.getEligibleDrives();
      if (response.success) {
        setDrives(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch eligible drives:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const filteredDrives = drives.filter(drive => {
    const matchesSearch =
      drive.drive_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.job_posting?.company?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterMode === 'All' ||
      drive.mode.toLowerCase() === filterMode.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
          <Text style={styles.headerTitle}>Active Drives</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={26} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <Search
              size={20}
              color="rgba(255,255,255,0.6)"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Company or Role..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {['All', 'Online', 'In-Person'].map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => setFilterMode(mode)}
              style={[
                styles.filterTab,
                filterMode === mode && styles.activeFilterTab,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterMode === mode && styles.activeFilterTabText,
                ]}
              >
                {mode === 'All' ? 'All Modes' : mode}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Scouting opportunities...</Text>
          </View>
        ) : filteredDrives.length === 0 ? (
          <View style={styles.centerContainer}>
            <Search size={64} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No Matching Drives</Text>
            <Text style={styles.emptySub}>
              Adjust filters or check back later.
            </Text>
          </View>
        ) : (
          filteredDrives.map(drive => (
            <TouchableOpacity
              key={drive.id}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('DriveDetail', { driveId: drive.id })
              }
            >
              <Surface style={styles.driveCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.companyInfo}>
                    <View style={styles.logoBox}>
                      {drive.job_posting?.company?.logo_url ? (
                        <Image
                          source={{ uri: drive.job_posting.company.logo_url }}
                          style={styles.logo}
                        />
                      ) : (
                        <Text style={styles.logoText}>
                          {drive.job_posting?.company?.name?.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.driveTitle} numberOfLines={1}>
                        {drive.drive_name}
                      </Text>
                      <Text style={styles.companySubName}>
                        {drive.job_posting?.company?.name}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor:
                          drive.job_posting?.tier === 'Super Dream'
                            ? '#7c3aed'
                            : drive.job_posting?.tier === 'Dream'
                            ? '#4f46e5'
                            : '#1e293b',
                      },
                    ]}
                  >
                    <Text style={styles.tierBadgeText}>
                      {drive.job_posting?.tier || 'Regular'}
                    </Text>
                  </View>
                </View>

                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>PACKAGE</Text>
                    <Text style={styles.specValue}>
                      ₹{drive.job_posting?.ctc_lpa} LPA
                    </Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specLabel}>MODE</Text>
                    <Text style={styles.specValue}>{drive.mode}</Text>
                  </View>
                </View>

                <View style={styles.deadlineRow}>
                  <Calendar size={14} color="#94a3b8" />
                  <Text style={styles.deadlineLabel}>Register By:</Text>
                  <Text style={styles.deadlineValue}>
                    {new Date(drive.registration_end).toLocaleDateString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </Text>
                </View>

                <View style={styles.cardAction}>
                  {drive.hasApplied ? (
                    <View style={styles.appliedBadge}>
                      <Text style={styles.appliedText}>ALREADY APPLIED</Text>
                    </View>
                  ) : drive.isEligible ? (
                    <View style={styles.applyBtn}>
                      <Text style={styles.applyBtnText}>APPLY NOW</Text>
                      <ChevronRight size={16} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.ineligibleBadge}>
                      <AlertCircle size={14} color="#ef4444" />
                      <Text style={styles.ineligibleText}>INELIGIBLE</Text>
                    </View>
                  )}
                </View>
              </Surface>
            </TouchableOpacity>
          ))
        )}
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
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeFilterTab: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  driveCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#cbd5e1',
  },
  driveTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    width: width * 0.45,
  },
  companySubName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
  },
  specsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
  },
  specBox: {
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 5,
  },
  deadlineLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  deadlineValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  cardAction: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    marginRight: 8,
  },
  appliedBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  appliedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  ineligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  ineligibleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ef4444',
    letterSpacing: 1,
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
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

export default EligibleDrivesScreen;
