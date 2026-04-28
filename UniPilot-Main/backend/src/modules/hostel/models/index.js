import HostelBuilding from "./HostelBuilding.js";
import HostelFloor from "./HostelFloor.js";
import HostelRoom from "./HostelRoom.js";
import HostelBed from "./HostelBed.js";
import HostelAllocation from "./HostelAllocation.js";
import HostelFeeStructure from "./HostelFeeStructure.js";
import HostelMessFeeStructure from "./HostelMessFeeStructure.js";
import HostelComplaint from "./HostelComplaint.js";
import HostelAttendance from "./HostelAttendance.js";
import HostelGatePass from "./HostelGatePass.js";
import HostelVisitor from "./HostelVisitor.js";
import HostelStayLog from "./HostelStayLog.js";
import HostelFine from "./HostelFine.js";
import HostelRoomBill from "./HostelRoomBill.js";
import HostelRoomBillDistribution from "./HostelRoomBillDistribution.js";

export {
  HostelBuilding,
  HostelFloor,
  HostelRoom,
  HostelBed,
  HostelAllocation,
  HostelFeeStructure,
  HostelMessFeeStructure,
  HostelComplaint,
  HostelAttendance,
  HostelGatePass,
  HostelVisitor,
  HostelStayLog,
  HostelFine,
  HostelRoomBill,
  HostelRoomBillDistribution,
};

// -----------------------------------------------------------------------------
// Hostel Module Internal Associations
// -----------------------------------------------------------------------------

// HostelBuilding -> HostelFloor
HostelBuilding.hasMany(HostelFloor, { foreignKey: "building_id", as: "floors" });
HostelFloor.belongsTo(HostelBuilding, { foreignKey: "building_id", as: "building" });

// HostelBuilding -> HostelRoom
HostelBuilding.hasMany(HostelRoom, { foreignKey: "building_id", as: "rooms" });
HostelRoom.belongsTo(HostelBuilding, { foreignKey: "building_id", as: "building" });

// HostelFloor -> HostelRoom
HostelFloor.hasMany(HostelRoom, { foreignKey: "floor_id", as: "rooms" });
HostelRoom.belongsTo(HostelFloor, { foreignKey: "floor_id", as: "floor" });

// HostelRoom -> HostelBed
HostelRoom.hasMany(HostelBed, { foreignKey: "room_id", as: "beds" });
HostelBed.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });

// HostelAllocation associations
HostelAllocation.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
HostelRoom.hasMany(HostelAllocation, { foreignKey: "room_id", as: "allocations" });

HostelAllocation.belongsTo(HostelBed, { foreignKey: "bed_id", as: "bed" });
HostelBed.hasOne(HostelAllocation, { foreignKey: "bed_id", as: "allocation" });

HostelAllocation.belongsTo(HostelFeeStructure, { foreignKey: "fee_structure_id", as: "fee_structure" });

HostelAllocation.belongsTo(HostelMessFeeStructure, { as: "mess_fee_structure", foreignKey: "mess_fee_structure_id" });

// HostelComplaint associations
HostelComplaint.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });

// HostelStayLog associations
HostelStayLog.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
HostelStayLog.belongsTo(HostelBed, { foreignKey: "bed_id", as: "bed" });
HostelStayLog.belongsTo(HostelAllocation, { foreignKey: "allocation_id", as: "allocation" });
HostelAllocation.hasMany(HostelStayLog, { foreignKey: "allocation_id", as: "stayLogs" });

// HostelFine associations
HostelFine.belongsTo(HostelAllocation, { foreignKey: "allocation_id", as: "allocation" });

// HostelRoomBill associations
HostelRoomBill.belongsTo(HostelRoom, { foreignKey: "room_id", as: "room" });
HostelRoomBill.hasMany(HostelRoomBillDistribution, { foreignKey: "room_bill_id", as: "distributions" });
HostelRoom.hasMany(HostelRoomBill, { foreignKey: "room_id", as: "roomBills" });

// HostelRoomBillDistribution associations
HostelRoomBillDistribution.belongsTo(HostelRoomBill, { foreignKey: "room_bill_id", as: "roomBill" });
HostelRoomBillDistribution.belongsTo(HostelAllocation, { foreignKey: "allocation_id", as: "allocation" });

export default {
  HostelBuilding,
  HostelFloor,
  HostelRoom,
  HostelBed,
  HostelAllocation,
  HostelFeeStructure,
  HostelMessFeeStructure,
  HostelComplaint,
  HostelAttendance,
  HostelGatePass,
  HostelVisitor,
  HostelStayLog,
  HostelFine,
  HostelRoomBill,
  HostelRoomBillDistribution,
};
