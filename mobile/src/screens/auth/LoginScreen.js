import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Rocket,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  ChevronRight,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from '../../redux/slices/authSlice';
import authService from '../../services/authService';
import theme from '../../theme/theme';
import PremiumCard from '../../components/common/PremiumCard';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    dispatch(clearError());

    // Load remembered credentials
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');
        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Failed to load credentials', e);
      }
    };
    loadCredentials();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, fadeAnim, slideAnim]);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Required';
    if (!password.trim()) newErrors.password = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    dispatch(loginStart());
    try {
      const response = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      const token = response.data?.accessToken;
      const user = response.data?.user;

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        // Handle Remember Me
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', email.trim());
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.setItem('rememberMe', 'false');
        }

        dispatch(
          loginSuccess({
            user: user,
            token: token,
          }),
        );
      } else {
        throw new Error('Authentication failed: Token not received');
      }
    } catch (err) {
      dispatch(loginFailure(err.message || 'Verification failed'));
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Premium Background Accent */}
      <LinearGradient
        colors={[theme.colors.primary, '#4f46e5']}
        style={styles.bgGradient}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Soft Premium Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.appIconContainer}>
                <View style={styles.appIcon}>
                  <Rocket size={44} color={theme.colors.primary} />
                </View>
              </View>
              <Text style={styles.brandName}>UniPilot</Text>
              <Text style={styles.tagline}>Elevate Your Education</Text>
            </View>

            {/* Premium Form Card */}
            <PremiumCard style={styles.loginCard}>
              <View style={styles.formHeader}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subText}>
                  Sign in to your student workspace
                </Text>
              </View>

              <TextInput
                label="Email / Student ID"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                  if (error) dispatch(clearError());
                }}
                mode="flat"
                style={styles.input}
                backgroundColor="#f8fafc"
                activeUnderlineColor={theme.colors.primary}
                left={
                  <TextInput.Icon
                    icon={() => <User size={20} color="#94a3b8" />}
                  />
                }
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <TextInput
                label="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                  if (error) dispatch(clearError());
                }}
                secureTextEntry={!showPassword}
                mode="flat"
                style={styles.input}
                backgroundColor="#f8fafc"
                activeUnderlineColor={theme.colors.primary}
                left={
                  <TextInput.Icon
                    icon={() => <Lock size={20} color="#94a3b8" />}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={() =>
                      showPassword ? (
                        <EyeOff size={20} color="#94a3b8" />
                      ) : (
                        <Eye size={20} color="#94a3b8" />
                      )
                    }
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  {rememberMe ? (
                    <CheckSquare size={22} color={theme.colors.primary} />
                  ) : (
                    <Square size={22} color="#94a3b8" />
                  )}
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[theme.colors.primary, '#4f46e5']}
                  style={styles.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                  </Text>
                  {!loading && <ChevronRight size={24} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>
            </PremiumCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Contact UniPilot AP</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Platform.OS === 'android' ? 32 : 28,
    justifyContent: 'center',
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  appIconContainer: {
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    marginBottom: 16,
  },
  appIcon: {
    width: 86,
    height: 86,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  loginCard: {
    padding: 28,
    backgroundColor: '#fff',
  },
  formHeader: {
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  input: {
    marginBottom: 14,
    fontSize: 15,
    height: 60,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotBtn: {
    // marginBottom removed as it's now in optionsRow
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#fff1f2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  errorBannerText: {
    color: '#e11d48',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    height: 62,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 35,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  footerLink: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LoginScreen;
