import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hostelService from '../../services/hostelService';

export const fetchGatePasses = createAsyncThunk(
  'hostel/fetchGatePasses',
  async (params, { rejectWithValue }) => {
    try {
      return await hostelService.getGatePasses(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createGatePass = createAsyncThunk(
  'hostel/createGatePass',
  async (data, { rejectWithValue }) => {
    try {
      return await hostelService.createGatePass(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const verifyGatePassOtp = createAsyncThunk(
  'hostel/verifyGatePassOtp',
  async ({ id, otp }, { rejectWithValue }) => {
    try {
      return await hostelService.verifyGatePassOtp(id, otp);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const rejectGatePass = createAsyncThunk(
  'hostel/rejectGatePass',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      return await hostelService.rejectGatePass(id, remarks);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchComplaints = createAsyncThunk(
  'hostel/fetchComplaints',
  async (params, { rejectWithValue }) => {
    try {
      return await hostelService.getComplaints(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createComplaint = createAsyncThunk(
  'hostel/createComplaint',
  async (data, { rejectWithValue }) => {
    try {
      return await hostelService.createComplaint(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateComplaint = createAsyncThunk(
  'hostel/updateComplaint',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await hostelService.updateComplaint(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  gatePasses: [],
  complaints: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  operationStatus: 'idle',
  operationError: null,
  error: null,
};

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    resetOperationStatus: state => {
      state.operationStatus = 'idle';
      state.operationError = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Gate Passes
      .addCase(fetchGatePasses.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchGatePasses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.gatePasses = action.payload;
      })
      .addCase(fetchGatePasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Complaints
      .addCase(fetchComplaints.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Operations (Create, Update, Verify, Reject)
      .addMatcher(
        action =>
          action.type.endsWith('/pending') && !action.type.includes('fetch'),
        state => {
          state.operationStatus = 'loading';
        },
      )
      .addMatcher(
        action =>
          action.type.endsWith('/fulfilled') && !action.type.includes('fetch'),
        state => {
          state.operationStatus = 'succeeded';
        },
      )
      .addMatcher(
        action =>
          action.type.endsWith('/rejected') && !action.type.includes('fetch'),
        (state, action) => {
          state.operationStatus = 'failed';
          state.operationError = action.payload;
        },
      );
  },
});

export const { resetOperationStatus } = hostelSlice.actions;
export default hostelSlice.reducer;
