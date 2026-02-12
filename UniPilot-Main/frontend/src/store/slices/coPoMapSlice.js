import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const fetchProgramOutcomes = createAsyncThunk(
    "programOutcomes/fetchAll",
    async (programId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/program-outcomes?program_id=${programId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch program outcomes");
        }
    }
);

export const fetchCourseOutcomes = createAsyncThunk(
    "courseOutcomes/fetchAll",
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/course-outcomes?course_id=${courseId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch course outcomes");
        }
    }
);

export const fetchCoPoMatrix = createAsyncThunk(
    "coPoMap/fetchMatrix",
    async ({ courseId, programId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/co-po-maps/matrix?course_id=${courseId}&program_id=${programId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch CO-PO matrix");
        }
    }
);

export const updateCoPoMapping = createAsyncThunk(
    "coPoMap/updateMapping",
    async ({ courseOutcomeId, programOutcomeId, weightage }, { rejectWithValue }) => {
        try {
            const response = await api.post("/co-po-maps", {
                course_outcome_id: courseOutcomeId,
                program_outcome_id: programOutcomeId,
                weightage,
            });
            return { courseOutcomeId, programOutcomeId, weightage };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to update mapping");
        }
    }
);

export const bulkUpdateCoPoMappings = createAsyncThunk(
    "coPoMap/bulkUpdate",
    async ({ courseId, programId, mappings }, { rejectWithValue }) => {
        try {
            const response = await api.post("/co-po-maps/bulk", {
                course_id: courseId,
                program_id: programId,
                mappings,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to bulk update mappings");
        }
    }
);

const coPoMapSlice = createSlice({
    name: "coPoMap",
    initialState: {
        programOutcomes: [],
        courseOutcomes: [],
        matrix: {},
        status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        updateStatus: "idle",
    },
    reducers: {
        setLocalMapping: (state, action) => {
            const { courseOutcomeId, programOutcomeId, weightage } = action.payload;
            if (!state.matrix[courseOutcomeId]) {
                state.matrix[courseOutcomeId] = {};
            }
            state.matrix[courseOutcomeId][programOutcomeId] = weightage;
        },
        clearMappings: (state) => {
            state.programOutcomes = [];
            state.courseOutcomes = [];
            state.matrix = {};
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Program Outcomes
            .addCase(fetchProgramOutcomes.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProgramOutcomes.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.programOutcomes = action.payload;
            })
            .addCase(fetchProgramOutcomes.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Fetch Course Outcomes
            .addCase(fetchCourseOutcomes.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCourseOutcomes.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.courseOutcomes = action.payload;
            })
            .addCase(fetchCourseOutcomes.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Fetch CO-PO Matrix
            .addCase(fetchCoPoMatrix.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCoPoMatrix.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.programOutcomes = action.payload.programOutcomes;
                state.courseOutcomes = action.payload.courseOutcomes;
                state.matrix = action.payload.matrix;
            })
            .addCase(fetchCoPoMatrix.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Update single mapping
            .addCase(updateCoPoMapping.pending, (state) => {
                state.updateStatus = "loading";
            })
            .addCase(updateCoPoMapping.fulfilled, (state, action) => {
                state.updateStatus = "succeeded";
                const { courseOutcomeId, programOutcomeId, weightage } = action.payload;
                if (!state.matrix[courseOutcomeId]) {
                    state.matrix[courseOutcomeId] = {};
                }
                state.matrix[courseOutcomeId][programOutcomeId] = weightage;
            })
            .addCase(updateCoPoMapping.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.error = action.payload;
            })
            // Bulk update mappings
            .addCase(bulkUpdateCoPoMappings.pending, (state) => {
                state.updateStatus = "loading";
            })
            .addCase(bulkUpdateCoPoMappings.fulfilled, (state) => {
                state.updateStatus = "succeeded";
            })
            .addCase(bulkUpdateCoPoMappings.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.error = action.payload;
            });
    },
});

export const { setLocalMapping, clearMappings } = coPoMapSlice.actions;
export default coPoMapSlice.reducer;
