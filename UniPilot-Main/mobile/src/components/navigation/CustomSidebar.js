import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  BookOpen,
  TrendingUp,
  FileText,
  Banknote,
  Briefcase,
  BedDouble,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../../theme/theme';
import NavigationService from '../../services/NavigationService';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const CustomSidebar = ({ visible, onClose, navigation, user, onLogout }) => {
  // No animation needed here, handled by parent scale
  // This component will sit at zIndex 0

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      screen: 'Dashboard',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      screen: 'Attendance',
    },
    {
      id: 'timetable',
      label: 'My Timetable',
      icon: CalendarClock,
      screen: 'Timetable',
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: BookOpen,
      screen: 'Courses',
    }, // Placeholder - not yet in navigator
    {
      id: 'marks',
      label: 'Marks & Results',
      icon: TrendingUp,
      screen: 'Marks',
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: FileText,
      screen: 'Exams',
    },
    {
      id: 'fee',
      label: 'Fee Payments',
      icon: Banknote,
      screen: 'Fees',
    },
    {
      id: 'placement',
      label: 'My Placement',
      icon: Briefcase,
      screen: 'Placement',
    }, // Placeholder - not yet in navigator
    {
      id: 'hostel',
      label: 'My Hostel',
      icon: BedDouble,
      screen: 'Hostel',
    }, // Placeholder - not yet in navigator
  ];

  const handleNavigation = screen => {
    onClose();

    // Using global NavigationService ensures reachable screens anywhere in the tree
    try {
      NavigationService.navigate(screen);
    } catch (e) {
      console.warn(`Navigation error to ${screen}:`, e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        colors={[theme.colors.primary, '#4f46e5']}
        style={styles.header}
      > */}
      <SafeAreaView edges={['top']} style={{ flex: 0 }}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  user?.profile_picture ||
                  `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=fff&color=4f46e5&size=128`,
              }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.userRole}>
              {user?.student_id || user?.employee_id || 'ID: --'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || 'email@university.edu'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
      {/* </LinearGradient> */}

      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(255,255,255,0.1)' },
              ]}
            >
              <item.icon size={22} color="#fff" />
            </View>
            <Text style={styles.menuText}>{item.label}</Text>
            <ChevronRight
              size={20}
              color="rgba(255,255,255,0.5)"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            onClose();
            onLogout();
          }}
        >
          <LogOut size={20} color="#ff8888" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.0 • UniPilot</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,

    paddingTop: 10,
    width: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileContainer: {
    paddingHorizontal: 15,
    marginTop: Platform.OS === 'android' ? 50 : 0,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#e0e7ff',
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff8888',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
});

export default CustomSidebar;
