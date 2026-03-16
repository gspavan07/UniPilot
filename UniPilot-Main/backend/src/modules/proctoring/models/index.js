import ProctorAssignment from "./ProctorAssignment.js";
import ProctorSession from "./ProctorSession.js";
import ProctorFeedback from "./ProctorFeedback.js";
import ProctorAlert from "./ProctorAlert.js";

export {
  ProctorAssignment,
  ProctorSession,
  ProctorFeedback,
  ProctorAlert,
};

// -----------------------------------------------------------------------------
// Proctoring Module Internal Associations
// -----------------------------------------------------------------------------

ProctorSession.belongsTo(ProctorAssignment, { as: "assignment", foreignKey: "assignment_id" });
ProctorAssignment.hasMany(ProctorSession, { as: "sessions", foreignKey: "assignment_id" });

ProctorFeedback.belongsTo(ProctorAssignment, { as: "assignment", foreignKey: "assignment_id" });
ProctorAssignment.hasMany(ProctorFeedback, { as: "feedback", foreignKey: "assignment_id" });

ProctorFeedback.belongsTo(ProctorSession, { as: "session", foreignKey: "session_id" });
ProctorSession.hasMany(ProctorFeedback, { as: "feedback", foreignKey: "session_id" });

export default {
  ProctorAssignment,
  ProctorSession,
  ProctorFeedback,
  ProctorAlert,
};
