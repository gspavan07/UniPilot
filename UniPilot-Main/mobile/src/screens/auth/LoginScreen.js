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
  TextInput as RNTextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rocket, User, Lock, Eye, EyeOff } from 'lucide-react-native';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from '../../redux/slices/authSlice';
import authService from '../../services/authService';
import theme from '../../theme/theme';

const { width } = Dimensions.get('window');

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  secureTextEntry,
  rightIcon: RightIcon,
  onRightIconPress,
  keyboardType,
  autoCapitalize,
  id,
  focusedInput,
  setFocusedInput,
  errors,
  error,
  dispatch,
  clearError,
}) => {
  const isFocused = focusedInput === id;

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        {id === 'password' && (
          <TouchableOpacity
            onPress={() => {
              /* Handle forgot password */
            }}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          errors[id] && styles.inputContainerError,
        ]}
      >
        <View style={styles.inputIcon}>
          <Icon
            size={20}
            color={isFocused ? theme.colors.primary : '#94a3b8'}
          />
        </View>
        <RNTextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocusedInput(id)}
          onBlur={() => setFocusedInput(null)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {RightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <RightIcon size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
      {errors[id] && <Text style={styles.errorText}>{errors[id]}</Text>}
    </View>
  );
};

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(clearError());

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [dispatch, fadeAnim]);

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
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {/* Logo Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoBox}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandTitle}>Unipilot</Text>
            </View>

            {/* Welcome Text */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Please enter your details to continue.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <CustomInput
                id="email"
                label="Student ID"
                placeholder="Enter your ID"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                  if (error) dispatch(clearError());
                }}
                icon={User}
                autoCapitalize="none"
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
                errors={errors}
                error={error}
                dispatch={dispatch}
                clearError={clearError}
              />

              <CustomInput
                id="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                  if (error) dispatch(clearError());
                }}
                icon={Lock}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconPress={() => setShowPassword(!showPassword)}
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
                errors={errors}
                error={error}
                dispatch={dispatch}
                clearError={clearError}
              />

              {error && (
                <Text
                  style={[
                    styles.errorText,
                    { textAlign: 'center', marginBottom: 10 },
                  ]}
                >
                  {error}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.signInButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.signInButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                Having trouble?{' '}
                <Text style={styles.supportLink}>Contact Support</Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginLeft: 5,
    marginTop: 3,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginTop: 15,
  },
  welcomeSection: {
    marginBottom: 35,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  formSection: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    height: 62,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  rightIcon: {
    padding: 5,
  },
  errorText: {
    color: theme.colors.text.error,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  signInButton: {
    height: 62,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  signInButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
  },
  footerSection: {
    marginTop: 'auto',
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  supportLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
