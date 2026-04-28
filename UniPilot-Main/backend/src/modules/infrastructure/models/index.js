import Block from "./Block.js";
import Room from "./Room.js";

export {
  Block,
  Room,
};

// -----------------------------------------------------------------------------
// Infrastructure Module Internal Associations
// -----------------------------------------------------------------------------

Block.hasMany(Room, { foreignKey: "block_id", as: "rooms" });
Room.belongsTo(Block, { foreignKey: "block_id", as: "block" });

export default {
  Block,
  Room,
};
