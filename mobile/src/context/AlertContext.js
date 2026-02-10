import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'success' | 'error' | 'info' | 'warning'
    transactionId: '',
    receiptUrl: '',
    transactionData: null,
    onConfirm: null,
    onSecondary: null,
    secondaryLabel: '',
    confirmLabel: '',
  });

  const showAlert = useCallback(
    ({
      title,
      message,
      type = 'info',
      transactionId = '',
      receiptUrl = '',
      transactionData = null,
      onConfirm,
      onSecondary,
      secondaryLabel = '',
      confirmLabel = 'Dismiss',
    }) => {
      setAlert({
        visible: true,
        title,
        message,
        type,
        transactionId,
        receiptUrl,
        transactionData,
        onConfirm,
        onSecondary,
        secondaryLabel,
        confirmLabel,
      });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
