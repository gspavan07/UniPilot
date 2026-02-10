import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
  Copy,
  Download,
} from 'lucide-react-native';
import { Surface } from 'react-native-paper';
import { useAlert } from '../../context/AlertContext';
import * as ReceiptUtils from '../../utils/receiptGenerator';
import theme from '../../theme/theme';

const { width } = Dimensions.get('window');

const CustomAlert = () => {
  const { alert, hideAlert } = useAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (alert.visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [alert.visible]);

  const handleConfirm = () => {
    hideAlert();
    if (alert.onConfirm) {
      alert.onConfirm();
    }
  };

  const handleSecondary = () => {
    hideAlert();
    if (alert.onSecondary) {
      alert.onSecondary();
    } else if (alert.transactionData) {
      ReceiptUtils.generateReceiptPDF(alert.transactionData);
    }
  };

  const copyToClipboard = () => {
    if (!alert.transactionId) return;
    // Simple way to "copy" without external deps in this environment if not present
    // We'll use Share as a fallback if Clipboard is truly missing, or just inform
    Share.share({
      message: alert.transactionId,
    });
  };

  const getIcon = () => {
    const size = 36;
    switch (alert.type) {
      case 'success':
        return <CheckCircle2 size={size} color="#10b981" strokeWidth={2.5} />;
      case 'error':
        return <XCircle size={size} color="#ef4444" strokeWidth={2.5} />;
      case 'warning':
        return <AlertCircle size={size} color="#f59e0b" strokeWidth={2.5} />;
      case 'info':
      default:
        return (
          <Info size={size} color={theme.colors.primary} strokeWidth={2.5} />
        );
    }
  };

  const getHeaderColor = () => {
    switch (alert.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return theme.colors.primary;
    }
  };

  if (!alert.visible && fadeAnim._value === 0) return null;

  const showTransaction = alert.type === 'success' && alert.transactionId;
  const showSecondary = !!(alert.receiptUrl || alert.onSecondary);

  return (
    <Modal
      transparent
      visible={alert.visible}
      animationType="none"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Surface style={styles.alertBox} elevation={5}>
            <TouchableOpacity style={styles.closeBtn} onPress={hideAlert}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.content}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getHeaderColor() + '15' },
                ]}
              >
                {getIcon()}
              </View>

              <Text style={styles.title}>{alert.title || 'Alert'}</Text>
              <Text style={styles.message}>{alert.message}</Text>

              {showTransaction && (
                <View style={styles.txnContainer}>
                  <View style={styles.txnLabelContainer}>
                    <Text style={styles.txnLabel}>Transaction ID</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.txnValueContainer}
                    onPress={copyToClipboard}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.txnValue} numberOfLines={1}>
                      {alert.transactionId}
                    </Text>
                    <Copy
                      size={14}
                      color={theme.colors.primary}
                      style={styles.copyIcon}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View
                style={[
                  styles.buttonContainer,
                  showSecondary && styles.buttonContainerVertical,
                ]}
              >
                {showSecondary && (
                  <TouchableOpacity
                    style={[
                      styles.secondaryBtn,
                      { borderColor: getHeaderColor() },
                    ]}
                    onPress={handleSecondary}
                    activeOpacity={0.7}
                  >
                    <Download
                      size={18}
                      color={getHeaderColor()}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.secondaryBtnText,
                        { color: getHeaderColor() },
                      ]}
                    >
                      {alert.secondaryLabel || 'Download Receipt'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: getHeaderColor() },
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>
                    {alert.confirmLabel || 'Dismiss'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.88,
    maxWidth: 400,
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    padding: 24,
    paddingTop: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  txnContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  txnLabelContainer: {
    marginBottom: 6,
  },
  txnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  txnValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txnValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  copyIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonContainerVertical: {
    flexDirection: 'column-reverse',
  },
  confirmBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CustomAlert;
