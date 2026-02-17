import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  BookOpen,
  Search,
  Award,
  ChevronRight,
  X,
  List,
  Target,
  Clock,
  Menu,
  Bell,
  ArrowRight,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import theme from '../../theme/theme';
import { courseService } from '../../services/courseService';
import { useDrawer } from '../../context/DrawerContext';

const { width, height } = Dimensions.get('window');

const MyCoursesScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { toggleDrawer } = useDrawer();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState({
    outcomes: [],
    matrix: null,
    loading: false,
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getMyCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleViewCourse = async course => {
    setSelectedCourse(course);
    setCourseDetails(prev => ({ ...prev, loading: true }));

    try {
      const [outcomesRes, matrixRes] = await Promise.all([
        courseService.getCourseOutcomes(course.id),
        course.program_id
          ? courseService.getCOPOMatrix(course.id, course.program_id)
          : Promise.resolve({ success: false }),
      ]);

      setCourseDetails({
        outcomes: outcomesRes.success ? outcomesRes.data : [],
        matrix: matrixRes.success ? matrixRes.data : null,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      setCourseDetails(prev => ({ ...prev, loading: false }));
    }
  };

  const semesters = ['All', ...new Set(courses.map(c => c.semester))].sort(
    (a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a - b),
  );

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      selectedSemester === 'All' || course.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

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
          <Text style={styles.headerTitle}>My Courses</Text>
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
              placeholder="Search courses..."
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

  const renderSyllabusModal = () => (
    <Modal
      visible={!!selectedCourse}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedCourse(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalSubTitle}>{selectedCourse?.code}</Text>
              <Text style={styles.modalTitle}>{selectedCourse?.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedCourse(null)}
              style={styles.closeButton}
            >
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {selectedCourse?.description && (
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIndicator} />
                  <Text style={styles.sectionTitle}>Executive Summary</Text>
                </View>
                <Surface style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>
                    {selectedCourse.description}
                  </Text>
                </Surface>
              </View>
            )}

            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>Learning Modules</Text>
              </View>
              {selectedCourse?.syllabus_data?.length > 0 ? (
                selectedCourse.syllabus_data.map((unit, idx) => (
                  <Surface key={idx} style={styles.unitCard}>
                    <View style={styles.unitHeader}>
                      <View style={styles.unitBadge}>
                        <Text style={styles.unitBadgeLabel}>UNIT</Text>
                        <Text style={styles.unitBadgeValue}>{unit.unit}</Text>
                      </View>
                      <Text style={styles.unitTitle}>{unit.title}</Text>
                    </View>
                    <View style={styles.topicsList}>
                      {unit.topics.map((topic, tIdx) => (
                        <View key={tIdx} style={styles.topicItem}>
                          <ChevronRight
                            size={14}
                            color={theme.colors.primary}
                          />
                          <Text style={styles.topicText}>{topic}</Text>
                        </View>
                      ))}
                    </View>
                  </Surface>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  Curriculum pending for this course.
                </Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>Competency Outcomes</Text>
              </View>
              {courseDetails.loading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : courseDetails.outcomes.length > 0 ? (
                courseDetails.outcomes.map((co, idx) => (
                  <Surface key={idx} style={styles.outcomeCard}>
                    <View style={styles.outcomeHeader}>
                      <Text style={styles.outcomeCode}>
                        {co.co_code || `CO${idx + 1}`}
                      </Text>
                      <Text style={styles.outcomeTarget}>
                        Target: {co.target_attainment}%
                      </Text>
                    </View>
                    <Text style={styles.outcomeDesc}>{co.description}</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${co.target_attainment || 60}%` },
                        ]}
                      />
                    </View>
                  </Surface>
                ))
              ) : (
                <Text style={styles.emptyText}>No outcomes specified.</Text>
              )}
            </View>

            {courseDetails.matrix && (
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIndicator} />
                  <Text style={styles.sectionTitle}>
                    CO-PO Alignment Matrix
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Surface style={styles.matrixContainer}>
                    <View style={styles.matrixRow}>
                      <View style={styles.matrixHeaderCell}>
                        <Text style={styles.matrixHeaderText}>CO</Text>
                      </View>
                      {courseDetails.matrix.programOutcomes.map(po => (
                        <View key={po.id} style={styles.matrixHeaderCell}>
                          <Text style={styles.matrixHeaderText}>
                            {po.po_code}
                          </Text>
                        </View>
                      ))}
                    </View>
                    {courseDetails.matrix.courseOutcomes.map(co => (
                      <View key={co.id} style={styles.matrixRow}>
                        <View style={styles.matrixLabelCell}>
                          <Text style={styles.matrixLabelText}>
                            {co.co_code}
                          </Text>
                        </View>
                        {courseDetails.matrix.programOutcomes.map(po => {
                          const weight =
                            courseDetails.matrix.matrix[co.id]?.[po.id] || 0;
                          return (
                            <View key={po.id} style={styles.matrixCell}>
                              {weight > 0 ? (
                                <View
                                  style={[
                                    styles.weightBadge,
                                    {
                                      backgroundColor:
                                        weight === 3
                                          ? theme.colors.primary
                                          : weight === 2
                                          ? theme.colors.primary + '20'
                                          : '#f1f5f9',
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.weightText,
                                      {
                                        color:
                                          weight === 3
                                            ? '#fff'
                                            : weight === 2
                                            ? theme.colors.primary
                                            : '#94a3b8',
                                      },
                                    ]}
                                  >
                                    {weight}
                                  </Text>
                                </View>
                              ) : (
                                <Text style={styles.matrixDot}>·</Text>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </Surface>
                </ScrollView>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
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
          {semesters.map(sem => (
            <TouchableOpacity
              key={sem}
              onPress={() => setSelectedSemester(sem)}
              style={[
                styles.semTab,
                selectedSemester === sem && styles.activeSemTab,
              ]}
            >
              <Text
                style={[
                  styles.semTabText,
                  selectedSemester === sem && styles.activeSemTabText,
                ]}
              >
                {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
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
            <Text style={styles.loadingText}>Syncing Curriculum...</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.centerContainer}>
            <Search size={64} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search or filters.
            </Text>
          </View>
        ) : (
          filteredCourses.map(course => (
            <TouchableOpacity
              key={course.id}
              activeOpacity={0.7}
              onPress={() => handleViewCourse(course)}
            >
              <Surface style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <View style={styles.semBadge}>
                    <Text style={styles.semBadgeText}>
                      SEM {course.semester}
                    </Text>
                  </View>
                </View>
                <Text style={styles.courseName}>{course.name}</Text>

                <View style={styles.courseMeta}>
                  <View style={styles.metaTag}>
                    <View style={styles.metaIcon}>
                      {course.course_type === 'LAB' ? (
                        <Clock size={12} color={theme.colors.primary} />
                      ) : (
                        <BookOpen size={12} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={styles.metaLabel}>
                      {course.course_type === 'LAB' ? 'Practical' : 'Theory'}
                    </Text>
                  </View>
                  <View style={styles.metaTag}>
                    <View style={styles.metaIcon}>
                      <Award size={12} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.metaLabel}>{course.credits} Unit</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.arrowIcon}>
                    <ArrowRight size={18} color="#94a3b8" />
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {renderSyllabusModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    // paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    // paddingBottom: 15,
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
    paddingBottom: 15,
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
  semTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeSemTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  semTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  activeSemTabText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseCode: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  semBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  semBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    lineHeight: 24,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    height: '92%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalSubTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 30,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  modalContent: {
    padding: 24,
  },
  detailSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334155',
  },
  descriptionBox: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },
  unitCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
    elevation: 2,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 15,
  },
  unitBadge: {
    width: 46,
    height: 46,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  unitBadgeLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
    marginBottom: -2,
  },
  unitBadgeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  unitTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  topicsList: {
    gap: 10,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  topicText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  outcomeCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
    elevation: 2,
  },
  outcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  outcomeCode: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  outcomeTarget: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  outcomeDesc: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 15,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  matrixContainer: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixHeaderCell: {
    width: 50,
    paddingVertical: 15,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
  },
  matrixLabelCell: {
    width: 50,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  matrixLabelText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1e293b',
  },
  matrixCell: {
    width: 50,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightText: {
    fontSize: 12,
    fontWeight: '900',
  },
  matrixDot: {
    fontSize: 20,
    color: '#e2e8f0',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MyCoursesScreen;
