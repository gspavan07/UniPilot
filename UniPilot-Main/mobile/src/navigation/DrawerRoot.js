import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { useDrawer } from '../context/DrawerContext';
import { useAlert } from '../context/AlertContext';
import CustomSidebar from '../components/navigation/CustomSidebar';
import { logout } from '../redux/slices/authSlice';
import theme from '../theme/theme';

const { width } = Dimensions.get('window');

const DrawerRoot = ({ navigation, children }) => {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { showAlert } = useAlert();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Animation Interpolations
  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const borderRadius = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 26],
  });

  const translateX = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.65],
  });

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen]);

  const confirmLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      confirmLabel: 'Logout',
      secondaryLabel: 'Cancel',
      onConfirm: async () => {
        await AsyncStorage.removeItem('authToken');
        dispatch(logout());
      },
      onSecondary: () => {},
    });
  };

  return (
    <View style={styles.outerContainer}>
      {/* 1. Background Menu Layer */}
      <View style={styles.menuLayer}>
        <CustomSidebar
          navigation={navigation}
          user={user}
          onClose={closeDrawer}
          onLogout={confirmLogout}
        />
      </View>

      {/* 2. Scalable Content Layer (Wraps TabNavigator) */}
      <Animated.View
        style={[
          styles.mainContainer,
          {
            transform: [{ scale }, { translateX }],
            borderRadius,
            overflow: 'hidden',
          },
        ]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={isDrawerOpen ? theme.colors.primary : 'transparent'}
          translucent
        />

        {/* Overlay to close drawer on tap */}
        {isDrawerOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        )}

        {/* The Actual App Content (TabNavigator) */}
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  menuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    width: width * 0.75,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Ensure this sits on top of everything inside the scaled view
    backgroundColor: 'transparent',
  },
});

export default DrawerRoot;
