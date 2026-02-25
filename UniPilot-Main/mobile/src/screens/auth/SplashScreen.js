import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../../theme/theme';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import splashLogo from '../../assets/splash_logo.png';

const { width } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = width * 0.55;

const STATUS_MESSAGES = [
  'Connecting...',
  'Loading your data...',
  'Preparing for you...',
];

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false,
    }).start();

    // Cycle through status messages
    const messageInterval = setInterval(() => {
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStatusIndex(prev => {
          const next = prev + 1;
          if (next >= STATUS_MESSAGES.length) {
            clearInterval(messageInterval);
            return prev;
          }
          return next;
        });
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 900);

    // Restore session and navigate
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');

        console.log('Restoring Session - Token exists:', !!token);

        setTimeout(() => {
          if (token && userData) {
            dispatch(
              loginSuccess({
                token,
                user: JSON.parse(userData),
              }),
            );
          } else {
            navigation.replace('Login');
          }
        }, 3000);
      } catch (error) {
        console.error('Session restoration error:', error);
        navigation.replace('Login');
      }
    };

    restoreSession();

    return () => clearInterval(messageInterval);
  }, [dispatch, navigation, fadeAnim, scaleAnim, progressAnim, textFadeAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={splashLogo}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      {/* Loading Section */}
      <Animated.View style={[styles.loadingSection, { opacity: fadeAnim }]}>
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressAnimated, { width: progressWidth }]}
          >
            <LinearGradient
              colors={['#fff', '#fff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: PROGRESS_BAR_WIDTH }]}
            />
          </Animated.View>
        </View>

        {/* Status Text */}
        <Animated.Text style={[styles.statusText, { opacity: textFadeAnim }]}>
          {STATUS_MESSAGES[statusIndex]}
        </Animated.Text>
      </Animated.View>
      {/* Footer
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Made with ❤️ in AP, India</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 300,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    marginTop: 40,
  },
  progressTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressAnimated: {
    height: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    borderRadius: 3,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default SplashScreen;
