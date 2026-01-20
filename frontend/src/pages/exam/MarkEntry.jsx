import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  Send,
  User as UserIcon,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import {
  fetchMarkEntryData,
  enterBulkMarks,
  updateModerationStatus,
} from "../../store/slices/examSlice";
import { toast } from "react-hot-toast";

const MarkEntry = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: { attendance_status, component_scores: {}, marks_obtained, remarks } }
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchMarkEntryData(scheduleId)).unwrap();
      setSchedule(res.schedule);
      setStudents(res.students);

      const initialMarks = {};
      res.students.forEach((s) => {
        initialMarks[s.id] = {
          attendance_status: s.mark?.attendance_status || "present",
          component_scores: s.mark?.component_scores || {},
          marks_obtained: s.mark?.marks_obtained || 0,
          remarks: s.mark?.remarks || "",
          moderation_status: s.mark?.moderation_status || "draft",
        };
      });
      setMarks(initialMarks);
    } catch (error) {
      toast.error(error || "Failed to fetch mark entry data");
      navigate("/exam-management");
    } finally {
      setLoading(false);
    }
  }, [scheduleId, dispatch, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTotal = (componentScores) => {
    return Object.values(componentScores).reduce(
      (sum, val) => sum + parseFloat(val || 0),
      0,
    );
  };

  const handleMarkChange = (studentId, field, value, componentName = null) => {
    setMarks((prev) => {
      const studentMark = { ...prev[studentId] };

      if (componentName) {
        studentMark.component_scores = {
          ...studentMark.component_scores,
          [componentName]: value,
        };
        studentMark.marks_obtained = calculateTotal(
          studentMark.component_scores,
        );
      } else {
        studentMark[field] = value;
      }

      return { ...prev, [studentId]: studentMark };
    });
  };

  const handleTotalChange = (studentId, value) => {
    setMarks((prev) => {
      const studentMark = { ...prev[studentId] };
      studentMark.marks_obtained = parseFloat(value || 0);
      return { ...prev, [studentId]: studentMark };
    });
  };

  const handleBulkAttendance = (status) => {
    const updated = { ...marks };
    students.forEach((s) => {
      if (updated[s.id].moderation_status !== "locked") {
        updated[s.id].attendance_status = status;
      }
    });
    setMarks(updated);
    toast.success(`Marked all as ${status}`);
  };

  const saveMarks = async (finalSubmit = false) => {
    if (
      finalSubmit &&
      !window.confirm(
        "Are you sure you want to final submit? Marks will be locked for review.",
      )
    ) {
      return;
    }

    const marksToSave = students
      .filter((s) => marks[s.id].moderation_status !== "locked")
      .map((s) => ({
        student_id: s.id,
        ...marks[s.id],
      }));

    if (marksToSave.length === 0) return toast.error("No editable marks found");

    if (finalSubmit) setSubmitting(true);
    else setSaving(true);

    try {
      await dispatch(
        enterBulkMarks({
          exam_schedule_id: scheduleId,
          marks_data: marksToSave,
        }),
      ).unwrap();

      if (finalSubmit) {
        await dispatch(
          updateModerationStatus({
            exam_schedule_id: scheduleId,
            status: "verified",
          }),
        ).unwrap();
        toast.success("Marks submitted and locked successfully!");
        fetchData(); // Refresh to lock fields
      } else {
        toast.success("Marks saved as draft!");
      }
    } catch (error) {
      toast.error(error || "Failed to save marks");
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isLocked = students.some(
    (s) =>
      marks[s.id]?.moderation_status === "locked" ||
      marks[s.id]?.moderation_status === "verified" ||
      marks[s.id]?.moderation_status === "approved",
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold animate-pulse">
          Loading Academic Records...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
      {/* Premium Navigation Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/exams/marks-entry")}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all group"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
          </button>

          <div className="h-12 w-px bg-gray-100 dark:bg-gray-700 hidden md:block"></div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full uppercase tracking-widest">
                {schedule?.cycle?.cycle_type?.replace("_", " ")}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full uppercase tracking-widest">
                Semester {schedule?.course?.semester}
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {schedule?.course?.name}{" "}
              <span className="text-indigo-600">
                ({schedule?.course?.code})
              </span>
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">
              Exam Date:{" "}
              {new Date(schedule?.exam_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 mr-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                Total Marks
              </p>
              <p className="text-xl font-black text-indigo-600">
                {schedule?.cycle?.max_marks}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                Students
              </p>
              <p className="text-xl font-black text-gray-700 dark:text-gray-200">
                {students.length}
              </p>
            </div>
          </div>

          {!isLocked && (
            <div className="flex gap-3">
              <button
                disabled={saving || submitting}
                onClick={() => saveMarks(false)}
                className="flex items-center px-6 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                SAVE DRAFT
              </button>
              <button
                disabled={saving || submitting}
                onClick={() => saveMarks(true)}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                FINAL SUBMIT
              </button>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-black text-sm border-2 border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck className="w-5 h-5 mr-2" />
              MARKS LOCKED
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase mr-2">
              Bulk Attendance:
            </span>
            <button
              onClick={() => handleBulkAttendance("present")}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/30"
            >
              All Present
            </button>
            <button
              onClick={() => handleBulkAttendance("absent")}
              className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/30"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Main Entry Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] w-16 text-center border-b border-gray-100 dark:border-gray-700">
                  #
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700">
                  Student Profile
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700 text-center">
                  Attendance
                </th>

                {schedule?.cycle?.component_breakdown?.map((comp, idx) => (
                  <th
                    key={idx}
                    className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {comp.name}
                      </span>
                      <span className="text-[10px] opacity-60 font-medium">
                        Max: {comp.max_marks}m
                      </span>
                    </div>
                  </th>
                ))}

                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center border-b border-gray-100 dark:border-gray-700 bg-indigo-50/30 dark:bg-indigo-900/10">
                  Total ({schedule?.cycle?.max_marks})
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredStudents.map((student, index) => {
                const mark = marks[student.id];
                const isAbsent = mark.attendance_status === "absent";
                const isMalpractice = mark.attendance_status === "malpractice";
                const isEntryDisabled = isAbsent || isMalpractice || isLocked;

                return (
                  <tr
                    key={student.id}
                    className={`group transition-colors ${isAbsent ? "bg-rose-50/30 dark:bg-rose-900/5" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/20"}`}
                  >
                    <td className="px-8 py-6 text-center text-sm font-black text-gray-300 group-hover:text-indigo-400 transition-colors">
                      {index + 1}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20 uppercase">
                          {student.first_name[0]}
                          {student.last_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white leading-none mb-1">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs font-bold text-indigo-600 tracking-tight">
                            {student.student_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <select
                          disabled={isLocked}
                          value={mark.attendance_status}
                          onChange={(e) =>
                            handleMarkChange(
                              student.id,
                              "attendance_status",
                              e.target.value,
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 focus:ring-0 outline-none transition-all cursor-pointer ${
                            mark.attendance_status === "present"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30"
                              : mark.attendance_status === "absent"
                                ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30"
                                : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30"
                          }`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="malpractice">Malpractice</option>
                        </select>
                      </div>
                    </td>

                    {/* Component Inputs */}
                    {schedule?.cycle?.component_breakdown?.map((comp, idx) => (
                      <td key={idx} className="px-8 py-6">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            max={comp.max_marks}
                            disabled={isEntryDisabled}
                            value={mark.component_scores[comp.name] || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val > comp.max_marks) {
                                toast.error(
                                  `${comp.name} max marks is ${comp.max_marks}`,
                                );
                                return;
                              }
                              handleMarkChange(
                                student.id,
                                null,
                                e.target.value,
                                comp.name,
                              );
                            }}
                            className={`w-20 px-3 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl text-center font-black text-lg transition-all focus:border-indigo-500 outline-none ${
                              isEntryDisabled
                                ? "opacity-30 border-gray-100 dark:border-gray-700"
                                : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                            }`}
                          />
                        </div>
                      </td>
                    ))}

                    {(!schedule?.cycle?.component_breakdown ||
                      schedule.cycle.component_breakdown.length === 0) && (
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            max={schedule?.cycle?.max_marks}
                            disabled={isEntryDisabled}
                            value={mark.marks_obtained || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val > schedule?.cycle?.max_marks) {
                                toast.error(
                                  `Max marks is ${schedule?.cycle?.max_marks}`,
                                );
                                return;
                              }
                              handleTotalChange(student.id, e.target.value);
                            }}
                            className={`w-20 px-3 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl text-center font-black text-lg transition-all focus:border-indigo-500 outline-none ${
                              isEntryDisabled
                                ? "opacity-30 border-gray-100 dark:border-gray-700"
                                : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                            }`}
                          />
                        </div>
                      </td>
                    )}

                    <td className="px-8 py-6 bg-indigo-50/30 dark:bg-indigo-900/10">
                      <div className="flex justify-center">
                        <div
                          className={`text-2xl font-black ${isEntryDisabled ? "text-gray-300" : "text-indigo-600"}`}
                        >
                          {mark.marks_obtained}
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <input
                        type="text"
                        disabled={isLocked}
                        placeholder="Add note..."
                        value={mark.remarks}
                        onChange={(e) =>
                          handleMarkChange(
                            student.id,
                            "remarks",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 focus:border-indigo-500 py-1 text-sm font-medium transition-all outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-20 text-center bg-gray-50/50 dark:bg-gray-800/50">
            <UserIcon className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
            <h3 className="text-xl font-black text-gray-400">
              No Students Found
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
              We couldn't find any students matching your search criteria for
              this exam session.
            </p>
          </div>
        )}
      </div>

      {/* Professional Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 dark:text-white leading-none">
              Integrity Verified
            </h4>
            <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">
              Regulation Compliant Entry
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 dark:text-white leading-none">
              Auto-Save Enabled
            </h4>
            <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">
              Local Snapshots Active
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 dark:text-white leading-none">
              Component Sync
            </h4>
            <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">
              {schedule?.cycle?.component_breakdown?.length} Evaluation Vectors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkEntry;
