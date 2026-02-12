import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Menu, Bell } from 'lucide-react-native';
import theme from '../../theme/theme';
import { useDrawer } from '../../context/DrawerContext';

import ScheduleTab from './tabs/ScheduleTab';
import MyExamsTab from './tabs/MyExamsTab';
import ReverificationTab from './tabs/ReverificationTab';
import ScriptsTab from './tabs/ScriptsTab';

const Tab = createMaterialTopTabNavigator();

const ExamTabNavigator = () => {
  const { toggleDrawer } = useDrawer();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#4f46e5']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Menu size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Exams Hub</Text>

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: '#94a3b8',
          tabBarScrollEnabled: true,
          tabBarItemStyle: { width: 'auto', minWidth: 90 },
        }}
      >
        <Tab.Screen
          name="Schedule"
          component={ScheduleTab}
          options={{ tabBarLabel: 'Schedule' }}
        />
        <Tab.Screen
          name="MyExams"
          component={MyExamsTab}
          options={{ tabBarLabel: 'My Exams' }}
        />
        <Tab.Screen
          name="Reverification"
          component={ReverificationTab}
          options={{ tabBarLabel: 'Reverification' }}
        />
        <Tab.Screen
          name="Scripts"
          component={ScriptsTab}
          options={{ tabBarLabel: 'Scripts' }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 15,
  },
  menuButton: {
    padding: 5,
  },
  notificationButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabIndicator: {
    backgroundColor: theme.colors.primary,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ExamTabNavigator;
