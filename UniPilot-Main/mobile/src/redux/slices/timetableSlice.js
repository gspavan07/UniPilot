import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timetableService from '../../services/timetableService';

export const fetchMyTimetable = createAsyncThunk(
  'timetable/fetchMyTimetable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timetableService.fetchMyTimetable();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch timetable',
      );
    }
  },
);

export const fetchHolidays = createAsyncThunk(
  'timetable/fetchHolidays',
  async (target, { rejectWithValue }) => {
    try {
      const response = await timetableService.fetchHolidays(target);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch holidays',
      );
    }
  },
);

export const fetchSettings = createAsyncThunk(
  'timetable/fetchSettings',
  async (keys, { rejectWithValue }) => {
    try {
      const response = await timetableService.fetchSettings(keys);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch settings',
      );
    }
  },
);

const initialState = {
  currentTimetable: null,
  holidays: [],
  isSatWorking: false,
  status: 'idle',
  error: null,
};

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    clearTimetable: state => {
      state.currentTimetable = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyTimetable.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchMyTimetable.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTimetable = action.payload;
      })
      .addCase(fetchMyTimetable.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.holidays = action.payload || [];
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        // Assume key search for sat working
        if (action.payload && typeof action.payload === 'object') {
          const key = Object.keys(action.payload)[0];
          if (key && key.includes('saturday_working')) {
            state.isSatWorking = action.payload[key] === 'true';
          }
        }
      });
  },
});

export const { clearTimetable } = timetableSlice.actions;

export default timetableSlice.reducer;
