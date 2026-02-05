import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import DrawerRoot from './DrawerRoot';
import { DrawerProvider } from '../context/DrawerContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <DrawerProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <Stack.Screen name="Main">
              {props => (
                <DrawerRoot {...props}>
                  <TabNavigator {...props} />
                </DrawerRoot>
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </DrawerProvider>
  );
};

export default AppNavigator;
