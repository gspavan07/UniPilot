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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../../theme/theme';
import PremiumCard from '../../components/common/PremiumCard';
import marksService from '../../services/marksService';

const { width } = Dimensions.get('window');

const MarksScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState(null);
  const [activeTab, setActiveTab] = useState('end_semester'); // 'end_semester', 'mid_term', 'internal_lab'
  const [selectedSemester, setSelectedSemester] = useState(
    user?.current_semester || 1,
  );
  const [selectedMidInstance, setSelectedMidInstance] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resultsDataRef = useRef(null);

  const fetchResults = useCallback(
    async semester => {
      if (!resultsDataRef.current) setLoading(true);
      try {
        const response = await marksService.getMyResults({
          semester: semester || selectedSemester,
        });
        // The backend returns as { success: true, data: { myResults, gpa } }
        setResultsData(response.data);
        resultsDataRef.current = response.data;
      } catch (error) {
        console.error('Marks fetch error:', error);
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
    fetchResults(selectedSemester);
  }, [selectedSemester, fetchResults]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults(selectedSemester);
  };

  const getAvailableMidInstances = () => {
    if (!resultsData?.data?.mid_term) return [];
    const instances = Array.from(
      new Set(
        resultsData.data.mid_term.map(
          m => m.schedule?.cycle?.instance_number || 1,
        ),
      ),
    ).sort((a, b) => a - b);
    return instances;
  };

  const currentMidInstances = getAvailableMidInstances();

  const getActiveResults = () => {
    if (!resultsData?.data) return [];
    const myResults = resultsData.data;

    if (activeTab === 'mid_term') {
      const mids = myResults.mid_term || [];
      if (currentMidInstances.length <= 1) return mids;
      return mids.filter(
        m => (m.schedule?.cycle?.instance_number || 1) === selectedMidInstance,
      );
    }
    if (activeTab === 'internal_lab') {
      return [
        ...(myResults.internal_lab || []),
        ...(myResults.external_lab || []),
      ];
    }
    if (activeTab === 'end_semester') return myResults.end_semester || [];
    return [];
  };

  const renderGradeBadge = grade => {
    const isPass = grade && grade !== 'F';
    return (
      <View
        style={[
          styles.gradeBadge,
          { backgroundColor: isPass ? '#ecfdf5' : '#fee2e2' },
        ]}
      >
        <Text
          style={[styles.gradeText, { color: isPass ? '#10b981' : '#ef4444' }]}
        >
          {grade || 'NA'}
        </Text>
      </View>
    );
  };

  const renderResultItem = ({ item }) => {
    const scores = item.component_scores || {};
    const totalCredits = item.schedule?.course?.credits || 3;
    const earnedCredits = item.grade === 'F' ? 0 : totalCredits;

    return (
      <Surface style={styles.resultCard} elevation={1}>
        <View style={styles.resultHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.courseName}>{item.schedule?.course?.name}</Text>
            <Text style={styles.courseCode}>{item.schedule?.course?.code}</Text>
          </View>
          {activeTab === 'end_semester' && renderGradeBadge(item.grade)}
          {(activeTab === 'mid_term' || activeTab === 'internal_lab') && (
            <View style={styles.marksBadge}>
              <Text style={styles.marksValue}>{item.marks_obtained}</Text>
              <Text style={styles.marksLabel}>Marks</Text>
            </View>
          )}
        </View>

        {activeTab === 'mid_term' && (
          <View style={styles.componentScores}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Assignment</Text>
              <Text style={styles.scoreValue}>{scores.Assignment ?? '-'}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Objective</Text>
              <Text style={styles.scoreValue}>{scores.Objective ?? '-'}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Descriptive</Text>
              <Text style={styles.scoreValue}>{scores.Descriptive ?? '-'}</Text>
            </View>
          </View>
        )}

        {activeTab === 'end_semester' && (
          <View style={styles.creditsRow}>
            <Icon name="book-open-variant" size={16} color="#64748b" />
            <Text style={styles.creditsText}>
              Credits: {earnedCredits} / {totalCredits}
            </Text>
          </View>
        )}
      </Surface>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, '#4f46e5']}
      style={styles.headerGradient}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Academic Results</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Icon name="download" size={20} color="#fff" />
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

        {/* GPA & Credits Summary Grid */}
        <View style={styles.summaryGrid}>
          {/* SEM GPA */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {resultsData?.gpa?.currentSemester || '0.00'}
            </Text>
            <Text style={styles.summaryLabel}>SEM GPA</Text>
          </View>

          {/* OVERALL CGPA - Premium Style */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.gradientFill}
            >
              <Text style={[styles.summaryValue, { color: '#fff' }]}>
                {resultsData?.gpa?.overall || '0.00'}
              </Text>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: 'rgba(255,255,255,0.8)' },
                ]}
              >
                OVERALL CGPA
              </Text>
              <Icon
                name="trophy"
                size={24}
                color="rgba(255,255,255,0.3)"
                style={styles.summaryIcon}
              />
            </LinearGradient>
          </View>

          {/* SEM CREDITS */}
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { fontSize: 20 }]}>
              {resultsData?.gpa?.semesterGainedCredits || 0}
              <Text style={{ fontSize: 14, color: '#94a3b8' }}>
                /{resultsData?.gpa?.semesterPossibleCredits || 0}
              </Text>
            </Text>
            <Text style={styles.summaryLabel}>SEM CREDITS</Text>
          </View>

          {/* TOTAL CREDITS */}
          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryValue,
                { fontSize: 20, color: theme.colors.primary },
              ]}
            >
              {resultsData?.gpa?.totalGainedCredits || 0}
              <Text style={{ fontSize: 14, color: '#94a3b8' }}>
                /{resultsData?.gpa?.totalPossibleCredits || 0}
              </Text>
            </Text>
            <Text style={styles.summaryLabel}>TOTAL CREDITS</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const currentResults = getActiveResults();

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {renderHeader()}

      <View style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabBar}>
          {[
            { id: 'end_semester', label: 'Semester End' },
            { id: 'mid_term', label: 'Mid-Terms' },
            { id: 'internal_lab', label: 'Internal/Lab' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mid Instance Selector */}
        {activeTab === 'mid_term' && currentMidInstances.length > 1 && (
          <View style={styles.midInstanceRow}>
            {currentMidInstances.map(inst => (
              <TouchableOpacity
                key={inst}
                onPress={() => setSelectedMidInstance(inst)}
                style={[
                  styles.midInstBtn,
                  selectedMidInstance === inst && styles.activeMidInstBtn,
                ]}
              >
                <Text
                  style={[
                    styles.midInstText,
                    selectedMidInstance === inst && styles.activeMidInstText,
                  ]}
                >
                  MID {inst}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && !refreshing && !resultsData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={currentResults}
            renderItem={renderResultItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="chart-pie" size={80} color="#e2e8f0" />
                <Text style={styles.emptyText}>No results published yet</Text>
              </View>
            }
          />
        )}
      </View>
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
    paddingVertical: 100,
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 12,
  },
  semBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: '800',
  },
  activeSemText: {
    color: theme.colors.primary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Extra spacing for iOS
  },
  summaryCard: {
    width: (width - 52) / 2, // 2 columns with gaps
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // Ensures gradient respects borderRadius
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 15,
  },
  premiumCgpaCard: {
    shadowColor: '#d97706',
    shadowOpacity: 0.3,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? -20 : 0,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // paddingTop: 15,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: '#f8fafc',
  },
  tab: {
    flex: 1,
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // iOS shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        borderRadius: 14,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#fff',
      },
    }),
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        borderRadius: 14,
        elevation: 6,
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
    }),
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '800',
  },
  midInstanceRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  midInstBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#edf2f7',
  },
  activeMidInstBtn: {
    backgroundColor: theme.colors.primary,
  },
  midInstText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#718096',
  },
  activeMidInstText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '900',
  },
  marksBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  marksValue: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  marksLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  componentScores: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  creditsText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 15,
  },
});

export default MarksScreen;
