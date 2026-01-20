import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  cycles: [],
  schedules: [],
  myResults: [],
  gpa: {
    currentSemester: "0.00",
    overall: "0.00",
  },
  status: "idle",
  error: null,
};

export const fetchExamCycles = createAsyncThunk(
  "exam/fetchCycles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/cycles");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch cycles",
      );
    }
  },
);

export const createExamCycle = createAsyncThunk(
  "exam/createCycle",
  async (cycleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/cycles", cycleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create exam cycle",
      );
    }
  },
);

export const updateExamCycle = createAsyncThunk(
  "exam/updateCycle",
  async ({ id, cycleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/exam/cycles/${id}`, cycleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update exam cycle",
      );
    }
  },
);

export const deleteExamCycle = createAsyncThunk(
  "exam/deleteCycle",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exam/cycles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete exam cycle",
      );
    }
  },
);

export const enterBulkMarks = createAsyncThunk(
  "exam/enterMarks",
  async (marksData, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/marks/bulk", marksData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to enter marks",
      );
    }
  },
);

export const fetchExamSchedules = createAsyncThunk(
  "exam/fetchSchedules",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/schedules", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch schedules",
      );
    }
  },
);

export const addExamSchedule = createAsyncThunk(
  "exam/addSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/schedules", scheduleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add schedule",
      );
    }
  },
);

export const updateExamSchedule = createAsyncThunk(
  "exam/updateSchedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/exam/schedules/${id}`, scheduleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update schedule",
      );
    }
  },
);

export const deleteExamSchedule = createAsyncThunk(
  "exam/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exam/schedules/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete schedule",
      );
    }
  },
);

export const autoGenerateTimetable = createAsyncThunk(
  "exam/autoGenerate",
  async (config, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/schedules/auto-generate", config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to auto-generate timetable",
      );
    }
  },
);

export const fetchMyResults = createAsyncThunk(
  "exam/fetchMyResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/my-results", { params });
      return response.data; // Return full response including gpa
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch results",
      );
    }
  },
);

export const fetchMyExamSchedules = createAsyncThunk(
  "exam/fetchMySchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/exam/my-schedules");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch your schedules",
      );
    }
  },
);

export const fetchScheduleMarks = createAsyncThunk(
  "exam/fetchScheduleMarks",
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exam/marks/${scheduleId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch marks",
      );
    }
  },
);

export const fetchMarkEntryData = createAsyncThunk(
  "exam/fetchMarkEntryData",
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exam/marks/entry-data/${scheduleId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch mark entry data",
      );
    }
  },
);

export const updateModerationStatus = createAsyncThunk(
  "exam/updateModeration",
  async (moderationData, { rejectWithValue }) => {
    try {
      const response = await api.put("/exam/marks/moderation", moderationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update status",
      );
    }
  },
);

export const fetchConsolidatedResults = createAsyncThunk(
  "exam/fetchConsolidated",
  async (filters, { rejectWithValue }) => {
    try {
      const { program_id, semester, batch_year, section, exam_cycle_id } =
        filters;
      let url = `/exam/consolidated-results?semester=${semester}&batch_year=${batch_year}`;
      if (program_id) url += `&program_id=${program_id}`;
      if (section) url += `&section=${section}`;
      if (exam_cycle_id) url += `&exam_cycle_id=${exam_cycle_id}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch consolidated results",
      );
    }
  },
);

export const bulkImportMarks = createAsyncThunk(
  "exam/bulkImport",
  async ({ exam_cycle_id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("exam_cycle_id", exam_cycle_id);
      formData.append("file", file);

      const response = await api.post("/exam/marks/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to import marks",
      );
    }
  },
);

export const downloadTemplate = createAsyncThunk(
  "exam/downloadTemplate",
  async (exam_cycle_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exam/marks/template`, {
        params: { exam_cycle_id },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Marks_Import_Template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to download template",
      );
    }
  },
);

export const bulkPublishResults = createAsyncThunk(
  "exam/bulkPublish",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/exam/marks/bulk-publish", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to publish results",
      );
    }
  },
);

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    clearExamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamCycles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExamCycles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cycles = action.payload;
      })
      .addCase(createExamCycle.fulfilled, (state, action) => {
        state.cycles.push(action.payload);
      })
      .addCase(updateExamCycle.fulfilled, (state, action) => {
        const index = state.cycles.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
      })
      .addCase(deleteExamCycle.fulfilled, (state, action) => {
        state.cycles = state.cycles.filter((c) => c.id !== action.payload);
      })
      .addCase(fetchMyResults.fulfilled, (state, action) => {
        state.myResults = action.payload.data || action.payload;
        state.gpa = action.payload.gpa || {
          currentSemester: "0.00",
          overall: "0.00",
        };
      })
      .addCase(fetchExamSchedules.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.schedules = action.payload;
      })
      .addCase(fetchMyExamSchedules.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.schedules = action.payload;
      })
      .addCase(addExamSchedule.fulfilled, (state, action) => {
        state.schedules.push(action.payload);
      })
      .addCase(updateExamSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          // Merge with existing to keep course details
          state.schedules[index] = {
            ...state.schedules[index],
            ...action.payload,
          };
        }
      })
      .addCase(deleteExamSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(
          (s) => s.id !== action.payload,
        );
      })
      .addCase(autoGenerateTimetable.fulfilled, (state, action) => {
        // Auto-generation returns an array of new schedules
        state.schedules = [...state.schedules, ...action.payload];
      });
  },
});

export const { clearExamError } = examSlice.actions;

export default examSlice.reducer;
