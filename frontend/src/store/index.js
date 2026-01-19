import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import departmentReducer from "./slices/departmentSlice";
import programReducer from "./slices/programSlice";
import courseReducer from "./slices/courseSlice";
import userReducer from "./slices/userSlice";
import roleReducer from "./slices/roleSlice";
import proctorReducer from "./slices/proctorSlice";
import promotionReducer from "./slices/promotionSlice";
import attendanceReducer from "./slices/attendanceSlice";
import examReducer from "./slices/examSlice";
import feeReducer from "./slices/feeSlice";
import libraryReducer from "./slices/librarySlice";
import timetableReducer from "./slices/timetableSlice";
import hrReducer from "./slices/hrSlice";
import infrastructureReducer from "./slices/infrastructureSlice";
import regulationReducer from "./slices/regulationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    programs: programReducer,
    courses: courseReducer,
    users: userReducer,
    roles: roleReducer,
    proctor: proctorReducer,
    promotion: promotionReducer,
    attendance: attendanceReducer,
    exam: examReducer,
    fee: feeReducer,
    library: libraryReducer,
    timetable: timetableReducer,
    hr: hrReducer,
    infrastructure: infrastructureReducer,
    regulations: regulationReducer,
  },
});

export default store;
