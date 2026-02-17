import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import {
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  UserCircle,
  BadgeIndianRupee,
  FileText,
  User,
} from 'lucide-react-native';
import theme from '../theme/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import MarksScreen from '../screens/marks/MarksScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ExamsScreen from '../screens/exams/ExamsScreen';
import FeeDashboardScreen from '../screens/fee/FeeDashboardScreen';
import FeeLedgerScreen from '../screens/fee/FeeLedgerScreen';
import TransactionHistoryScreen from '../screens/fee/TransactionHistoryScreen';
import TimetableScreen from '../screens/timetable/TimetableScreen';
import MyCoursesScreen from '../screens/courses/MyCoursesScreen';
import PlacementDashboardScreen from '../screens/placement/PlacementDashboardScreen';
import EligibleDrivesScreen from '../screens/placement/EligibleDrivesScreen';
import ApplicationHistoryScreen from '../screens/placement/ApplicationHistoryScreen';
import PlacementProfileScreen from '../screens/placement/PlacementProfileScreen';
import DriveDetailScreen from '../screens/placement/DriveDetailScreen';
import ApplyDriveScreen from '../screens/placement/ApplyDriveScreen';

// Hostel Screens
import HostelDashboardScreen from '../screens/hostel/HostelDashboardScreen';
import RequestGatePassScreen from '../screens/hostel/RequestGatePassScreen';
import ReportComplaintScreen from '../screens/hostel/ReportComplaintScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TAB_BAR_HEIGHT = 70;

// Custom Tab Bar Background using SVG
const TabBarBackground = () => {
  const w = width;
  const h = TAB_BAR_HEIGHT;
  const center = w / 2;
  const holeWidth = 90;
  const curveDepth = 35;

  const path = `
    M0 0
  H${center - holeWidth / 2 - 10}
  C${center - holeWidth / 2 + 10} 0,
   ${center - holeWidth / 2 + 10} ${curveDepth},
   ${center} ${curveDepth}
  C${center + holeWidth / 2 - 10} ${curveDepth},
   ${center + holeWidth / 2 - 10} 0,
   ${center + holeWidth / 2 + 10} 0
  H${w}
  V${h + 50}
  H0
  Z
  `;
  return (
    <View style={styles.svgContainer}>
      <Svg width={w} height={h + 50} style={styles.svg}>
        <Path d={path} fill="#fff" />
      </Svg>
    </View>
  );
};

// Custom TabBar Component to specifically control visible items
const CustomTabBar = ({ state, descriptors, navigation }) => {
  // Only render these specific routes in the tab bar
  const visibleRoutes = ['Dashboard', 'Attendance', 'Profile', 'Marks', 'Fees'];

  return (
    <View style={styles.tabBarContainer}>
      <TabBarBackground />
      <View style={styles.buttonsContainer}>
        {state.routes.map((route, index) => {
          if (!visibleRoutes.includes(route.name)) return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Custom render for central profile button
          if (route.name === 'Profile') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.centerButtonContainer}
                activeOpacity={0.9}
              >
                <View style={styles.centerButton}>
                  <User size={30} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }

          // Render Normal Tab Buttons
          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                {Icon &&
                  Icon({
                    focused: isFocused,
                    color: isFocused ? theme.colors.primary : '#94a3b8',
                    size: 24,
                  })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarCheck size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />

      <Tab.Screen
        name="Marks"
        component={MarksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Fees"
        component={FeeDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BadgeIndianRupee size={size} color={color} />
          ),
        }}
      />

      {/* Module Hidden Screens - They stay in the navigator to keep the bar visible */}
      <Tab.Screen name="Exams" component={ExamsScreen} />
      <Tab.Screen name="FeeLedger" component={FeeLedgerScreen} />
      <Tab.Screen
        name="TransactionHistoryScreen"
        component={TransactionHistoryScreen}
      />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Courses" component={MyCoursesScreen} />
      <Tab.Screen name="Placement" component={PlacementDashboardScreen} />
      <Tab.Screen name="EligibleDrives" component={EligibleDrivesScreen} />
      <Tab.Screen
        name="ApplicationHistory"
        component={ApplicationHistoryScreen}
      />
      <Tab.Screen name="PlacementProfile" component={PlacementProfileScreen} />
      <Tab.Screen name="DriveDetail" component={DriveDetailScreen} />
      <Tab.Screen name="ApplyDrive" component={ApplyDriveScreen} />

      {/* Hostel Screens */}
      <Tab.Screen name="Hostel" component={HostelDashboardScreen} />
      <Tab.Screen name="RequestGatePass" component={RequestGatePassScreen} />
      <Tab.Screen name="ReportComplaint" component={ReportComplaintScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    height: TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? 20 : 20),
    backgroundColor: 'transparent',
    overflow: 'visible',
    zIndex: 9999,
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? 10 : 10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'visible',
  },
  svg: {
    // handled by container
  },
  buttonsContainer: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    width: width,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: Platform.OS === 'ios' ? -35 : -30,
    height: 70,
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: '#f8fafc',
  },
});

export default TabNavigator;
