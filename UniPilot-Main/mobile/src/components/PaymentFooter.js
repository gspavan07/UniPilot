import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Wallet, ShoppingBag } from 'lucide-react-native';
import theme from '../theme/theme';

const { width } = Dimensions.get('window');

/**
 * PaymentFooter - Reusable floating checkout island
 *
 * @param {Object} props
 * @param {number} props.total - Total selected amount
 * @param {number} props.walletApplied - Amount applied from wallet
 * @param {number} props.netPayable - Final amount to be paid via gateway
 * @param {Function} props.onPay - Function to trigger on "Pay Now"
 * @param {boolean} props.isProcessing - Loading state for the pay button
 */
const PaymentFooter = ({
  total = 0,
  walletApplied = 0,
  netPayable = 0,
  onPay,
  isProcessing = false,
}) => {
  if (total <= 0) return null;

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <View style={styles.footerContainer}>
      <Surface style={styles.footerIsland} elevation={4}>
        <View style={styles.footerSummary}>
          <View>
            <Text style={styles.footerLabel}>Total Selection</Text>
            <Text style={styles.footerTotal}>{formatCurrency(total)}</Text>
          </View>

          {walletApplied > 0 && (
            <View style={styles.walletInfo}>
              <Wallet size={12} color="#f59e0b" />
              <Text style={styles.walletText}>
                Wallet Adj: -{formatCurrency(walletApplied)}
              </Text>
            </View>
          )}

          {netPayable > 0 && walletApplied > 0 && (
            <View style={styles.netInfo}>
              <Text style={styles.netLabel}>Net to Pay</Text>
              <Text style={styles.netValue}>{formatCurrency(netPayable)}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={onPay}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={[theme.colors.primary, '#4f46e5']}
            style={styles.checkoutGradient}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <ShoppingBag size={18} color="#fff" />
                <Text style={styles.checkoutText}>Pay Now</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 25, // Adjusted to sit above bottom navigation if needed or floating
    left: 0,
    right: 0,
    bottom: 90,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  footerIsland: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 15,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  footerSummary: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  walletText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f59e0b',
    marginLeft: 4,
  },
  netInfo: {
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 4,
  },
  netLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  netValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  checkoutBtn: {
    width: 110,
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
  },
});

export default PaymentFooter;
