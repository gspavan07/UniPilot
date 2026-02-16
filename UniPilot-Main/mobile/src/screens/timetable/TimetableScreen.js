import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  CalendarClock,
  Info,
  Gift,
} from 'lucide-react-native';
import {
  fetchMyTimetable,
  fetchHolidays,
  fetchSettings,
} from '../../redux/slices/timetableSlice';
import theme from '../../theme/theme';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const TimetableScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTimetable, holidays, isSatWorking, status } = useSelector(
    state => state.timetable,
  );
  const { user } = useSelector(state => state.auth);

  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  );

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  if (isSatWorking) days.push('Saturday');

  useEffect(() => {
    dispatch(fetchMyTimetable());
    const target = user?.role === 'student' ? 'student' : 'staff';
    dispatch(fetchHolidays(target));
    const settingKey =
      user?.role === 'student'
        ? 'student_saturday_working'
        : 'staff_saturday_working';
    dispatch(fetchSettings(settingKey));
  }, [dispatch, user]);

  const filteredSlots =
    currentTimetable?.slots?.filter(s => s.day_of_week === selectedDay) || [];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <ChevronLeft size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Weekly Schedule</Text>
        <Text style={styles.headerSubtitle}>
          {currentTimetable?.program?.name || 'Classes & Venues'}
        </Text>
      </View>
      <View style={styles.headerIcon}>
        <CalendarClock size={28} color={theme.colors.primary} />
      </View>
    </View>
  );

  const renderDayPicker = () => (
    <View style={styles.dayPickerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayPickerContent}
      >
        {days.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[styles.dayTab, selectedDay === day && styles.activeDayTab]}
          >
            <Text
              style={[
                styles.dayTabText,
                selectedDay === day && styles.activeDayTabText,
              ]}
            >
              {day.substring(0, 3)}
            </Text>
            {selectedDay === day && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHolidayAlert = () => {
    if (!holidays || holidays.length === 0) return null;
    const holiday = holidays[0];
    return (
      <LinearGradient
        colors={['#fffbeb', '#fef3c7']}
        style={styles.holidayAlert}
      >
        <View style={styles.holidayIconBox}>
          <Gift size={20} color="#d97706" />
        </View>
        <View style={styles.holidayInfo}>
          <Text style={styles.holidayLabel}>UPCOMING BREAK</Text>
          <Text style={styles.holidayName}>{holiday.name}</Text>
          <Text style={styles.holidayDate}>
            {new Date(holiday.date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const renderSlot = slot => (
    <View key={slot.id} style={styles.slotCard}>
      <View
        style={[
          styles.slotIndicator,
          {
            backgroundColor: slot.activity_name
              ? '#f59e0b'
              : theme.colors.primary,
          },
        ]}
      />

      <View style={styles.slotContent}>
        <View style={styles.slotHeader}>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#64748b" />
            <Text style={styles.timeText}>
              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
            </Text>
          </View>
          {slot.activity_name && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>ACTIVITY</Text>
            </View>
          )}
        </View>

        <Text style={styles.courseName}>
          {slot.activity_name || slot.course?.name || 'Untitled Session'}
        </Text>

        {slot.course?.code && (
          <Text style={styles.courseCode}>{slot.course.code}</Text>
        )}

        <View style={styles.slotFooter}>
          <View style={styles.metaItem}>
            <MapPin size={12} color="#64748b" />
            <Text style={styles.metaText}>
              {slot.room?.room_number || slot.room_number || 'TBD'}
            </Text>
          </View>

          {(slot.faculty?.name || slot.faculty_id) && (
            <View style={styles.metaItem}>
              <User size={12} color="#64748b" />
              <Text style={styles.metaText}>
                {slot.faculty?.name
                  ? slot.faculty.name.split(' ')[0]
                  : 'Faculty'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Fetching your schedule...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderDayPicker()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderHolidayAlert()}

        {filteredSlots.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#e2e8f0" strokeWidth={1} />
            <Text style={styles.emptyStateTitle}>No Classes Scheduled</Text>
            <Text style={styles.emptyStateSub}>
              Take a breather! No sessions for {selectedDay}.
            </Text>
          </View>
        ) : (
          filteredSlots.map(renderSlot)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  headerIcon: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  dayPickerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayPickerContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dayTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeDayTab: {
    // Styling for active tab if needed
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  activeDayTabText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  holidayAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  holidayIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  holidayInfo: {
    flex: 1,
  },
  holidayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 1,
    marginBottom: 2,
  },
  holidayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#78350f',
  },
  holidayDate: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '600',
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  slotIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 15,
  },
  slotContent: {
    flex: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 5,
  },
  activityBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  activityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ea580c',
  },
  courseName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 22,
  },
  courseCode: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
  },
  slotFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 20,
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TimetableScreen;
