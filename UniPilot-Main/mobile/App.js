import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/theme/theme';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    tertiary: theme.colors.accent,
    error: theme.colors.error,
  },
};

import { AlertProvider } from './src/context/AlertContext';
import CustomAlert from './src/components/common/CustomAlert';

const App = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <AlertProvider>
            <PaperProvider theme={paperTheme}>
              <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
              />
              <AppNavigator />
              <CustomAlert />
            </PaperProvider>
          </AlertProvider>
        </SafeAreaProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
