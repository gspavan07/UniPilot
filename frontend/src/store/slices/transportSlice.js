import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/api";

// --- Routes ---
export const fetchRoutes = createAsyncThunk(
  "transport/fetchRoutes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/routes");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createRoute = createAsyncThunk(
  "transport/createRoute",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/routes", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateRoute = createAsyncThunk(
  "transport/updateRoute",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/routes/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteRoute = createAsyncThunk(
  "transport/deleteRoute",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/routes/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Stops ---
export const createStop = createAsyncThunk(
  "transport/createStop",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/stops", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateStop = createAsyncThunk(
  "transport/updateStop",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/stops/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteStop = createAsyncThunk(
  "transport/deleteStop",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/stops/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Vehicles ---
export const fetchVehicles = createAsyncThunk(
  "transport/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/vehicles");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchExpiringVehicles = createAsyncThunk(
  "transport/fetchExpiringVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/vehicles/expiring");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createVehicle = createAsyncThunk(
  "transport/createVehicle",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/vehicles", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateVehicle = createAsyncThunk(
  "transport/updateVehicle",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/vehicles/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteVehicle = createAsyncThunk(
  "transport/deleteVehicle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/vehicles/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Drivers ---
export const fetchDrivers = createAsyncThunk(
  "transport/fetchDrivers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/drivers");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchExpiringLicenses = createAsyncThunk(
  "transport/fetchExpiringLicenses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/drivers/expiring-license");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createDriver = createAsyncThunk(
  "transport/createDriver",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/drivers", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateDriver = createAsyncThunk(
  "transport/updateDriver",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/drivers/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteDriver = createAsyncThunk(
  "transport/deleteDriver",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/drivers/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Assignments ---
export const fetchAssignments = createAsyncThunk(
  "transport/fetchAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/assignments");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createAssignment = createAsyncThunk(
  "transport/createAssignment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/assignments", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateAssignment = createAsyncThunk(
  "transport/updateAssignment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/assignments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteAssignment = createAsyncThunk(
  "transport/deleteAssignment",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/assignments/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Allocations ---
export const fetchAllocations = createAsyncThunk(
  "transport/fetchAllocations",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/allocations", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createAllocation = createAsyncThunk(
  "transport/createAllocation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/allocations", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateAllocation = createAsyncThunk(
  "transport/updateAllocation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/allocations/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteAllocation = createAsyncThunk(
  "transport/deleteAllocation",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/allocations/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const syncSemesterFees = createAsyncThunk(
  "transport/syncSemesterFees",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/sync-fees", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Special Trips ---
export const fetchSpecialTrips = createAsyncThunk(
  "transport/fetchSpecialTrips",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/special-trips", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createSpecialTrip = createAsyncThunk(
  "transport/createSpecialTrip",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/special-trips", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateSpecialTrip = createAsyncThunk(
  "transport/updateSpecialTrip",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/special-trips/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const approveSpecialTrip = createAsyncThunk(
  "transport/approveSpecialTrip",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/transport/special-trips/${id}/approve`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const deleteSpecialTrip = createAsyncThunk(
  "transport/deleteSpecialTrip",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/transport/special-trips/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Trip Logs ---
export const fetchTripLogs = createAsyncThunk(
  "transport/fetchTripLogs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/trip-logs", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createTripLog = createAsyncThunk(
  "transport/createTripLog",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/transport/trip-logs", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateTripLog = createAsyncThunk(
  "transport/updateTripLog",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/transport/trip-logs/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// --- Analytics ---
export const fetchTransportDashboardStats = createAsyncThunk(
  "transport/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/analytics/dashboard");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchRouteUtilization = createAsyncThunk(
  "transport/fetchRouteUtilization",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "/transport/analytics/route-utilization",
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchZoneRevenue = createAsyncThunk(
  "transport/fetchZoneRevenue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/analytics/zone-revenue");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const fetchTripStats = createAsyncThunk(
  "transport/fetchTripStats",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/transport/analytics/trip-stats", {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

const transportSlice = createSlice({
  name: "transport",
  initialState: {
    routes: [],
    vehicles: [],
    expiringVehicles: [],
    drivers: [],
    expiringLicenses: [],
    assignments: [],
    allocations: [],
    specialTrips: [],
    tripLogs: [],
    dashboardStats: null,
    routeUtilization: [],
    zoneRevenue: [],
    tripStats: null,
    status: "idle",
    error: null,
    operationStatus: "idle",
    operationError: null,
  },
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    // Standard fetch reducers
    const addFetchCases = (thunk, stateKey) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading";
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.error = null;
          state[stateKey] = action.payload.data;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        });
    };

    // Standard operation reducers (create, update, delete)
    const addOperationCases = (thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.operationStatus = "loading";
        })
        .addCase(thunk.fulfilled, (state) => {
          state.operationStatus = "succeeded";
          state.operationError = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.operationStatus = "failed";
          state.operationError = action.payload;
        });
    };

    // Fetching
    addFetchCases(fetchRoutes, "routes");
    addFetchCases(fetchVehicles, "vehicles");
    addFetchCases(fetchExpiringVehicles, "expiringVehicles");
    addFetchCases(fetchDrivers, "drivers");
    addFetchCases(fetchExpiringLicenses, "expiringLicenses");
    addFetchCases(fetchAssignments, "assignments");
    addFetchCases(fetchAllocations, "allocations");
    addFetchCases(fetchSpecialTrips, "specialTrips");
    addFetchCases(fetchTripLogs, "tripLogs");
    addFetchCases(fetchTransportDashboardStats, "dashboardStats");
    addFetchCases(fetchRouteUtilization, "routeUtilization");
    addFetchCases(fetchZoneRevenue, "zoneRevenue");
    addFetchCases(fetchTripStats, "tripStats");

    // Operations
    addOperationCases(createRoute);
    addOperationCases(updateRoute);
    addOperationCases(deleteRoute);
    addOperationCases(createStop);
    addOperationCases(updateStop);
    addOperationCases(deleteStop);
    addOperationCases(createVehicle);
    addOperationCases(updateVehicle);
    addOperationCases(deleteVehicle);
    addOperationCases(createDriver);
    addOperationCases(updateDriver);
    addOperationCases(deleteDriver);
    addOperationCases(createAssignment);
    addOperationCases(updateAssignment);
    addOperationCases(deleteAssignment);
    addOperationCases(createAllocation);
    addOperationCases(updateAllocation);
    addOperationCases(deleteAllocation);
    addOperationCases(createSpecialTrip);
    addOperationCases(updateSpecialTrip);
    addOperationCases(approveSpecialTrip);
    addOperationCases(deleteSpecialTrip);
    addOperationCases(createTripLog);
    addOperationCases(updateTripLog);
    addOperationCases(syncSemesterFees);
  },
});

export const { resetOperationStatus } = transportSlice.actions;
export default transportSlice.reducer;
