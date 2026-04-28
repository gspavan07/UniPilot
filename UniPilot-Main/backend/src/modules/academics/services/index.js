import * as academicLookupService from "./academicLookupService.js";
import * as attendanceService from "./attendanceService.js";
import * as leaveRequestService from "./leaveRequestService.js";
import * as timetableService from "./timetableService.js";
import * as academicResultService from "./academicResultService.js";

export const AcademicService = {
  ...academicLookupService,
  ...attendanceService,
  ...leaveRequestService,
  ...timetableService,
  ...academicResultService,
};

export default AcademicService;
