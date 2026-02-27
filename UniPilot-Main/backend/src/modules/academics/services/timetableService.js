import { Timetable, TimetableSlot } from "../models/index.js";

export const listTimetables = (options = {}) => Timetable.findAll(options);

export const listTimetableSlots = (options = {}) => TimetableSlot.findAll(options);

export const countTimetableSlots = (options = {}) => TimetableSlot.count(options);

export default {
  listTimetables,
  listTimetableSlots,
  countTimetableSlots,
};
