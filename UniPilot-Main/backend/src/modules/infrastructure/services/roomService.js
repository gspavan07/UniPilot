import { Op } from "sequelize";
import Room from "../models/Room.js";

export const findRoomByPk = (id, options = {}) => Room.findByPk(id, options);

export const listRooms = (options = {}) => Room.findAll(options);

export const getRoomsByIds = async (ids = [], options = {}) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];
  return Room.findAll({ where: { id: { [Op.in]: uniqueIds } }, ...options });
};

export const getRoomMapByIds = async (ids = [], options = {}) => {
  const rooms = await getRoomsByIds(ids, options);
  return new Map(rooms.map((room) => [room.id, room]));
};

export default {
  findRoomByPk,
  listRooms,
  getRoomsByIds,
  getRoomMapByIds,
};
