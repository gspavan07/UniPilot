import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Platform,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  ActivityIndicator,
  Surface,
  TextInput,
  Button,
  Portal,
  Modal,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  Info,
  GraduationCap,
  Contact,
  Users,
  History,
  FileText,
  UserCircle,
  User,
  Mail,
  Phone,
  CheckCircle,
  Calendar,
  AlignLeft,
  BookOpen,
  Building2,
  CalendarDays,
  Hash,
  School,
  Award,
  IdCard,
  Fingerprint,
  Cake,
  Droplet,
  MapPin,
  UserCog,
  Heart,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Medal,
  FileStack,
  File,
  Check,
  Clock,
  Menu,
  Bell,
  FileX,
  Settings,
  KeyRound,
  ChevronRight,
  LogOut,
  HelpCircle,
} from 'lucide-react-native';

const ICON_MAP = {
  information: Info,
  school: GraduationCap,
  personal: Contact, // Mapped for tab id generic
  'account-details': Contact,
  family: Users, // Mapped for tab id generic
  'account-group': Users,
  history: History,
  documents: FileStack, // Mapped for tab id generic
  'file-document': FileText,
  'account-circle': UserCircle,
  account: User,
  email: Mail,
  phone: Phone,
  'check-circle': CheckCircle,
  calendar: Calendar,
  'text-subject': AlignLeft,
  'book-open-variant': BookOpen,
  'office-building': Building2,
  'calendar-star': CalendarDays,
  'numeric-1-box': Hash,
  'google-classroom': School,
  'file-certificate': Award,
  'card-account-details-outline': IdCard,
  fingerprint: Fingerprint,
  'calendar-heart': Cake,
  'gender-male-female': Users,
  water: Droplet,
  'map-marker-outline': MapPin,
  'account-tie': UserCog,
  'account-heart': Heart,
  'shield-alert': ShieldAlert,
  'shield-account': ShieldCheck,
  'phone-alert': PhoneCall,
  medal: Medal,
  'file-document-multiple': FileStack,
  'file-pdf-box': File,
  check: Check,
  'clock-outline': Clock,
  'file-cancel': FileX,
  cog: Settings,
  'key-variant': KeyRound,
  'chevron-right': ChevronRight,
  logout: LogOut,
};

const DynamicIcon = ({ name, size, color, style }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent size={size} color={color} style={style} />;
};
import theme from '../../theme/theme';
import { logout } from '../../redux/slices/authSlice';
import profileService from '../../services/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDrawer } from '../../context/DrawerContext';
import { useAlert } from '../../context/AlertContext';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { user } = useSelector(state => state.auth);
  const { toggleDrawer } = useDrawer();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isStudent = user?.role?.toLowerCase() === 'student';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'information' },
    ...(isStudent
      ? [
          { id: 'academic', label: 'Academic', icon: 'school' },
          { id: 'personal', label: 'Personal', icon: 'account-details' },
          { id: 'family', label: 'Family', icon: 'account-group' },
          { id: 'history', label: 'History', icon: 'history' },
          { id: 'documents', label: 'Documents', icon: 'file-document' },
        ]
      : []),
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
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

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await profileService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordModal(false);
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailItem = (label, value, icon) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
        <DynamicIcon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const SectionTitle = ({ title, icon }) => (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIconBg}>
        <DynamicIcon name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="Account Overview" icon="account-circle" />
      <Surface style={styles.contentCard}>
        {renderDetailItem(
          'Full Name',
          `${user?.first_name} ${user?.last_name}`,
          'account',
        )}
        {renderDetailItem('Official Email', user?.email, 'email')}
        {renderDetailItem('Phone Number', user?.phone, 'phone')}
        {renderDetailItem(
          'Account Status',
          user?.is_active ? 'Active' : 'Inactive',
          'check-circle',
        )}
        {renderDetailItem('Joining Date', user?.joining_date, 'calendar')}
      </Surface>

      <SectionTitle title="About / Bio" icon="text-subject" />
      <Surface style={styles.contentCard}>
        <Text style={styles.bioText}>
          {user?.bio || 'No profile description provided yet.'}
        </Text>
      </Surface>
    </View>
  );

  const renderAcademic = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="Enrollment Details" icon="school" />
      <Surface style={styles.contentCard}>
        {renderDetailItem('Program', user?.program?.name, 'book-open-variant')}
        {renderDetailItem(
          'Department',
          user?.department?.name,
          'office-building',
        )}
        {renderDetailItem('Batch Year', user?.batch_year, 'calendar-star')}
        {renderDetailItem(
          'Current Semester',
          `Semester ${user?.current_semester || '1'}`,
          'numeric-1-box',
        )}
        {renderDetailItem(
          'Section',
          `Section ${user?.section || 'A'}`,
          'google-classroom',
        )}
        {renderDetailItem(
          'Regulation',
          user?.regulation?.name,
          'file-certificate',
        )}
      </Surface>
    </View>
  );

  const renderPersonal = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="Identity Info" icon="card-account-details-outline" />
      <Surface style={styles.contentCard}>
        {renderDetailItem('Aadhaar #', user?.aadhaar_number, 'fingerprint')}
        {renderDetailItem(
          'Date of Birth',
          user?.date_of_birth,
          'calendar-heart',
        )}
        {renderDetailItem(
          'Gender',
          user?.gender?.toUpperCase(),
          'gender-male-female',
        )}
        {renderDetailItem('Blood Group', user?.blood_group, 'water')}
      </Surface>

      <SectionTitle title="Address Details" icon="map-marker-outline" />
      <Surface style={styles.contentCard}>
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>Current Residence</Text>
          <Text style={styles.addressValue}>
            {user?.address || 'N/A'}
            {'\n'}
            {user?.city}, {user?.state} - {user?.zip_code}
          </Text>
        </View>
      </Surface>
    </View>
  );

  const renderFamily = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="Parent Info" icon="account-group" />
      <Surface style={styles.contentCard}>
        {renderDetailItem(
          "Father's Name",
          user?.parent_details?.father_name,
          'account-tie',
        )}
        {renderDetailItem(
          "Father's Phone",
          user?.parent_details?.father_mobile,
          'phone',
        )}
        {renderDetailItem(
          "Mother's Name",
          user?.parent_details?.mother_name,
          'account-heart',
        )}
        {renderDetailItem(
          "Mother's Phone",
          user?.parent_details?.mother_mobile,
          'phone',
        )}
      </Surface>

      <SectionTitle title="Emergency Contact" icon="shield-alert" />
      <Surface
        style={[
          styles.contentCard,
          { borderLeftColor: '#f59e0b', borderLeftWidth: 4 },
        ]}
      >
        {renderDetailItem(
          'Guardian',
          user?.parent_details?.guardian_name,
          'shield-account',
        )}
        {renderDetailItem(
          'Guardian Phone',
          user?.parent_details?.guardian_mobile,
          'phone-alert',
        )}
      </Surface>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="Education History" icon="history" />
      {user?.previous_academics?.length > 0 ? (
        user.previous_academics.map((edu, idx) => (
          <Surface key={idx} style={styles.eduCard}>
            <View style={styles.eduHeader}>
              <View style={styles.eduIconBox}>
                <DynamicIcon
                  name="medal"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eduQual}>
                  {edu.qualification || edu.board}
                </Text>
                <Text style={styles.eduSchool}>
                  {edu.school} ({edu.year})
                </Text>
              </View>
              <View style={styles.eduScoreBox}>
                <Text style={styles.eduScoreText}>{edu.percentage}%</Text>
                <Text style={styles.eduScoreLabel}>SCORE</Text>
              </View>
            </View>
          </Surface>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <DynamicIcon name="history" size={64} color="#e2e8f0" />
          <Text style={styles.emptyText}>No historical records found</Text>
        </View>
      )}
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="My Documents" icon="file-document-multiple" />
      <View style={styles.docGrid}>
        {user?.documents?.length > 0 ? (
          user.documents.map((doc, idx) => (
            <Surface key={idx} style={styles.docCard}>
              <View style={styles.docIconBox}>
                <DynamicIcon name="file-pdf-box" size={32} color="#ef4444" />
                <View
                  style={[
                    styles.docStatus,
                    {
                      backgroundColor:
                        doc.status === 'approved' ? '#10b981' : '#f59e0b',
                    },
                  ]}
                >
                  <DynamicIcon
                    name={doc.status === 'approved' ? 'check' : 'clock-outline'}
                    size={12}
                    color="#fff"
                  />
                </View>
              </View>
              <Text numberOfLines={1} style={styles.docName}>
                {doc.name}
              </Text>
              <Text style={styles.docType}>{doc.type}</Text>
              <TouchableOpacity
                style={styles.viewDocBtn}
                onPress={() => Linking.openURL(`${doc.file_url}`)}
              >
                <Text style={styles.viewDocText}>VIEW</Text>
              </TouchableOpacity>
            </Surface>
          ))
        ) : (
          <View style={[styles.emptyContainer, { width: width - 40 }]}>
            <DynamicIcon name="file-cancel" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        )}
      </View>
    </View>
  );

  const getActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'academic':
        return renderAcademic();
      case 'personal':
        return renderPersonal();
      case 'family':
        return renderFamily();
      case 'history':
        return renderHistory();
      case 'documents':
        return renderDocuments();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={[theme.colors.primary, '#4f46e5']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Menu size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Profile</Text>

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={26} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      user?.profile_picture ||
                      `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=6366f1&color=fff&size=128`,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.userName}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {user?.role?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.idBadge}>
                    <Text style={styles.idText}>
                      #{user?.student_id || user?.employee_id || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={() => setShowSettingsModal(true)}
              >
                <DynamicIcon name="cog" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}
          >
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabBtn,
                  activeTab === tab.id && styles.activeTabBtn,
                ]}
              >
                <DynamicIcon
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.id ? theme.colors.primary : '#fff'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === tab.id && styles.activeTabBtnText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.body, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {getActiveTabContent()}
      </Animated.ScrollView>

      <Portal>
        {/* Settings Modal */}
        <Modal
          visible={showSettingsModal}
          onDismiss={() => setShowSettingsModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Account Settings</Text>
          <Text style={styles.modalSub}>Manage your security and session</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              setShowSettingsModal(false);
              setShowPasswordModal(true);
            }}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#e0e7ff' }]}>
              <DynamicIcon
                name="key-variant"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Change Password</Text>
              <Text style={styles.menuSub}>Update your login credentials</Text>
            </View>
            <DynamicIcon name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              setShowSettingsModal(false);
              handleLogout();
            }}
          >
            <DynamicIcon
              name="logout"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.logoutText}>LOGOUT SESSION</Text>
          </TouchableOpacity>

          <Button
            onPress={() => setShowSettingsModal(false)}
            color="#64748b"
            style={{ marginTop: 10 }}
          >
            CLOSE
          </Button>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          visible={showPasswordModal}
          onDismiss={() => setShowPasswordModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Update Security</Text>
          <Text style={styles.modalSub}>
            Enter your current and new password
          </Text>

          <TextInput
            label="Current Password"
            secureTextEntry
            value={passwordForm.oldPassword}
            onChangeText={txt =>
              setPasswordForm(p => ({ ...p, oldPassword: txt }))
            }
            style={styles.input}
            mode="outlined"
            outlineColor="#e2e8f0"
          />
          <TextInput
            label="New Password"
            secureTextEntry
            value={passwordForm.newPassword}
            onChangeText={txt =>
              setPasswordForm(p => ({ ...p, newPassword: txt }))
            }
            style={styles.input}
            mode="outlined"
            outlineColor="#e2e8f0"
          />
          <TextInput
            label="Confirm New Password"
            secureTextEntry
            value={passwordForm.confirmPassword}
            onChangeText={txt =>
              setPasswordForm(p => ({ ...p, confirmPassword: txt }))
            }
            style={styles.input}
            mode="outlined"
            outlineColor="#e2e8f0"
          />

          <Button
            mode="contained"
            onPress={handlePasswordChange}
            loading={loading}
            disabled={loading}
            style={styles.modalBtn}
            contentStyle={{ paddingVertical: 8 }}
          >
            UPDATE PASSWORD
          </Button>
          <Button onPress={() => setShowPasswordModal(false)} color="#64748b">
            CANCEL
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    marginBottom: 20,
  },

  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#4f46e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 4,
    borderColor: '#4f46e5',
  },
  nameSection: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  idBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  idText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabScroll: {
    marginTop: 10,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 10,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeTabBtn: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  activeTabBtnText: {
    color: theme.colors.primary,
  },
  body: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  addressBox: {
    paddingVertical: 5,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '600',
  },
  eduCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  eduHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eduIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  eduQual: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
  },
  eduSchool: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  eduScoreBox: {
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  eduScoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  eduScoreLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  docCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  docIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  docStatus: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  docType: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 2,
  },
  viewDocBtn: {
    marginTop: 12,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  viewDocText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  menuSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  logoutBtn: {
    // marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    margin: 20,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  modalBtn: {
    marginTop: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
});

export default ProfileScreen;
