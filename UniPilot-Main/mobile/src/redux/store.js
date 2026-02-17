import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import timetableReducer from './slices/timetableSlice';
import hostelReducer from './slices/hostelSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['error', 'loading'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  timetable: timetableReducer,
  hostel: hostelReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: [], // root persist doesn't need to whitelist auth anymore as it's individually persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
