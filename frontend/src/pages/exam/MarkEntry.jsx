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
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const MarkEntry = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reverificationOnly, setReverificationOnly] = useState(false);

  // New state for Question Paper Template
  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dispatch(
        fetchMarkEntryData({
          scheduleId,
          reverification_only: reverificationOnly,
        }),
      ).unwrap();
      setSchedule(res.schedule);
      setStudents(res.students);

      const initialMarks = {};
      res.students.forEach((s) => {
        initialMarks[s.id] = {
          attendance_status: s.mark?.attendance_status || "present",
          component_scores: s.mark?.component_scores || {},
          marks_obtained: s.mark?.marks_obtained || 0,
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
  }, [scheduleId, reverificationOnly, dispatch, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get Question Paper Template from schedule cycle
  useEffect(() => {
    if (schedule?.course_id) {
      const paperFormat = schedule.cycle?.paper_format || {};

      // Try resolving from new nested structure first
      let courseFormat = paperFormat.theory?.[schedule.course_id] || paperFormat.lab?.[schedule.course_id];

      // Fallback for old flat structure
      if (!courseFormat) {
        courseFormat = paperFormat[schedule.course_id];
      }

      if (courseFormat) {
        setTemplate({
          course_id: schedule.course_id,
          questions: courseFormat.questions || courseFormat.experiments || [],
          total_marks: courseFormat.total_marks,
        });
        setTemplateError(null);
      } else {
        setTemplate(null);
        setTemplateError(
          "Question Paper Format not configured for this course. Please configure it to enter marks.",
        );
      }
    }
  }, [schedule]);

  const calculateTotal = (componentScores) => {
    if (!componentScores) return 0;
    return Object.entries(componentScores).reduce((sum, [cName, cVal]) => {
      const score = typeof cVal === "object" ? (cVal.total || 0) : parseFloat(cVal || 0);
      return sum + score;
    }, 0);
  };

  const handleMarkChange = (studentId, field, value, componentName = null, qNo = null) => {
    setMarks((prev) => {
      const studentMark = { ...prev[studentId] };

      if (componentName) {
        if (qNo) {
          // Nested question score for a component (usually Descriptive)
          const prevCompData = studentMark.component_scores?.[componentName] || { q_scores: {}, total: 0 };
          const newQScores = {
            ...prevCompData.q_scores,
            [qNo]: value
          };
          const newCompTotal = Object.values(newQScores).reduce(
            (sum, v) => sum + parseFloat(v || 0),
            0
          );
          studentMark.component_scores = {
            ...studentMark.component_scores,
            [componentName]: {
              q_scores: newQScores,
              total: newCompTotal
            }
          };
        } else {
          // Regular scalar component score
          studentMark.component_scores = {
            ...studentMark.component_scores,
            [componentName]: value,
          };
        }
        studentMark.marks_obtained = calculateTotal(
          studentMark.component_scores,
        );
      } else {
        studentMark[field] = value;
      }

      return { ...prev, [studentId]: studentMark };
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll(".mark-input"));
      const index = inputs.indexOf(e.target);
      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    }
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
      .filter(
        (s) => reverificationOnly || marks[s.id].moderation_status !== "locked",
      )
      .map((s) => {
        const studentMark = { ...marks[s.id] };

        // If template exists, ensure component_scores are structured correctly?
        // Actually the current logic blindly saves what's in marks state, which is fine.
        // But we should retain the check for component_breakdown removal ONLY if template is NOT present.

        if (
          (!schedule?.cycle?.component_breakdown ||
            schedule.cycle.component_breakdown.length === 0) &&
          !template // Only clear component_scores if NO template AND no breakdown
        ) {
          studentMark.component_scores = null;
        }
        return {
          student_id: s.id,
          ...studentMark,
        };
      });

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
            status: "locked",
          }),
        ).unwrap();
        toast.success("Marks submitted and locked successfully!");
        fetchData();
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

  const isLocked =
    !reverificationOnly &&
    students.some(
      (s) =>
        marks[s.id]?.moderation_status === "locked" ||
        marks[s.id]?.moderation_status === "verified" ||
        marks[s.id]?.moderation_status === "approved",
    );

  const cycleType = (schedule?.cycle?.cycle_type || "").toLowerCase();
  const isLabCycle = cycleType === "internal_lab" || cycleType === "external_lab";

  // Simplified: only 'descriptive' for theory cycles should expand
  const isQuestionWiseComponent = (compName) => {
    const name = (compName || "").toLowerCase();
    return name === "descriptive";
  };

  // For lab cycles, find which component should expand based on name AND paper format existence
  const labExpansionIndex = isLabCycle && template?.questions?.length > 0
    ? (schedule?.cycle?.component_breakdown || []).findIndex(c => {
      const name = (c.name || "").toLowerCase();
      return ["lab record", "execution", "execution / output", "practical exam"].includes(name);
    })
    : -1;

  // Determine which component should be expanded
  const expansionIndex = isLabCycle ? labExpansionIndex :
    (schedule?.cycle?.component_breakdown || []).findIndex(
      c => isQuestionWiseComponent(c.name)
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
      {/* Header Section - Redesigned for better hierarchy */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd6bTAtNWg3djFoLTd6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-black px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full uppercase tracking-widest">
                {schedule?.cycle?.cycle_type?.replace("_", " ")}
              </span>
              <span className="text-[10px] font-black px-3 py-1 bg-amber-500/30 backdrop-blur-sm text-amber-100 rounded-full uppercase tracking-widest">
                Semester {schedule?.course?.semester}
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight mb-2">
              {schedule?.course?.name}
            </h1>
            <p className="text-indigo-100 text-sm font-medium flex items-center gap-2">
              <span className="font-black text-white">{schedule?.course?.code}</span>
              <span className="opacity-50">•</span>
              <Clock className="w-4 h-4" />
              {new Date(schedule?.exam_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">
                  Max Marks
                </p>
                <p className="text-3xl font-black">
                  {schedule?.max_marks || schedule?.cycle?.max_marks}
                </p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">
                  Students
                </p>
                <p className="text-3xl font-black">{students.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar - Redesigned for better visual separation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setReverificationOnly(!reverificationOnly)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${reverificationOnly
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100"
                }`}
            >
              {reverificationOnly ? "✓ Reverification Mode" : "Reverification Mode"}
            </button>

            {!isLocked && (
              <>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Bulk:
                </span>
                <button
                  onClick={() => handleBulkAttendance("present")}
                  className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-100 transition-all"
                >
                  All Present
                </button>
                <button
                  onClick={() => handleBulkAttendance("absent")}
                  className="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-xs font-black uppercase hover:bg-rose-100 transition-all"
                >
                  All Absent
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Marks Entry Table - Improved spacing and readability */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-700/30">
                <th rowSpan={2} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] w-12 text-center border-b border-gray-100 dark:border-gray-700">
                  #
                </th>
                <th rowSpan={2} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] min-w-[200px] border-b border-gray-100 dark:border-gray-700">
                  Student
                </th>
                <th rowSpan={2} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center min-w-[140px] border-b border-gray-100 dark:border-gray-700">
                  Attendance
                </th>

                {schedule?.cycle?.component_breakdown?.map((comp, idx) => {
                  // Expand THIS component if it's at expansionIndex AND has questions
                  if (idx === expansionIndex && template?.questions?.length > 0) {
                    return (
                      <th
                        key={idx}
                        colSpan={template.questions.length}
                        className="px-6 py-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] text-center bg-indigo-50/30 dark:bg-indigo-900/10 border-b border-indigo-100/50 dark:border-indigo-900/30"
                      >
                        {comp.name} (Max: {comp.max_marks})
                      </th>
                    );
                  }

                  // Otherwise ALWAYS show as regular column
                  return (
                    <th
                      key={idx}
                      rowSpan={2}
                      className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center min-w-[100px] border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {comp.name}
                        </span>
                        <span className="text-[9px] opacity-60 font-medium">
                          Max: {comp.max_marks}
                        </span>
                      </div>
                    </th>
                  );
                })}

                {(!schedule?.cycle?.component_breakdown || schedule.cycle.component_breakdown.length === 0) && template?.questions?.length > 0 && (
                  <th
                    colSpan={template.questions.length}
                    className="px-6 py-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] text-center bg-indigo-50/30 dark:bg-indigo-900/10 border-b border-indigo-100/50 dark:border-indigo-900/30"
                  >
                    {isLabCycle ? "Experiments" : "Descriptive"} (Max: {template.total_marks})
                  </th>
                )}

                <th rowSpan={2} className="px-6 py-5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em] text-center bg-indigo-50/50 dark:bg-indigo-900/10 min-w-[100px] border-b border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col items-center gap-1">
                    <span>Total</span>
                    <span className="text-[9px] opacity-60">
                      {schedule?.max_marks || schedule?.cycle?.max_marks}
                    </span>
                  </div>
                </th>
              </tr>
              <tr className="bg-gray-50/30 dark:bg-gray-700/10">
                {schedule?.cycle?.component_breakdown?.map((comp, idx) => {
                  // Only render subheaders for expanded component
                  if (idx === expansionIndex && template?.questions?.length > 0) {
                    return template.questions.map((q, qIdx) => {
                      const displayQNo = (q.q_no || "").startsWith("E") || (q.q_no || "").startsWith("Q") ? q.q_no : (isLabCycle ? `E${q.q_no}` : q.q_no);
                      return (
                        <th
                          key={`${idx}-${qIdx}`}
                          className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center min-w-[80px] border-b border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-indigo-400">{displayQNo}</span>
                            <span className="text-[8px] opacity-50">({q.marks}M)</span>
                          </div>
                        </th>
                      );
                    });
                  }
                  return null;
                })}

                {(!schedule?.cycle?.component_breakdown || schedule.cycle.component_breakdown.length === 0) && template?.questions?.length > 0 && template.questions.map((q, qIdx) => (
                  <th
                    key={`q-fallback-${qIdx}`}
                    className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-center min-w-[80px] border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-indigo-400">{q.q_no}</span>
                      <span className="text-[8px] opacity-50">({q.marks}M)</span>
                    </div>
                  </th>
                ))}
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
                    className={`group transition-all ${isAbsent
                      ? "bg-rose-50/30 dark:bg-rose-900/5"
                      : "hover:bg-gray-50/70 dark:hover:bg-gray-700/20"
                      }`}
                  >
                    <td className="px-6 py-5 text-center text-sm font-black text-gray-300 group-hover:text-indigo-400 transition-colors">
                      {index + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md uppercase">
                          {student.first_name[0]}
                          {student.last_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white leading-tight">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs font-bold text-indigo-600 mt-0.5">
                            {student.student_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
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
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 focus:ring-0 outline-none transition-all cursor-pointer ${mark.attendance_status === "present"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30"
                            : mark.attendance_status === "absent"
                              ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/30"
                              : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30"
                            }`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="malpractice">Malpractice</option>
                        </select>
                      </div>
                    </td>

                    {schedule?.cycle?.component_breakdown?.map((comp, idx) => {
                      if (idx === expansionIndex && template?.questions?.length > 0) {
                        return template.questions.map((q, qIdx) => (
                          <td key={`${idx}-${qIdx}`} className="px-6 py-5">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                min="0"
                                max={q.marks}
                                disabled={isEntryDisabled}
                                value={mark.component_scores?.[comp.name]?.q_scores?.[q.q_no] || ""}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (val > q.marks) {
                                    toast.error(`${q.q_no} max marks is ${q.marks}`);
                                    return;
                                  }
                                  handleMarkChange(
                                    student.id,
                                    null,
                                    e.target.value,
                                    comp.name,
                                    q.q_no
                                  );
                                }}
                                onKeyDown={handleKeyDown}
                                className={`w-16 px-2 py-2 mark-input bg-white dark:bg-gray-800 border-2 rounded-xl text-center font-black text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none ${isEntryDisabled
                                  ? "opacity-30 border-gray-100 dark:border-gray-700"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                  }`}
                              />
                            </div>
                          </td>
                        ));
                      }
                      return (
                        <td key={idx} className="px-6 py-5">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min="0"
                              max={comp.max_marks}
                              disabled={isEntryDisabled}
                              value={mark.component_scores?.[comp.name] || ""}
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
                              onKeyDown={handleKeyDown}
                              className={`w-16 px-2 py-2 mark-input bg-white dark:bg-gray-800 border-2 rounded-xl text-center font-black text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none ${isEntryDisabled
                                ? "opacity-30 border-gray-100 dark:border-gray-700"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                }`}
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Fallback questions if breakdown is empty */}
                    {(!schedule?.cycle?.component_breakdown || schedule.cycle.component_breakdown.length === 0) && template?.questions?.map((q, qIdx) => (
                      <td key={`fallback-${qIdx}`} className="px-6 py-5">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            max={q.marks}
                            disabled={isEntryDisabled}
                            value={mark.component_scores?.[isLabCycle ? "Execution" : "Descriptive"]?.q_scores?.[q.q_no] || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val > q.marks) {
                                toast.error(`${q.q_no} max marks is ${q.marks}`);
                                return;
                              }
                              handleMarkChange(
                                student.id,
                                null,
                                e.target.value,
                                isLabCycle ? "Execution" : "Descriptive",
                                q.q_no
                              );
                            }}
                            onKeyDown={handleKeyDown}
                            className={`w-16 px-2 py-2 mark-input bg-white dark:bg-gray-800 border-2 rounded-xl text-center font-black text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none ${isEntryDisabled
                              ? "opacity-30 border-gray-100 dark:border-gray-700"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                              }`}
                          />
                        </div>
                      </td>
                    ))}

                    {(!schedule?.cycle?.component_breakdown ||
                      schedule.cycle.component_breakdown.length === 0) && !template && (
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min="0"
                              max={schedule?.max_marks || schedule?.cycle?.max_marks}
                              disabled={isEntryDisabled}
                              value={mark.marks_obtained || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const maxAllowed =
                                  schedule?.max_marks || schedule?.cycle?.max_marks;
                                if (val > maxAllowed) {
                                  toast.error(`Max marks is ${maxAllowed}`);
                                  return;
                                }
                                handleTotalChange(student.id, e.target.value);
                              }}
                              onKeyDown={handleKeyDown}
                              className={`w-20 px-3 py-2.5 mark-input bg-white dark:bg-gray-800 border-2 rounded-xl text-center font-black text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none ${isEntryDisabled
                                ? "opacity-30 border-gray-100 dark:border-gray-700"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                }`}
                            />
                          </div>
                        </td>
                      )}

                    <td className="px-6 py-5 bg-indigo-50/30 dark:bg-indigo-900/10">
                      <div className="flex justify-center">
                        <div
                          className={`text-2xl font-black ${isEntryDisabled ? "text-gray-300" : "text-indigo-600"
                            }`}
                        >
                          {mark.marks_obtained}
                        </div>
                      </div>
                    </td>

                    {/* Remarks removed */}
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
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
              We couldn't find any students matching your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom for better UX */}
      <div className="sticky bottom-6 z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Layers className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    Components
                  </p>
                  <p className="text-sm font-black text-gray-700 dark:text-gray-200">
                    {template ? template.questions.length + " Questions" : (schedule?.cycle?.component_breakdown?.length || 0) + " Vectors"}
                  </p>
                </div>
              </div>
            </div>

            {!isLocked ? (
              <div className="flex gap-3">
                <button
                  disabled={saving || submitting}
                  onClick={() => saveMarks(false)}
                  className="flex items-center px-6 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-50 shadow-sm"
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
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  PUBLISH & LOCK
                </button>
              </div>
            ) : (
              <div className="flex items-center px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl font-black text-sm border-2 border-emerald-200 dark:border-emerald-900/30">
                <ShieldCheck className="w-5 h-5 mr-2" />
                MARKS LOCKED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkEntry;
