import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import feeService from '../services/feeService';
import theme from '../theme/theme';
import { useAlert } from '../context/AlertContext';

/**
 * usePayment - Custom hook for modular payment handling
 *
 * Supports Razorpay integration and backend verification.
 *
 * @param {Object} options
 * @param {Function} options.onSuccess - Callback on successful payment
 * @param {Function} options.onError - Callback on payment error
 */
const usePayment = ({ onSuccess, onError } = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useSelector(state => state.auth);
  const { showAlert } = useAlert();

  /**
   * initiatePayment
   *
   * @param {Object} paymentInfo
   * @param {number} paymentInfo.amount - Amount to pay (Net)
   * @param {Array} paymentInfo.payments - Optional batch details for the backend
   * @param {string} paymentInfo.description - Payment description
   */
  const initiatePayment = useCallback(
    async ({ amount, payments, description }) => {
      if (amount <= 0) return;

      setIsProcessing(true);
      try {
        // 1. Create Order on Backend
        const orderRes = await feeService.createPaymentOrder(amount);

        if (!orderRes?.data || !orderRes?.key_id) {
          throw new Error('Invalid order response from server');
        }

        // 2. Configure Razorpay Options
        const options = {
          key: orderRes.key_id,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: 'UniPilot University',
          description: description || 'Student Fee Payment',
          image:
            'https://unipilot.in/wp-content/uploads/2023/11/cropped-logo-1-192x192.png',
          order_id: orderRes.data.id,
          prefill: {
            name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
            email: user?.email || '',
            contact: user?.phone_number || '',
          },
          theme: {
            color: theme.colors.primary,
          },
        };

        // 3. Open Razorpay Checkout
        RazorpayCheckout.open(options)
          .then(async data => {
            // 4. Verify Payment on Backend
            try {
              const verificationRes = await feeService.payMyFees({
                payments: payments || [],
                payment_method: 'razorpay',
                transaction_id: data.razorpay_payment_id,
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
                remarks: 'Mobile App Payment',
              });

              if (onSuccess) onSuccess(verificationRes);
            } catch (err) {
              showAlert({
                title: 'Verification Failed',
                message: err.toString(),
                type: 'error',
              });
              if (onError) onError(err);
            } finally {
              setIsProcessing(false);
            }
          })
          .catch(err => {
            // Handle Razorpay error (Dismissed, etc.)
            if (err.code !== 2) {
              // 2 is typically user cancelled
              showAlert({
                title: 'Payment Error',
                message: err.description || 'Payment failed',
                type: 'error',
              });
            }
            if (onError) onError(err);
            setIsProcessing(false);
          });
      } catch (err) {
        showAlert({
          title: 'Order Failed',
          message: err.toString(),
          type: 'error',
        });
        if (onError) onError(err);
        setIsProcessing(false);
      }
    },
    [user, onSuccess, onError, showAlert],
  );

  return {
    isProcessing,
    initiatePayment,
  };
};

export default usePayment;
