import api from './api';

const feeService = {
  /**
   * Fetch the current student's fee status, including semester-wise breakdown and totals.
   */
  getMyStatus: async () => {
    try {
      const response = await api.get('/fees/my-status');
      return response;
    } catch (error) {
      throw error.message || 'Failed to fetch fee status';
    }
  },

  /**
   * Create a Razorpay payment order for a specific amount.
   * @param {number} amount - Net payable amount
   */
  createPaymentOrder: async amount => {
    try {
      const response = await api.post('/fees/payment/order', { amount });
      return response;
    } catch (error) {
      throw error.message || 'Failed to create payment order';
    }
  },

  /**
   * Complete the fee payment process after a successful transaction.
   * @param {Object} paymentData - Detailed payment information including batch and transaction IDs
   */
  payMyFees: async paymentData => {
    try {
      const response = await api.post('/fees/my-payment', paymentData);
      return response;
    } catch (error) {
      throw error.message || 'Payment processing failed';
    }
  },
};

export default feeService;
