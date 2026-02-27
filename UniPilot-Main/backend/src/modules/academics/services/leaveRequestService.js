import LeaveRequest from "../models/LeaveRequest.js";

export const findLeaveRequestByPk = (id, options = {}) =>
  LeaveRequest.findByPk(id, options);

export const findLeaveRequest = (options = {}) =>
  LeaveRequest.findOne(options);

export const listLeaveRequests = (options = {}) =>
  LeaveRequest.findAll(options);

export const listLeaveRequestsWithCount = (options = {}) =>
  LeaveRequest.findAndCountAll(options);

export const createLeaveRequest = (values, options = {}) =>
  LeaveRequest.create(values, options);

export const updateLeaveRequests = (values, options = {}) =>
  LeaveRequest.update(values, options);

export default {
  findLeaveRequestByPk,
  findLeaveRequest,
  listLeaveRequests,
  listLeaveRequestsWithCount,
  createLeaveRequest,
  updateLeaveRequests,
};
