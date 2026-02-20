
import { ExamSchedule, ExamCycle, Regulation } from "./src/models/index.js";
import { sequelize } from "./src/config/database.js";

async function fixCycle() {
    try {
        const scheduleId = "7506e412-9aef-462c-8fab-3c36ef1052b5";
        const schedule = await ExamSchedule.findByPk(scheduleId);
        if (!schedule) {
            console.error("Schedule not found");
            return;
        }

        const cycle = await ExamCycle.findByPk(schedule.exam_cycle_id);
        if (!cycle) {
            console.error("Cycle not found");
            return;
        }

        console.log(`Checking Cycle ID: ${cycle.id}, Type: ${cycle.cycle_type}`);
        console.log("Current Component Breakdown:", JSON.stringify(cycle.component_breakdown));

        if (!cycle.component_breakdown || cycle.component_breakdown.length === 0) {
            console.log("Component breakdown is empty. Fetching regulation...");
            const regulation = await Regulation.findByPk(cycle.regulation_id);

            if (regulation && regulation.exam_structure) {
                const structure = regulation.exam_structure;
                let component_breakdown = [];
                let max_marks = 0;

                if (cycle.cycle_type.startsWith("mid_term")) {
                    const midConfig = structure.theory_courses?.mid_terms || {};
                    component_breakdown = midConfig.components || [];
                    max_marks = midConfig.total_marks || 0;
                } else if (cycle.cycle_type === "end_semester" || cycle.cycle_type === "semester_end_external") {
                    const endConfig = structure.theory_courses?.end_semester || {};
                    component_breakdown = endConfig.components || [];
                    max_marks = endConfig.total_marks || 0;
                }

                console.log("New Component Breakdown:", JSON.stringify(component_breakdown));

                cycle.component_breakdown = component_breakdown;
                if (max_marks > 0) cycle.max_marks = max_marks;

                await cycle.save();
                console.log("Cycle updated successfully!");
            } else {
                console.error("Regulation or exam structure not found");
            }
        } else {
            console.log("Cycle already has components. No action taken.");
        }
    } catch (error) {
        console.error("Error updating cycle:", error);
    } finally {
        // Force exit
        process.exit(0);
    }
}

fixCycle();
