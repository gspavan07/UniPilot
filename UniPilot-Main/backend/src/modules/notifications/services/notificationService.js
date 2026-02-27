import Notification from "../models/Notification.js";

export const createNotification = (values, options = {}) =>
  Notification.create(values, options);

export const createNotifications = (valuesArray = [], options = {}) => {
  if (!Array.isArray(valuesArray) || valuesArray.length === 0) return [];
  return Notification.bulkCreate(valuesArray, options);
};

export default {
  createNotification,
  createNotifications,
};
