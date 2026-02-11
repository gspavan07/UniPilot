import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  Clock,
  MapPin,
  ClipboardList,
  Download,
  ShieldCheck,
  RefreshCw,
  X,
  ArrowLeft,
  Edit,
  Trash2,
  Zap,
  LayoutDashboard,
  Lock,
  Settings,
  AlertCircle,
  MoreVertical,
  XCircle,
  User,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  fetchExamCycles,
  enterBulkMarks,
  createExamCycle,
  updateExamCycle,
  deleteExamCycle,
  fetchExamSchedules,
  addExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  deleteManySchedules,
  restoreExamSchedule,
  restoreManySchedules,
  deleteCycleTimetable,
  autoGenerateTimetable,
  fetchScheduleMarks,
  updateModerationStatus,
  fetchConsolidatedResults,
  fetchRegistrations,
  updateRegistrationStatus,
  bulkUpdateRegistrationStatus,
  waiveExamFine,
} from "../../store/slices/examSlice";
import { fetchCourses } from "../../store/slices/courseSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRegulations } from "../../store/slices/regulationSlice";
import api from "../../utils/api";
import { fetchBatchYears } from "../../store/slices/userSlice";
import QuestionPaperFormat from "./QuestionPaperFormat";


const ExamSchedules = () => {
  const dispatch = useDispatch();

  // Helper function to format program name (e.g., "B.Tech in Computer Science and Engineering" -> "B.Tech-CSE")
  const formatProgramName = (program) => {
    if (!program) return "Unknown";
    const degree = program.code?.split("-")[0] || program.degree_type || "";
    const branch = program.code?.split("-")[1] || program.name?.split(" in ")[1]?.split(" ").map(w => w[0]).join("") || "";
    return branch ? `${degree}-${branch}` : (program.code || program.name);
  };
  const {
    cycles,
    schedules,
    registrations,
    activeCycleConfig,
    status: examStatus,
  } = useSelector((state) => state.exam);
  const { batchYears } = useSelector((state) => state.users);
  const { courses } = useSelector((state) => state.courses);
  const { programs } = useSelector((state) => state.programs);
  const { regulations } = useSelector((state) => state.regulations);
  const { user } = useSelector((state) => state.auth);

  // Dynamically extract unique degrees from program names (e.g., "B.Tech" from "B.Tech in CSE")
  const uniqueDegrees = useMemo(() => {
    if (!programs) return [];
    const degrees = programs
      .map((p) => {
        if (!p.name) return "";
        // Extract part before " in " (case-insensitive split is safer but " in " is standard here)
        // Using strict " in " based on provided examples.
        const parts = p.name.split(" in ");
        return parts[0]?.trim();
      })
      .filter((d) => d); // Filter out empty/null
    return [...new Set(degrees)].sort();
  }, [programs]);

  const [viewMode, setViewMode] = useState("list"); // list, details
  const [activeTab, setActiveTab] = useState("timetable"); // timetable, marks, tickets, tabulation
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Ported Registration Management State
  const [regSearchTerm, setRegSearchTerm] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]); // For bulk actions
  const [showBulkOverrideModal, setShowBulkOverrideModal] = useState(false);
  const [bulkOverrideData, setBulkOverrideData] = useState({
    is_condoned: false,
    has_permission: false,
    override_status: false,
    override_remarks: "",
  });
  const [activeReg, setActiveReg] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideData, setOverrideData] = useState({
    status: "submitted",
    is_condoned: false,
    has_permission: false,
    override_status: false,
    override_remarks: "",
  });

  // View State for Cycle Tabs
  const [activeCycleTab, setActiveCycleTab] = useState("upcoming");

  // Derive unique batch years and semesters from cycles
  const uniqueBatches = [
    ...new Set(cycles.map((c) => c.batch_year).filter(Boolean)),
  ].sort((a, b) => b - a);
  const uniqueSemesters = [
    ...new Set(cycles.map((c) => c.semester).filter(Boolean)),
  ].sort((a, b) => a - b);

  // Filter cycles based on selected batch, semester and active tab
  const filteredCycles = cycles.filter((c) => {
    const matchesBatch =
      !selectedBatch || c.batch_year === parseInt(selectedBatch, 10);
    const matchesSemester =
      !selectedSemester || c.semester === parseInt(selectedSemester, 10);

    const isCompleted = c.status === "results_published";
    const matchesTab =
      activeCycleTab === "upcoming" ? !isCompleted : isCompleted;

    return matchesBatch && matchesSemester && matchesTab;
  });

  // Create Cycle Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    batch_year: 2025,
    semester: 1,
    regulation_id: "",
    cycle_type: "",
    instance_number: 1,
    reg_start_date: "",
    reg_end_date: "",
    reg_late_fee_date: "",
    regular_fee: 0,
    supply_fee_per_paper: 0,
    late_fee_amount: 0,
    condonation_fee: 0,
    is_attendance_checked: true,
    is_fee_checked: true,
    attendance_condonation_threshold: 75.0,
    attendance_permission_threshold: 65.0,
    exam_mode: "regular",
    exam_month: "",
    exam_year: new Date().getFullYear(),
    status: "scheduled",
    program_id: "", // Helper for name generation
  });
  const [editingCycle, setEditingCycle] = useState(null);

  const [availableSemesters, setAvailableSemesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [validationMsg, setValidationMsg] = useState({ type: "", text: "" });
  const prevStatus = useRef(cycleForm.status);

  const [viewingCycleRaw, setViewingCycleRaw] = useState(null);
  const viewingCycle =
    cycles.find((c) => c.id === selectedCycle) || viewingCycleRaw;

  // Timetable/Schedule State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    exam_cycle_id: "",
    course_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    venue: "",
    max_marks: 100,
    passing_marks: 35,
    programs: [],
  });
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Auto-generation State
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoForm, setAutoForm] = useState({
    start_date: "",
    gap_days: 1,
    start_time: "09:00",
    end_time: "12:00",
    semester: "",
    exam_sub_type: "theory", // For semester_end_external: theory or lab
    isTwoExamsPerDay: false,
    afternoon_start_time: "14:00",
    afternoon_end_time: "17:00",
  });

  // Marks Entry State
  const [studentList, setStudentList] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: marks }
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modal Specific Filters (to avoid crosstalk)
  const [modalFilters, setModalFilters] = useState({
    program_id: "",
    semester: "",
  });
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  // Tabulation State
  const [tabulationData, setTabulationData] = useState([]);
  const [loadingTabulation, setLoadingTabulation] = useState(false);



  const selectedRegObj = regulations.find(
    (r) => r.id === cycleForm.regulation_id,
  );
  const midTermCount =
    selectedRegObj?.exam_structure?.theory_courses?.mid_terms?.count || 3;

  const fetchTabulationData = async () => {
    if (
      !selectedProgram ||
      !viewingCycle?.semester ||
      !viewingCycle?.batch_year
    )
      return;
    setLoadingTabulation(true);
    try {
      const res = await dispatch(
        fetchConsolidatedResults({
          program_id: selectedProgram,
          semester: viewingCycle.semester,
          batch_year: viewingCycle.batch_year,
          section: examSection,
          exam_cycle_id: selectedCycle, // CRITICAL: Pass cycle ID for filtering
        }),
      ).unwrap();
      setTabulationData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTabulation(false);
    }
  };

  useEffect(() => {
    dispatch(fetchExamCycles());
    dispatch(fetchCourses());
    dispatch(fetchPrograms());
    dispatch(fetchRegulations());
  }, [dispatch]);


  useEffect(() => {
    dispatch(fetchBatchYears());
  }, [dispatch]);


  useEffect(() => {
    if (viewMode === "details" && selectedCycle) {
      dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));
    }
  }, [viewMode, selectedCycle, dispatch]);

  useEffect(() => {
    if ((viewMode === "details" || showCreateModal) && viewingCycle) {
      // Try to infer degree from name if possible (e.g. "B.Tech_R20_...")
      let inferredDegree = "";
      if (viewingCycle.name) {
        const firstPart = viewingCycle.name.split("_")[0];
        if (firstPart === "B.Tech" || firstPart === "M.Tech") {
          inferredDegree = firstPart;
        }
      }

      setCycleForm({
        name: viewingCycle.name || "",
        start_date: viewingCycle.start_date || "",
        end_date: viewingCycle.end_date || "",
        batch_year: viewingCycle.batch_year || "",
        semester: viewingCycle.semester || "",
        regulation_id: viewingCycle.regulation_id || "",
        cycle_type: viewingCycle.cycle_type || "",
        instance_number: viewingCycle.instance_number || 1,
        exam_mode: viewingCycle.exam_mode || "regular",
        reg_start_date: viewingCycle.reg_start_date || "",
        reg_end_date: viewingCycle.reg_end_date || "",
        reg_late_fee_date: viewingCycle.reg_late_fee_date || "",
        regular_fee: viewingCycle.regular_fee || 0,
        supply_fee_per_paper: viewingCycle.supply_fee_per_paper || 0,
        late_fee_amount: viewingCycle.late_fee_amount || 0,
        condonation_fee: viewingCycle.condonation_fee || 0,
        attendance_condonation_threshold: viewingCycle.attendance_condonation_threshold || 75.0,
        attendance_permission_threshold: viewingCycle.attendance_permission_threshold || 65.0,
        is_attendance_checked: viewingCycle.is_attendance_checked ?? true,
        is_fee_checked: viewingCycle.is_fee_checked ?? true,
        exam_month: viewingCycle.exam_month || "",
        exam_year: viewingCycle.exam_year || new Date().getFullYear(),
        program_id: inferredDegree, // Set the inferred degree
      });
    }
  }, [viewMode, viewingCycle, showCreateModal]);

  const [regSubjectFilter, setRegSubjectFilter] = useState("");

  useEffect(() => {
    if (activeTab === "registrations" && selectedCycle) {
      dispatch(
        fetchRegistrations({
          cycleId: selectedCycle,
          courseId: regSubjectFilter,
        }),
      );
    }
  }, [activeTab, selectedCycle, regSubjectFilter, dispatch]);

  const handleOverride = async () => {
    if (!overrideData.override_remarks) {
      alert("Please provide remarks for this action");
      return;
    }
    try {
      const updatedReg = await dispatch(
        updateRegistrationStatus({
          id: activeReg.id,
          data: {
            ...overrideData,
            exam_cycle_id: selectedCycle,
          },
        }),
      ).unwrap();

      alert("Registration status updated successfully");
      setShowOverrideModal(false);

      // Optimistic / Immediate Update of the registrations list
      // This ensures the green ticks appear immediately
      if (registrations) {
        // Deep clone or just map to return new objects
        const updatedList = registrations.map((r) => {
          if (r.id === activeReg.id) {
            return {
              ...r,
              registration: {
                ...r.registration,
                is_condoned: overrideData.is_condoned,
                has_permission: overrideData.has_permission,
                override_status: overrideData.override_status,
                override_remarks: overrideData.override_remarks,
              },
              // Re-evaluate eligibility block (simplified) - logic matches backend roughly
              // Note: Ideally backend returns the full object structure, but for speed we patch:
            };
          }
          return r;
        });

        // We can't directly setRegistrations since it comes from Redux store props usually.
        // BUT, notice we are dispatching 'updateRegistrationStatus'.
        // Let's check if the reducer updates the state.
        // The reducer DOES update state.registrations[index] = action.payload.
        // So Redux should trigger a re-render.
        // However, 'activeReg' might be stale if it's used elsewhere, but here we just set it to null.
      }
      setActiveReg(null);
    } catch (err) {
      alert(err || "Failed to update status");
    }
  };

  const handleWaiveFine = async (reg) => {
    if (
      window.confirm(
        "Are you sure you want to waive the late fee for this student?",
      )
    ) {
      try {
        await dispatch(waiveExamFine(reg.id)).unwrap();
        alert("Fine waived successfully");
        dispatch(fetchRegistrations(selectedCycle));
      } catch (err) {
        alert(err || "Failed to waive fine");
      }
    }
  };

  const filteredRegistrations = (registrations || []).filter((student) => {
    const matchesSearch =
      student.student?.name
        ?.toLowerCase()
        .includes(regSearchTerm.toLowerCase()) ||
      student.student?.student_id
        ?.toLowerCase()
        .includes(regSearchTerm.toLowerCase()) ||
      student.student?.email
        ?.toLowerCase()
        .includes(regSearchTerm.toLowerCase());

    // New eligibility-based filtering
    let matchesStatus = true;
    if (regStatusFilter) {
      if (regStatusFilter === "eligible") {
        matchesStatus = student.eligibility?.is_eligible === true;
      } else if (regStatusFilter === "blocked") {
        matchesStatus = student.eligibility?.is_eligible === false;
      } else if (regStatusFilter === "needs_condonation") {
        matchesStatus =
          student.attendance?.tier === "needs_condonation" ||
          student.attendance?.tier === "needs_permission";
      } else if (regStatusFilter === "needs_permission") {
        matchesStatus = student.attendance?.tier === "needs_permission";
      }
    }

    return matchesSearch && matchesStatus;
  });

  const [activeSchedule, setActiveSchedule] = useState(null);
  const [examSection, setExamSection] = useState("");
  const [sheetStatus, setSheetStatus] = useState("draft");

  const fetchStudentsForMarks = async (courseId, section = "") => {
    if (!courseId) return;
    setLoadingStudents(true);
    setMarksData({});
    setSheetStatus("draft");

    // 1. Find the schedule
    const schedule = schedules.find(
      (s) => s.course_id === courseId && s.exam_cycle_id === selectedCycle,
    );
    setActiveSchedule(schedule || null);

    if (!schedule) {
      setLoadingStudents(false);
      return;
    }

    try {
      // 2. Fetch Marks Entry Data (which includes registered students and existing marks)
      const res = await api.get(`/exam/marks/entry-data/${schedule.id}`);
      const { students: registeredStudents } = res.data.data;

      setStudentList(registeredStudents);

      // 3. Prepare initial marks state
      const initial = {};
      if (registeredStudents.length > 0 && registeredStudents[0].mark) {
        setSheetStatus(registeredStudents[0].mark.moderation_status || "draft");
      }

      registeredStudents.forEach((s) => {
        initial[s.id] = {
          marks_obtained: s.mark ? s.mark.marks_obtained : "",
          component_scores: s.mark?.component_scores || {},
        };
      });
      setMarksData(initial);
    } catch (error) {
      console.error("Failed to fetch students/marks", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!cycleForm.name) {
      alert("Cycle name is not generated yet. Please ensure all required fields are selected.");
      return;
    }
    if (!cycleForm.batch_year) {
      alert("Batch year is required.");
      return;
    }
    if (!cycleForm.semester) {
      alert("Semester is required.");
      return;
    }
    if (!cycleForm.cycle_type) {
      alert("Cycle type is required.");
      return;
    }
    if (!cycleForm.regulation_id) {
      alert("Regulation is required.");
      return;
    }
    if (!cycleForm.program_id) {
      alert("Degree is required for name generation.");
      return;
    }
    if (!cycleForm.exam_month) {
      alert("Exam month is required.");
      return;
    }
    if (!cycleForm.exam_year) {
      alert("Exam year is required.");
      return;
    }

    // Create clean payload without UI-only helper fields
    const payload = { ...cycleForm };
    delete payload.program_id;

    if (editingCycle) {
      dispatch(
        updateExamCycle({ id: editingCycle.id, cycleData: payload }),
      ).then(async (res) => {
        if (!res.error) {
          // Trigger timeline deletion for the cycle
          await dispatch(deleteCycleTimetable(editingCycle.id));

          setShowCreateModal(false);
          setEditingCycle(null);
          setViewingCycleRaw(res.payload); // Update active view if needed
          alert("Exam cycle updated and previous timetable deleted successfully!");
        }
      });
    } else {
      dispatch(createExamCycle(payload)).then((res) => {
        if (!res.error) {
          setShowCreateModal(false);
          setCycleForm({
            name: "",
            start_date: "",
            end_date: "",
            batch_year: batchYears[0] || 2024,
            semester: 1,
            regulation_id: "",
            cycle_type: "",
            instance_number: 1,
            exam_mode: "regular",
            reg_start_date: "",
            reg_end_date: "",
            reg_late_fee_date: "",
            regular_fee: 0,
            supply_fee_per_paper: 0,
            late_fee_amount: 0,
            condonation_fee: 0,
            attendance_condonation_threshold: 75.0,
            attendance_permission_threshold: 65.0,
            is_attendance_checked: true,
            is_fee_checked: true,
            exam_month: "",
            exam_year: new Date().getFullYear(),
            program_id: "", // Reset program_id
          });
          alert("Exam cycle created successfully!");
        }
      });
    }
  };

  // Sync exam_month and exam_year from start_date
  useEffect(() => {
    if (cycleForm.start_date && showCreateModal) {
      const dateParts = cycleForm.start_date.split("-");
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const monthName = months[month - 1];

        if (monthName && (cycleForm.exam_month !== monthName || cycleForm.exam_year !== year)) {
          setCycleForm(prev => ({
            ...prev,
            exam_month: monthName,
            exam_year: year
          }));
        }
      }
    }
  }, [cycleForm.start_date, showCreateModal]);

  // Sync start_date from exam_month and exam_year
  useEffect(() => {
    if (cycleForm.exam_month && cycleForm.exam_year && cycleForm.start_date && showCreateModal) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthIndex = months.indexOf(cycleForm.exam_month);
      const year = parseInt(cycleForm.exam_year);

      const dateParts = cycleForm.start_date.split("-");
      if (dateParts.length === 3 && monthIndex !== -1 && !isNaN(year)) {
        const currYear = parseInt(dateParts[0]);
        const currMonth = parseInt(dateParts[1]);
        const currDay = parseInt(dateParts[2]);

        if (currMonth !== monthIndex + 1 || currYear !== year) {
          const newMM = (monthIndex + 1).toString().padStart(2, "0");
          const newYYYY = year.toString();

          // Adjust day if it exceeds the max days in the new month
          let day = currDay;
          const maxDaysInNewMonth = new Date(year, monthIndex + 1, 0).getDate();
          if (day > maxDaysInNewMonth) day = maxDaysInNewMonth;
          const newDD = day.toString().padStart(2, "0");

          const newStartDate = `${newYYYY}-${newMM}-${newDD}`;
          if (newStartDate !== cycleForm.start_date) {
            setCycleForm(prev => ({ ...prev, start_date: newStartDate }));
          }
        }
      }
    }
  }, [cycleForm.exam_month, cycleForm.exam_year, showCreateModal]);

  // Filter Semesters based on Batch Year and Student Presence
  useEffect(() => {
    const fetchValidSemesters = async () => {
      if (!cycleForm.batch_year) {
        setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
        return;
      }

      setLoadingSemesters(true);

      try {
        // Query users table for that batch year students to see which they are in (current_semester)
        // Note: we don't pass program_id here because cycleForm.program_id is a string (e.g. "B.Tech") 
        // but backend expects UUID. Future enhancement: resolve program code to UUID before querying.
        const res = await api.get(`/users/semesters?batch_year=${cycleForm.batch_year}&role=student`);
        let validSems = res.data.data;

        if (validSems && validSems.length > 0) {
          validSems = validSems.sort((a, b) => a - b);
          setAvailableSemesters(validSems);
          // If current selection is not in valid sems
          if (!validSems.includes(cycleForm.semester)) {
            // Default to the highest semester likely (current)
            setCycleForm(prev => ({ ...prev, semester: validSems[validSems.length - 1] }));
          }
        } else {
          // If no students found, show all as fallback
          setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
        }
      } catch (error) {
        console.error("Error checking semesters:", error);
        setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
      } finally {
        setLoadingSemesters(false);
      }
    };

    if (showCreateModal) {
      fetchValidSemesters();
    }
  }, [cycleForm.batch_year, showCreateModal]);

  // Auto-generate Cycle Name
  useEffect(() => {
    if (showCreateModal) {
      const selectedReg = regulations.find((r) => r.id === cycleForm.regulation_id);

      if (cycleForm.program_id && selectedReg && cycleForm.semester) {
        const programCode = cycleForm.program_id; // Now it's "B.Tech" or "M.Tech"
        const regName = selectedReg.name;

        // Roman Numeral Conversion
        const toRoman = (num) => {
          const roman = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII" };
          return roman[num] || num;
        };
        const semNumber = toRoman(cycleForm.semester);

        // Exam Name Generation
        let examName = "";
        if (cycleForm.cycle_type === "mid_term_1") {
          examName = "Mid-1";
        } else if (cycleForm.cycle_type === "mid_term_2") {
          examName = "Mid-2";
        } else if (cycleForm.cycle_type === "semester_end_external") {
          examName = "Semester";
        } else if (cycleForm.cycle_type === "internal_lab") {
          examName = "Internal-Lab";
        } else if (cycleForm.cycle_type === "external_lab") {
          examName = "External-Lab";
        } else if (cycleForm.cycle_type === "project_review") {
          examName = "Project-Review";
        } else {
          examName = (cycleForm.cycle_type || "")
            .replace(/_/g, "-")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        }

        // Exam Type/Mode Formatting
        let examType = "Regular";
        if (cycleForm.exam_mode === "supplementary") {
          examType = "Supply";
        } else if (cycleForm.exam_mode === "combined") {
          examType = "Regular + Supply";
        }

        const month = cycleForm.exam_month ? cycleForm.exam_month.substring(0, 3) : "";
        const year = cycleForm.exam_year || "";
        const scheduledExamMonth = month && year ? `${month}-${year}` : "";
        const batchNo = cycleForm.batch_year || "";

        // Format: {program}_{regulation}_{sem_number}_{exam_name}-Examinations_{exam_type}_{scheduled_exam_month}_Batch{batch_no}
        // Based on examples: B.Tech_R20_VII_Semester_Examinations(Regular)_Feb-2026_Batch-2022
        // We use -Examinations as per template/other examples, and (Mode) matching examples.

        let generatedName = `${programCode}_${regName}_${semNumber}_${examName}-Examinations(${examType})`;

        if (scheduledExamMonth) {
          generatedName += `_${scheduledExamMonth}`;
        }
        if (batchNo) {
          generatedName += `_Batch-${batchNo}`;
        }

        setCycleForm((prev) => ({ ...prev, name: generatedName }));
      }
    }
  }, [
    cycleForm.program_id,
    cycleForm.regulation_id,
    cycleForm.semester,
    cycleForm.batch_year,
    cycleForm.cycle_type,
    cycleForm.instance_number,
    cycleForm.exam_mode,
    cycleForm.exam_month,
    cycleForm.exam_year,
    showCreateModal,
    regulations,
  ]);

  // Status and Date Cross-Validation
  useEffect(() => {
    if (!showCreateModal) return;

    const today = new Date().setHours(0, 0, 0, 0);
    const tomorrow = new Date(today).setDate(new Date(today).getDate() + 1);
    const start = cycleForm.start_date ? new Date(cycleForm.start_date).setHours(0, 0, 0, 0) : null;
    const end = cycleForm.end_date ? new Date(cycleForm.end_date).setHours(0, 0, 0, 0) : null;
    const statusChanged = prevStatus.current !== cycleForm.status;

    let updates = {};
    let msg = "";

    // Rule 1: Scheduled status requires future start_date
    if (cycleForm.status === "scheduled") {
      if (statusChanged && start && start < tomorrow) {
        updates.start_date = new Date(tomorrow).toISOString().split("T")[0];
        msg = "Start date reset to tomorrow for Scheduled status.";
      } else if (!statusChanged && start && start < tomorrow) {
        if (start < today && end && end < today) {
          updates.status = "completed";
          msg = "Status changed to completed (dates in past).";
        } else if (start <= today) {
          updates.status = "ongoing";
          msg = "Status changed to ongoing (start date not in future).";
        }
      }
    }

    // Rule 2: Ongoing status requires start_date <= today
    if (cycleForm.status === "ongoing" && start && start > today) {
      updates.start_date = new Date(today).toISOString().split("T")[0];
      msg = "Start date adjusted to today for Ongoing status.";
    }

    // Rule 3: Completed/Published status requires end_date <= today
    if ((cycleForm.status === "completed" || cycleForm.status === "results_published") && end && end > today) {
      updates.end_date = new Date(today).toISOString().split("T")[0];
      msg = "End date adjusted to today for Completed status.";
    }

    // Rule 4: end_date must be >= start_date
    const finalStart = updates.start_date ? new Date(updates.start_date).setHours(0, 0, 0, 0) : start;
    const finalEnd = updates.end_date ? new Date(updates.end_date).setHours(0, 0, 0, 0) : end;
    if (finalStart && finalEnd && finalEnd < finalStart) {
      updates.end_date = updates.start_date || cycleForm.start_date;
      msg = "End date adjusted to match start date.";
    }

    if (Object.keys(updates).length > 0) {
      setCycleForm(prev => ({ ...prev, ...updates }));
      setValidationMsg({ type: "info", text: msg });
    }

    prevStatus.current = cycleForm.status;
  }, [cycleForm.status, cycleForm.start_date, cycleForm.end_date, showCreateModal]);

  const handleDeleteCycle = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this exam cycle? This will also delete all associated exam schedules and marks.",
      )
    ) {
      dispatch(deleteExamCycle(id)).then((res) => {
        if (!res.error) {
          alert("Exam cycle deleted successfully!");
        }
      });
    }
  };

  const handleAddScheduleBtn = () => {
    setEditingSchedule(null);
    setModalFilters({
      program_id: selectedProgram || "",
      semester: viewingCycle?.semester || "",
    });
    setScheduleForm({
      exam_cycle_id: selectedCycle,
      course_id: "",
      exam_date: "",
      start_time: "",
      end_time: "",
      venue: "",
      max_marks: viewingCycle?.max_marks || 100,
      passing_marks: viewingCycle?.passing_marks || 35,
      programs: [],
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (editingSchedule) {
      dispatch(
        updateExamSchedule({
          id: editingSchedule.id,
          scheduleData: scheduleForm,
        }),
      ).then((res) => {
        if (!res.error) {
          setShowScheduleModal(false);
          setEditingSchedule(null);
          alert("Schedule updated successfully!");
        }
      });
    } else {
      dispatch(addExamSchedule(scheduleForm)).then((res) => {
        if (!res.error) {
          setShowScheduleModal(false);
          setScheduleForm({
            ...scheduleForm,
            course_id: "",
            exam_date: "",
            start_time: "",
            end_time: "",
          });
          alert("Exam schedule added successfully!");
        }
      });
    }
  };

  // Undo/Redo State
  const [undoData, setUndoData] = useState(null);

  const showUndo = (message, onUndo) => {
    if (undoData?.timer) clearTimeout(undoData.timer);
    const timer = setTimeout(() => setUndoData(null), 8000); // 8 seconds to undo
    setUndoData({ message, onUndo, timer });
  };

  const handleUndoClick = async () => {
    if (!undoData) return;
    if (undoData.timer) clearTimeout(undoData.timer);

    // Save current undo data to execute
    const currentUndo = undoData;
    setUndoData(null);

    try {
      const result = await currentUndo.onUndo();
      // If undo action returns a redo definition, show it
      if (result && result.redoAction) {
        showUndo(result.message || "Action undone. [Redo]", result.redoAction);
      } else {
        // Just refresh to update UI if no specific redo
        await dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));
      }
    } catch (err) {
      console.error("Undo failed", err);
      alert("Action failed");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      await dispatch(deleteExamSchedule(id));

      // Setup Undo
      showUndo("Schedule deleted.", async () => {
        await dispatch(restoreExamSchedule(id));
        await dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));

        // Return Redo capability (delete again)
        return {
          message: "Schedule restored.",
          redoAction: async () => {
            await dispatch(deleteExamSchedule(id));

            // If we redo (re-delete), we can allow undo again? 
            // Yes, but let's keep it simple: just re-delete and show toast again
            showUndo("Schedule deleted.", async () => {
              await dispatch(restoreExamSchedule(id));
              await dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));
              return { message: "Schedule restored.", redoAction: null };
            });

            return null; // Redo action itself returns nothing to prevent recursive toast logic here if handled manually
          }
        };
      });
    }
  };

  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    setAutoGenerating(true);
    try {
      const res = await dispatch(
        autoGenerateTimetable({ ...autoForm, exam_cycle_id: selectedCycle }),
      );
      if (!res.error) {
        setShowAutoModal(false);
        // await dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle })); // No need to refetch if reducer handles it
        alert(res.payload?.message || "Timetable generated successfully!");
      }
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleDeleteTimetables = async () => {
    const programName = selectedProgram
      ? programs.find(p => p.id === selectedProgram)?.name
      : "all programs";

    if (!window.confirm(
      `Are you sure you want to delete timetables for ${programName}? This action cannot be undone.`
    )) return;

    try {
      const schedulesToDelete = schedules.filter(s =>
        !selectedProgram ||
        s.course?.program_id === selectedProgram ||
        (s.programs && s.programs.includes(selectedProgram))
      );

      if (schedulesToDelete.length === 0) {
        return alert("No schedules found to delete.");
      }

      const scheduleIds = schedulesToDelete.map(s => s.id);

      // Perform bulk delete
      // Perform bulk delete
      const res = await dispatch(deleteManySchedules(scheduleIds));

      if (!res.error) {
        showUndo(`${scheduleIds.length} schedules deleted.`, async () => {
          await dispatch(restoreManySchedules(scheduleIds));
          await dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));

          return {
            message: "Schedules restored.",
            redoAction: async () => {
              await dispatch(deleteManySchedules(scheduleIds));
              showUndo(`${scheduleIds.length} schedules deleted.`, async () => {
                await dispatch(restoreManySchedules(scheduleIds));
                await dispatch(fetchExamSchedules({ exam_cycle_id: selectedCycle }));
                return { message: "Schedules restored.", redoAction: null };
              });
              return null;
            }
          };
        });
      } else {
        alert("Failed to delete some schedules");
      }
    } catch (err) {
      alert("Failed to delete timetables");
    }
  };

  const handleMarksSubmit = () => {
    if (sheetStatus === "locked")
      return alert("Marks are locked and cannot be edited.");

    const marks_data = Object.keys(marksData).map((sid) => ({
      student_id: sid,
      marks_obtained: parseFloat(marksData[sid]?.marks_obtained) || 0,
      component_scores: marksData[sid]?.component_scores || {},
      attendance_status: "present",
      remarks: "",
    }));

    dispatch(
      enterBulkMarks({
        exam_schedule_id: activeSchedule?.id,
        marks_data,
      }),
    ).then((res) => {
      if (!res.error) {
        alert("Marks saved as Draft successfully");
        setSheetStatus("draft");
      }
    });
  };

  const handleModeration = async (newStatus) => {
    if (!activeSchedule) return;
    try {
      await dispatch(
        updateModerationStatus({
          exam_schedule_id: activeSchedule.id,
          status: newStatus,
        }),
      ).unwrap();
      setSheetStatus(newStatus);
      alert(`Results marked as ${newStatus} successfully`);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Exam Schedules</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create and manage exam cycles and timetables
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {viewMode === "details" && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCycle(viewingCycle);
                  setCycleForm({
                    name: viewingCycle.name,
                    start_date: viewingCycle.start_date,
                    end_date: viewingCycle.end_date,
                    batch_year: viewingCycle.batch_year,
                    semester: viewingCycle.semester,
                    regulation_id: viewingCycle.regulation_id || "",
                    cycle_type: viewingCycle.cycle_type || "",
                    instance_number: viewingCycle.instance_number || 1,
                    exam_mode: viewingCycle.exam_mode || "regular",
                    reg_start_date: viewingCycle.reg_start_date || "",
                    reg_end_date: viewingCycle.reg_end_date || "",
                    reg_late_fee_date: viewingCycle.reg_late_fee_date || "",
                    regular_fee: viewingCycle.regular_fee || 0,
                    supply_fee_per_paper: viewingCycle.supply_fee_per_paper || 0,
                    late_fee_amount: viewingCycle.late_fee_amount || 0,
                    condonation_fee: viewingCycle.condonation_fee || 0,
                    attendance_condonation_threshold: viewingCycle.attendance_condonation_threshold || 75.0,
                    attendance_permission_threshold: viewingCycle.attendance_permission_threshold || 65.0,
                    is_attendance_checked: viewingCycle.is_attendance_checked ?? true,
                    is_fee_checked: viewingCycle.is_fee_checked ?? true,
                    exam_month: viewingCycle.exam_month || "",
                    exam_year: viewingCycle.exam_year || new Date().getFullYear(),
                    status: viewingCycle.status || "scheduling",
                  });
                  setShowCreateModal(true);
                }}
                className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Cycle
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cycles
              </button>
            </div>
          )}
          {viewMode === "details" &&
            activeTab === "timetable" &&
            (user?.role === "super_admin" ||
              user?.permissions?.includes("exams:manage")) && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAutoForm({
                      ...autoForm,
                      max_marks: viewingCycle?.max_marks || 100,
                      passing_marks: viewingCycle?.passing_marks || 35,
                    });
                    setShowAutoModal(true);
                  }}
                  className="flex items-center px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Zap className="w-4 h-4 mr-2" /> Auto-Generate
                </button>
                <button
                  onClick={handleAddScheduleBtn}
                  className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Schedule
                </button>
              </div>
            )}
          {viewMode === "list" &&
            (user?.role === "super_admin" ||
              user?.permissions?.includes("exams:manage")) && (
              <button
                onClick={() => {
                  setEditingCycle(null);
                  setCycleForm({
                    name: "",
                    start_date: "",
                    end_date: "",
                    batch_year: batchYears[0] || 2025,
                    semester: 1,
                    regulation_id: "",
                    cycle_type: "",
                    instance_number: 1,
                    exam_mode: "regular",
                    reg_start_date: "",
                    reg_end_date: "",
                    reg_late_fee_date: "",
                    regular_fee: 0,
                    supply_fee_per_paper: 0,
                    late_fee_amount: 0,
                    condonation_fee: 0,
                    attendance_condonation_threshold: 75.0,
                    attendance_permission_threshold: 65.0,
                    is_attendance_checked: true,
                    is_fee_checked: true,
                    exam_month: "",
                    exam_year: new Date().getFullYear(),
                    program_id: "",
                  });
                  setShowCreateModal(true);
                }}
                className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4 mr-2" /> Create Exam Cycle
              </button>
            )}
        </div>
      </header>

      {/* View Mode Switching */}
      {viewMode === "list" ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
              <button
                onClick={() => setActiveCycleTab("upcoming")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCycleTab === "upcoming"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
              >
                <Clock className="w-4 h-4" />
                Upcoming
              </button>
              <button
                onClick={() => setActiveCycleTab("completed")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCycleTab === "completed"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                Completed
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-gray-400">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">
                  Quick Filters:
                </span>
              </div>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg py-2 px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((year) => (
                  <option key={year} value={year}>
                    {year} Batch
                  </option>
                ))}
              </select>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg py-2 px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Semesters</option>
                {uniqueSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCycles?.map((cycle) => (
              <div
                key={cycle.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-indigo-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    {(user?.role === "super_admin" ||
                      user?.permissions?.includes("exams:manage")) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCycle(cycle);
                              setCycleForm({
                                name: cycle.name,
                                start_date: cycle.start_date,
                                end_date: cycle.end_date,
                                batch_year: cycle.batch_year,
                                semester: cycle.semester,
                                regulation_id: cycle.regulation_id || "",
                                cycle_type: cycle.cycle_type || "",
                                instance_number: cycle.instance_number || 1,
                                exam_mode: cycle.exam_mode || "regular",
                                reg_start_date: cycle.reg_start_date || "",
                                reg_end_date: cycle.reg_end_date || "",
                                reg_late_fee_date: cycle.reg_late_fee_date || "",
                                regular_fee: cycle.regular_fee || 0,
                                supply_fee_per_paper: cycle.supply_fee_per_paper || 0,
                                late_fee_amount: cycle.late_fee_amount || 0,
                                condonation_fee: cycle.condonation_fee || 0,
                                attendance_condonation_threshold: cycle.attendance_condonation_threshold || 75.0,
                                attendance_permission_threshold: cycle.attendance_permission_threshold || 65.0,
                                is_attendance_checked: cycle.is_attendance_checked ?? true,
                                is_fee_checked: cycle.is_fee_checked ?? true,
                                exam_month: cycle.exam_month || "",
                                exam_year: cycle.exam_year || new Date().getFullYear(),
                                status: cycle.status || "scheduling",
                              });
                              setShowCreateModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${cycle.status === "results_published"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : cycle.status === "ongoing"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : cycle.status === "scheduling"
                            ? "bg-gray-50 text-gray-600 border-gray-100"
                            : cycle.status === "completed"
                              ? "bg-purple-50 text-purple-600 border-purple-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                    >
                      {cycle.status === "results_published"
                        ? "Results Published"
                        : cycle.status === "scheduling"
                          ? "Scheduling"
                          : cycle.status === "ongoing"
                            ? "Ongoing"
                            : cycle.status === "completed"
                              ? "Completed"
                              : "Scheduled"}
                    </span>
                    {(user?.role === "super_admin" ||
                      user?.permissions?.includes("exams:manage")) && (
                        <button
                          onClick={() => handleDeleteCycle(cycle.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Cycle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{cycle.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                    Batch {cycle.batch_year}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                    Sem {cycle.semester}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600">
                    {cycle.cycle_type?.replace("_", " ")}
                  </span>
                  {cycle.regulation && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600">
                      {cycle.regulation.name}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  {cycle.start_date
                    ? `${cycle.start_date} to ${cycle.end_date}`
                    : "Dates not scheduled"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setViewingCycleRaw(cycle);
                      setSelectedCycle(cycle.id);
                      setViewMode("details");
                    }}
                    className="text-indigo-600 text-sm font-bold flex items-center group-hover:underline"
                  >
                    Manage Cycle <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredCycles?.length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200">
                <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-10 animate-spin-slow" />
                <p>No active exam cycles found.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Details View Mode */
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingCycle?.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                      Batch {viewingCycle?.batch_year}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                      Sem {viewingCycle?.semester}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 rounded text-indigo-600">
                      {viewingCycle?.cycle_type?.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest border ${viewingCycle?.status === "results_published"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                    >
                      {viewingCycle?.status === "results_published"
                        ? "Results Published"
                        : "Result Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                {[
                  { id: "timetable", label: "Timetable", icon: Clock },
                  ...(viewingCycle?.cycle_type === "semester_end_external"
                    ? [
                      {
                        id: "registrations",
                        label: "Students",
                        icon: User,
                      },
                    ]
                    : []),
                  { id: "paper_format", label: "Paper Format", icon: FileText },
                  ...(viewingCycle?.cycle_type === "semester_end_external"
                    ? [
                      { id: "config", label: "Settings", icon: Settings },
                    ]
                    : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "timetable" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase">
                        Program Filter:
                      </span>
                    </div>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-none rounded-xl py-2 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Programs</option>
                      {programs?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(user?.role === "super_admin" || user?.permissions?.includes("exams:manage")) && schedules?.length > 0 && (
                    <button
                      onClick={handleDeleteTimetables}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete {selectedProgram ? "Program" : "All"} Timetables
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Target Programs</th>
                        <th className="px-6 py-4">Course Name</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Max Marks</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {schedules
                        ?.filter(
                          (s) =>
                            !selectedProgram ||
                            !s.programs ||
                            s.programs.length === 0 ||
                            s.programs.includes(selectedProgram) ||
                            s.programs.includes(selectedProgram),
                        )
                        ?.map((s) => {
                          const prog = programs.find(
                            (p) => p.id === s.course?.program_id,
                          );
                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                  {s.programs && s.programs.length > 0 ? (
                                    s.programs.map((bId, idx) => {
                                      const bProg = programs.find(
                                        (p) => p.id === bId,
                                      );
                                      return (
                                        <span key={bId}>
                                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-md uppercase">
                                            {formatProgramName(bProg)}
                                          </span>
                                          {idx < s.programs.length - 1 && <span className="text-gray-400">, </span>}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-500 font-bold rounded-md uppercase">
                                      Common
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-sm">
                                  {s.course?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {s.course?.code}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {new Date(s.exam_date).toLocaleDateString(
                                  "en-GB",
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {s.start_time.substring(0, 5)} -{" "}
                                {s.end_time.substring(0, 5)}
                              </td>

                              <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                {s.max_marks}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {s.is_teaching && (
                                    <Link
                                      to={`/marks-entry/${s.id}`}
                                      className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                                      title="Enter Marks"
                                    >
                                      <ClipboardList className="w-4 h-4" />
                                    </Link>
                                  )}

                                  {(user?.role === "super_admin" ||
                                    user?.permissions?.includes(
                                      "exams:manage",
                                    )) && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingSchedule(s);
                                            // Find the course to set correct filters
                                            const course = courses.find((c) => c.id === s.course_id) || s.course;

                                            setScheduleForm({
                                              exam_cycle_id: s.exam_cycle_id,
                                              course_id: s.course_id,
                                              exam_date: s.exam_date,
                                              start_time: s.start_time,
                                              end_time: s.end_time,
                                              venue: s.venue,
                                              max_marks: s.max_marks,
                                              passing_marks: s.passing_marks,
                                              programs: s.programs || [],
                                            });

                                            // Set filters so the current course is visible in the dropdown
                                            if (course) {
                                              setModalFilters({
                                                program_id: course.program_id || "",
                                                semester: course.semester || "",
                                              });
                                            } else {
                                              setModalFilters({
                                                program_id: "",
                                                semester: "",
                                              });
                                            }
                                            setShowScheduleModal(true);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                                          title="Edit Schedule"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteSchedule(s.id)
                                          }
                                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                          title="Delete Schedule"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {schedules?.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-12 text-center text-gray-400"
                          >
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-10" />
                            <p>No schedules found for this selection.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "marks" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                      Select Course / Subject
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        fetchStudentsForMarks(e.target.value, examSection);
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    >
                      <option value="">Choose Course</option>
                      {courses?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                      Section filter
                    </label>
                    <select
                      value={examSection}
                      onChange={(e) => {
                        setExamSection(e.target.value);
                        if (selectedCourse) {
                          fetchStudentsForMarks(selectedCourse, e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    >
                      <option value="">All Sections</option>
                      {["A", "B", "C", "D", "E"].map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                      Sheet Status
                    </label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${sheetStatus === "locked"
                          ? "bg-red-100 text-red-600"
                          : sheetStatus === "approved"
                            ? "bg-green-100 text-green-600"
                            : sheetStatus === "verified"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {sheetStatus}
                      </span>
                      {activeSchedule && (
                        <span className="text-[10px] text-gray-400 font-medium italic">
                          {activeSchedule.max_marks} Max /{" "}
                          {activeSchedule.passing_marks} Pass
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedCourse && !activeSchedule && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-4 rounded-xl flex items-center text-amber-800 dark:text-amber-200">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg mr-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Exam Not Scheduled</h4>
                      <p className="text-sm opacity-80">
                        Please add an exam schedule for this course in the
                        current cycle before entering marks.
                      </p>
                    </div>
                  </div>
                )}

                {selectedCourse && activeSchedule && (
                  <div className="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-400 uppercase">
                        Max Marks
                      </p>
                      <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                        {activeSchedule.max_marks}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-400 uppercase">
                        Passing Marks
                      </p>
                      <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                        {activeSchedule.passing_marks}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-400 uppercase">
                        Date
                      </p>
                      <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                        {new Date(
                          activeSchedule.exam_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Roll No</th>
                        {activeSchedule?.cycle?.component_breakdown?.map(
                          (comp, idx) => (
                            <th key={idx} className="px-6 py-4 text-center">
                              {comp.name} ({comp.max_marks})
                            </th>
                          ),
                        )}
                        <th className="px-6 py-4 text-center w-40">
                          Total Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {studentList?.map((student) => {
                        const hasComponents =
                          activeSchedule?.cycle?.component_breakdown?.length >
                          0;
                        const data = marksData[student.id] || {
                          marks_obtained: "",
                          component_scores: {},
                        };

                        return (
                          <tr
                            key={student.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              {student.student_id}
                            </td>

                            {activeSchedule?.cycle?.component_breakdown?.map(
                              (comp, idx) => (
                                <td key={idx} className="px-6 py-4 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={comp.max_marks}
                                    disabled={
                                      !activeSchedule ||
                                      sheetStatus === "locked"
                                    }
                                    value={
                                      data.component_scores?.[comp.name] || ""
                                    }
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      const newComponentScores = {
                                        ...data.component_scores,
                                        [comp.name]: newVal,
                                      };

                                      // Auto-calculate total
                                      const newTotal = Object.values(
                                        newComponentScores,
                                      ).reduce(
                                        (sum, val) =>
                                          sum + parseFloat(val || 0),
                                        0,
                                      );

                                      setMarksData({
                                        ...marksData,
                                        [student.id]: {
                                          ...data,
                                          component_scores: newComponentScores,
                                          marks_obtained: newTotal,
                                        },
                                      });
                                    }}
                                    className="w-20 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-medium disabled:opacity-50"
                                    placeholder="0"
                                  />
                                </td>
                              ),
                            )}

                            <td className="px-6 py-4 text-center">
                              <input
                                type="number"
                                disabled={
                                  !activeSchedule ||
                                  sheetStatus === "locked" ||
                                  hasComponents
                                }
                                value={data.marks_obtained || ""}
                                onChange={(e) =>
                                  setMarksData({
                                    ...marksData,
                                    [student.id]: {
                                      ...data,
                                      marks_obtained: e.target.value,
                                    },
                                  })
                                }
                                className={`w-24 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold disabled:opacity-50 ${hasComponents
                                  ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                                  : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                  }`}
                                placeholder="0.0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {studentList.length === 0 && !loadingStudents && (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-12 text-center text-gray-400"
                          >
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-10" />
                            Please select a course to load marks entry sheet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  {/* Phase 1: Faculty Entry */}
                  {(user.role === "faculty" ||
                    user.role === "admin" ||
                    user.role === "super_admin") &&
                    (sheetStatus === "draft" || sheetStatus === "verified") && (
                      <button
                        onClick={handleMarksSubmit}
                        disabled={
                          !selectedCourse ||
                          !activeSchedule ||
                          studentList.length === 0
                        }
                        className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-indigo-500 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-bold shadow-sm"
                      >
                        Save as Draft
                      </button>
                    )}

                  {/* Phase 2: HOD Verification */}
                  {(user.role === "hod" ||
                    user.role === "admin" ||
                    user.role === "super_admin") &&
                    sheetStatus === "draft" && (
                      <button
                        onClick={() => handleModeration("verified")}
                        disabled={
                          !selectedCourse ||
                          !activeSchedule ||
                          studentList.length === 0
                        }
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20"
                      >
                        Verify Mark Sheet
                      </button>
                    )}

                  {/* Phase 3: CoE Approval */}
                  {(user.role === "admin" || user.role === "super_admin") &&
                    sheetStatus === "verified" && (
                      <button
                        onClick={() => handleModeration("approved")}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-green-500/20"
                      >
                        Approve Results
                      </button>
                    )}

                  {/* Phase 4: Locking */}
                  {(user.role === "admin" || user.role === "super_admin") &&
                    sheetStatus === "approved" && (
                      <button
                        onClick={() => handleModeration("locked")}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-red-500/20"
                      >
                        Lock & Finalize
                      </button>
                    )}

                  {sheetStatus === "locked" && (
                    <div className="flex items-center gap-2 text-red-600 font-bold px-4 py-2 bg-red-50 rounded-lg">
                      <Lock className="w-4 h-4" />
                      Results are Locked
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "tabulation" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold uppercase text-gray-500">
                      Filters:
                    </span>
                  </div>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Choose Program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={examSection}
                    onChange={(e) => setExamSection(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Sections</option>
                    {["A", "B", "C", "D", "E"].map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={fetchTabulationData}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingTabulation ? "animate-spin" : ""}`}
                    />
                    {loadingTabulation
                      ? "Processing..."
                      : "Generate Tabulation"}
                  </button>

                  {tabulationData.length > 0 && (
                    <button className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export Result Sheet
                    </button>
                  )}
                </div>

                {tabulationData.length > 0 && (
                  <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                          <th className="px-6 py-4">Student Details</th>
                          <th className="px-6 py-4">
                            Course-wise Performance (Weighted)
                          </th>
                          <th className="px-6 py-4 text-center">
                            Semester SGPA
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tabulationData.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm text-gray-900 dark:text-white">
                                {row.first_name} {row.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {row.student_id} | Sec {row.section}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {row.courses.map((c) => (
                                  <div
                                    key={c.course_code}
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 min-w-[140px]"
                                  >
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">
                                      {c.course_code}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs font-bold">
                                        {c.grade}
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {c.totalScore}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-4 py-1.5 rounded-xl font-bold text-sm ${parseFloat(row.sgpa) >= 8
                                  ? "bg-green-100 text-green-700"
                                  : parseFloat(row.sgpa) >= 6
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-indigo-100 text-indigo-700"
                                  }`}
                              >
                                {row.sgpa}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {tabulationData.length === 0 && !loadingTabulation && (
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <LayoutDashboard className="w-16 h-16 text-indigo-100 mb-4" />
                    <h3 className="text-lg font-bold">No Tabulation Data</h3>
                    <p className="text-gray-500 max-w-sm text-center">
                      Select a program and section, then click Generate to
                      process final semester results.
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "registrations" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={regSearchTerm}
                        onChange={(e) => setRegSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 border-none rounded-xl pl-12 pr-6 py-2.5 text-sm focus:ring-2 focus:ring-indigo-600 shadow-sm"
                      />
                    </div>
                    <select
                      value={regSubjectFilter}
                      onChange={(e) => setRegSubjectFilter(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-600 shadow-sm min-w-[200px]"
                    >
                      <option value="">All Subjects</option>
                      {schedules
                        .filter(
                          (s) =>
                            s.exam_cycle_id === selectedCycle ||
                            s.cycle?.id === selectedCycle,
                        )
                        .map((s) => (
                          <option key={s.id} value={s.course_id}>
                            {s.course?.code} - {s.course?.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!regStatusFilter ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white dark:bg-gray-700 text-gray-400 hover:bg-gray-50"}`}
                      onClick={() => setRegStatusFilter("")}
                    >
                      All Students
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regStatusFilter === "eligible" ? "bg-green-600 text-white shadow-lg shadow-green-500/20" : "bg-white dark:bg-gray-700 text-gray-400 hover:bg-gray-50"}`}
                      onClick={() => setRegStatusFilter("eligible")}
                    >
                      Eligible
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regStatusFilter === "blocked" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "bg-white dark:bg-gray-700 text-gray-400 hover:bg-gray-50"}`}
                      onClick={() => setRegStatusFilter("blocked")}
                    >
                      Blocked
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regStatusFilter === "needs_condonation" ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/20" : "bg-white dark:bg-gray-700 text-gray-400 hover:bg-gray-50"}`}
                      onClick={() => setRegStatusFilter("needs_condonation")}
                    >
                      Needs Cond.
                    </button>
                    <button
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regStatusFilter === "needs_permission" ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20" : "bg-white dark:bg-gray-700 text-gray-400 hover:bg-gray-50"}`}
                      onClick={() => setRegStatusFilter("needs_permission")}
                    >
                      Needs HOD
                    </button>
                  </div>
                </div>

                {/* Bulk Action Bar */}
                {selectedStudents.length > 0 && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-sm">
                        {selectedStudents.length} Selected
                      </div>
                      <button
                        onClick={() => setSelectedStudents([])}
                        className="text-sm text-indigo-600 hover:underline font-bold"
                      >
                        Clear Selection
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setBulkData({
                            is_condoned: false,
                            has_permission: false,
                            override_status: false,
                            override_remarks: "",
                          });
                          setShowBulkOverrideModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Bulk Override
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                        <th className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={
                              selectedStudents.length ===
                              filteredRegistrations.length &&
                              filteredRegistrations.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(
                                  filteredRegistrations.map((s) => s.id),
                                );
                              } else {
                                setSelectedStudents([]);
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </th>
                        <th className="px-8 py-4">Student</th>
                        <th className="px-8 py-4">Type</th>
                        <th className="px-8 py-4">Attendance</th>
                        <th className="px-8 py-4">Fee Due</th>
                        <th className="px-8 py-4 text-center">Eligibility</th>
                        <th className="px-8 py-4">Exam Fee</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {examStatus === "loading" ? (
                        <tr>
                          <td colSpan="7" className="px-8 py-20 text-center">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="font-bold text-gray-400">
                              Loading students...
                            </p>
                          </td>
                        </tr>
                      ) : filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map((student) => (
                          <tr
                            key={student.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            {/* Checkbox */}
                            <td className="px-4 py-6">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudents([
                                      ...selectedStudents,
                                      student.id,
                                    ]);
                                  } else {
                                    setSelectedStudents(
                                      selectedStudents.filter(
                                        (id) => id !== student.id,
                                      ),
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </td>

                            {/* Student Info */}
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600">
                                  <User className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-black text-gray-900 dark:text-white leading-none mb-1">
                                    {student.student?.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                    {student.student?.student_id} • Sec{" "}
                                    {student.student?.section}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-8 py-6">
                              <span
                                className={`text-[9px] px-2 py-0.5 font-black rounded uppercase tracking-widest ${student.type === "regular"
                                  ? "bg-blue-50 text-blue-600"
                                  : student.type === "supply"
                                    ? "bg-purple-50 text-purple-600"
                                    : "bg-orange-50 text-orange-600"
                                  }`}
                              >
                                {student.type}
                              </span>
                            </td>

                            {/* Attendance */}
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-black text-sm ${student.attendance?.tier === "clear"
                                      ? "text-green-600"
                                      : student.attendance?.tier ===
                                        "needs_condonation"
                                        ? "text-yellow-600"
                                        : "text-orange-600"
                                      }`}
                                  >
                                    {student.attendance?.percentage}%
                                  </span>
                                  {/* Tier Badge */}
                                  {student.attendance?.tier !== "clear" && (
                                    <div className="flex gap-1">
                                      {(student.attendance?.tier ===
                                        "needs_condonation" ||
                                        student.attendance?.tier ===
                                        "needs_permission") && (
                                          <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-yellow-50 text-yellow-700">
                                            Cond.
                                          </span>
                                        )}
                                      {student.attendance?.tier ===
                                        "needs_permission" && (
                                          <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-orange-50 text-orange-700">
                                            HOD
                                          </span>
                                        )}
                                    </div>
                                  )}
                                </div>
                                {/* Override badges */}
                                {student.registration?.is_condoned && (
                                  <span className="text-[8px] text-green-600 font-black uppercase tracking-tighter">
                                    ✓ Condoned
                                  </span>
                                )}
                                {student.registration?.has_permission && (
                                  <span className="text-[8px] text-green-600 font-black uppercase tracking-tighter">
                                    ✓ HOD Approved
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Fee Due */}
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                {student.fee_due?.status === "clear" ? (
                                  <div className="flex items-center gap-1.5 text-green-500">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase">
                                      Clear
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-red-600">
                                      ₹{student.fee_due?.amount || 0}
                                    </span>
                                    <span className="text-[8px] text-red-500 font-bold uppercase">
                                      Pending
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Eligibility */}
                            <td className="px-8 py-6 text-center">
                              {student.eligibility?.is_eligible ? (
                                <div className="flex items-center justify-center text-green-500 gap-1.5">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">
                                    Eligible
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center text-red-500 gap-1.5">
                                    <XCircle className="w-5 h-5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                      Blocked
                                    </span>
                                  </div>
                                  {/* Show blockers */}
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {student.eligibility?.blockers?.map(
                                      (blocker, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[7px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-black uppercase"
                                        >
                                          {blocker === "needs_hod_permission"
                                            ? "HOD"
                                            : blocker === "needs_condonation"
                                              ? "Cond"
                                              : blocker === "fee_pending"
                                                ? "Fee"
                                                : "Admin"}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Exam Fee Status */}
                            <td className="px-8 py-6">
                              {student.registration?.fee_status == "paid" ? (
                                <div className="flex flex-col">
                                  <span className="text-[9px] px-2 py-0.5 font-black rounded uppercase tracking-widest bg-green-50 text-green-600 inline-block text-center mb-1">
                                    Paid
                                  </span>
                                  <span className="text-[8px] text-gray-400 font-mono">
                                    {student.exam_fee_status?.transaction_id}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[9px] px-2 py-0.5 font-black rounded uppercase tracking-widest bg-orange-50 text-orange-600 inline-block text-center">
                                  Pending
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() => {
                                  setActiveReg(student);
                                  setOverrideData({
                                    status:
                                      student.registration_status ===
                                        "not_registered"
                                        ? "approved"
                                        : student.registration_status,
                                    is_condoned:
                                      student.registration?.is_condoned ||
                                      false,
                                    has_permission:
                                      student.registration?.has_permission ||
                                      false,
                                    override_status:
                                      student.registration?.override_status ||
                                      false,
                                    override_remarks:
                                      student.registration?.override_remarks ||
                                      "",
                                  });
                                  setShowOverrideModal(true);
                                }}
                                className="p-2 rounded-xl transition-colors bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-indigo-600"
                              >
                                <ShieldCheck className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-8 py-20 text-center">
                            <Search className="w-12 h-12 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
                            <p className="font-bold text-gray-400 italic">
                              No students found matching your filters.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "paper_format" && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <QuestionPaperFormat currentCycle={viewingCycle} />
              </div>
            )}

            {activeTab === "config" &&
              viewingCycle?.cycle_type === "semester_end_external" && (
                <div className="space-y-8 animate-fade-in">
                  {/* Header Insight */}
                  <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h3 className="text-2xl font-black mb-2">
                          Cycle Configuration
                        </h3>
                        <p className="text-indigo-200 text-sm max-w-md">
                          Manage registration timelines, professional fee
                          structures and automated eligibility policies for the
                          end semester examinations.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(
                            updateExamCycle({
                              id: viewingCycle.id,
                              cycleData: cycleForm,
                            }),
                          ).then((res) => {
                            if (!res.error)
                              alert("Configuration updated successfully!");
                          });
                        }}
                        className="px-8 py-3 bg-white text-indigo-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                        Save Configuration
                      </button>
                    </div>
                    <Settings className="absolute -right-8 -bottom-8 w-48 h-48 text-indigo-800 opacity-20 rotate-12" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Timeline Card */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tight">
                          Registration Timeline
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={cycleForm.reg_start_date}
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  reg_start_date: e.target.value,
                                })
                              }
                              className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={cycleForm.reg_end_date}
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  reg_end_date: e.target.value,
                                })
                              }
                              className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                            Late Fee Deadline
                          </label>
                          <input
                            type="date"
                            value={cycleForm.reg_late_fee_date}
                            onChange={(e) =>
                              setCycleForm({
                                ...cycleForm,
                                reg_late_fee_date: e.target.value,
                              })
                            }
                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                          />
                          <p className="text-[10px] text-gray-400 font-medium italic mt-1 px-1">
                            * Students registering after this date will be
                            charged the configured late fee.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fee Card */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl">
                          <Download className="w-6 h-6 rotate-180" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">
                            Cycle Configuration
                          </p>
                          <h4 className="text-lg font-black uppercase tracking-tight">
                            Fees & Policies
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest mb-4">
                            Exam Mode
                          </h4>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${viewingCycle.exam_mode === "regular"
                                ? "bg-blue-100 text-blue-700"
                                : viewingCycle.exam_mode === "supplementary"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-purple-100 text-purple-700"
                                }`}
                            >
                              {viewingCycle.exam_mode === "combined"
                                ? "Regular + Supplementary"
                                : viewingCycle.exam_mode}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest mb-4">
                          Professional Fees (₹)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(cycleForm.exam_mode === "regular" ||
                            cycleForm.exam_mode === "combined") && (
                              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                  Regular Fee
                                </span>
                                <input
                                  type="number"
                                  value={cycleForm.regular_fee}
                                  onChange={(e) =>
                                    setCycleForm({
                                      ...cycleForm,
                                      regular_fee: parseFloat(e.target.value),
                                    })
                                  }
                                  className="w-32 bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-right font-black text-indigo-600 focus:ring-2 focus:ring-green-600"
                                />
                              </div>
                            )}
                          {(cycleForm.exam_mode === "supplementary" ||
                            cycleForm.exam_mode === "combined") && (
                              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Backlog Fee
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    (Per Paper)
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={cycleForm.supply_fee_per_paper}
                                  onChange={(e) =>
                                    setCycleForm({
                                      ...cycleForm,
                                      supply_fee_per_paper: parseFloat(
                                        e.target.value,
                                      ),
                                    })
                                  }
                                  className="w-32 bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-right font-black text-indigo-600 focus:ring-2 focus:ring-green-600"
                                />
                              </div>
                            )}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                              Late Fine
                            </span>
                            <input
                              type="number"
                              value={cycleForm.late_fee_amount}
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  late_fee_amount: parseFloat(e.target.value),
                                })
                              }
                              className="w-32 bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-right font-black text-indigo-600 focus:ring-2 focus:ring-green-600"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                Condonation Fee
                              </span>
                              <span className="text-[10px] text-gray-400">
                                (For Low Attendance)
                              </span>
                            </div>
                            <input
                              type="number"
                              value={cycleForm.condonation_fee || 0}
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  condonation_fee: parseFloat(e.target.value),
                                })
                              }
                              className="w-32 bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-right font-black text-indigo-600 focus:ring-2 focus:ring-green-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Policies */}
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tight">
                          Automated Eligibility Rules
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent hover:border-purple-200 transition-all group">
                        <div className="max-w-[70%]">
                          <p className="text-sm font-black uppercase tracking-wider mb-1">
                            Attendance Check
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            Verify student attendance percentage against
                            regulation requirements before allowing
                            registration.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={cycleForm.is_attendance_checked}
                            onChange={(e) =>
                              setCycleForm({
                                ...cycleForm,
                                is_attendance_checked: e.target.checked,
                              })
                            }
                          />
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent hover:border-purple-200 transition-all group">
                        <div className="max-w-[70%]">
                          <p className="text-sm font-black uppercase tracking-wider mb-1">
                            Fee Clearance Check
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            Auto-block hall ticket downloads if semester tuition
                            fees or other academic dues are outstanding.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={cycleForm.is_fee_checked}
                            onChange={(e) =>
                              setCycleForm({
                                ...cycleForm,
                                is_fee_checked: e.target.checked,
                              })
                            }
                          />
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Attendance Thresholds */}
                    {cycleForm.is_attendance_checked && (
                      <div className="mt-6 p-6 bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] border-2 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-purple-600 text-white rounded-xl">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black uppercase tracking-wider">
                              Attendance Thresholds
                            </h5>
                            <p className="text-xs text-gray-500 font-medium">
                              Configure multi-tier attendance policy
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest px-1">
                              Condonation Threshold (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={
                                cycleForm.attendance_condonation_threshold || 75
                              }
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  attendance_condonation_threshold: parseFloat(
                                    e.target.value,
                                  ),
                                })
                              }
                              className="w-full bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-xl px-4 py-3 text-base font-bold text-purple-600 focus:ring-2 focus:ring-purple-600 outline-none"
                            />
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium px-1">
                              Below this requires admin condonation
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-widest px-1">
                              HOD Permission Threshold (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={
                                cycleForm.attendance_permission_threshold || 65
                              }
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  attendance_permission_threshold: parseFloat(
                                    e.target.value,
                                  ),
                                })
                              }
                              className="w-full bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 rounded-xl px-4 py-3 text-base font-bold text-orange-600 focus:ring-2 focus:ring-orange-600 outline-none"
                            />
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium px-1">
                              Below this requires condonation + HOD approval
                            </p>
                          </div>
                        </div>

                        {/* Visual Tier Explanation */}
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-black text-green-700 dark:text-green-400">
                                CLEAR
                              </span>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              ≥{" "}
                              {cycleForm.attendance_condonation_threshold || 75}
                              %
                            </p>
                          </div>

                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">
                                CONDONATION
                              </span>
                            </div>
                            <p className="text-xs text-yellow-600 dark:text-yellow-500">
                              {cycleForm.attendance_permission_threshold || 65}%
                              -{" "}
                              {cycleForm.attendance_condonation_threshold || 75}
                              %
                            </p>
                          </div>

                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-xs font-black text-orange-700 dark:text-orange-400">
                                HOD APPROVAL
                              </span>
                            </div>
                            <p className="text-xs text-orange-600 dark:text-orange-500">
                              &lt;{" "}
                              {cycleForm.attendance_permission_threshold || 65}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                        Settings will only apply to End-Semester Examination
                        cycles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingCycle ? "Edit Exam Cycle" : "New Exam Cycle"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                  Cycle Name <span className="text-[10px] text-gray-400 lowercase italic">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Will be generated automatically"
                  value={cycleForm.name}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 border-none rounded-xl focus:ring-0 outline-none mb-4 cursor-not-allowed"
                />

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                      Degree
                    </label>
                    <select
                      required
                      value={cycleForm.program_id}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          program_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Degree</option>
                      {uniqueDegrees.map((degree) => (
                        <option key={degree} value={degree}>
                          {degree}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                      Exam Month
                    </label>
                    <select
                      required
                      value={cycleForm.exam_month}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          exam_month: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Month</option>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                      Exam Year
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="YYYY"
                      value={cycleForm.exam_year}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          exam_year: e.target.value === "" ? "" : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                      Regulation
                    </label>
                    <select
                      value={cycleForm.regulation_id}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          regulation_id: e.target.value,
                          cycle_type: "", // Reset cycle type when regulation changes
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Regulation</option>
                      {regulations.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                      Cycle Type
                    </label>
                    <select
                      value={cycleForm.cycle_type}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          cycle_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Type</option>
                      <option value="mid_term_1">Mid-Term 1</option>
                      <option value="mid_term_2">Mid-Term 2</option>
                      <option value="internal_lab">Internal Lab</option>
                      <option value="semester_end_external">Semester End + External</option>
                    </select>
                  </div>
                </div>

                {cycleForm.cycle_type === "semester_end_external" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                      Exam Mode
                    </label>
                    <select
                      value={cycleForm.exam_mode}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          exam_mode: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="regular">Regular Only</option>
                      <option value="supplementary">Supplementary Only</option>
                      <option value="combined">Regular + Supplementary</option>
                    </select>
                  </div>
                )}

                {/* {cycleForm.cycle_type === "semester_end_external" && (
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest text-center">
                      Fee Configuration
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {(cycleForm.exam_mode === "regular" ||
                        cycleForm.exam_mode === "combined") && (
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                              Regular Fee
                            </label>
                            <input
                              type="number"
                              required
                              placeholder="₹"
                              value={cycleForm.regular_fee}
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  regular_fee: e.target.value === "" ? "" : parseFloat(e.target.value),
                                })
                              }
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                          </div>
                        )}
                      {(cycleForm.exam_mode === "supplementary" ||
                        cycleForm.exam_mode === "combined") && (
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                              Backlog Fee
                            </label>
                            <input
                              type="number"
                              required
                              placeholder="₹"
                              value={cycleForm.supply_fee_per_paper}
                              onChange={(e) =>
                                setCycleForm({
                                  ...cycleForm,
                                  supply_fee_per_paper: e.target.value === "" ? "" : parseFloat(e.target.value),
                                })
                              }
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                )} */}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Dates removed as they are derived from Time Table */}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Batch Year
                  </label>
                  <select
                    required
                    value={cycleForm.batch_year}
                    onChange={(e) =>
                      setCycleForm({
                        ...cycleForm,
                        batch_year: e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Year</option>
                    {batchYears?.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}

                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Semester
                  </label>
                  <select
                    value={cycleForm.semester}
                    disabled={loadingSemesters}
                    onChange={(e) =>
                      setCycleForm({
                        ...cycleForm,
                        semester: e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    {availableSemesters.map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                  {loadingSemesters && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    </div>
                  )}
                </div>
              </div>
              {/* Legacy Weightage and Exam Type removed - derived from regulation/cycle_type */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {editingCycle ? "Update Cycle" : "Create Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Details (removed, since it's now a view mode) */}

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingSchedule ? "Edit Exam Schedule" : "Add Exam Schedule"}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Filter Program
                  </label>
                  <select
                    value={modalFilters.program_id}
                    onChange={(e) =>
                      setModalFilters({
                        ...modalFilters,
                        program_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">All Programs</option>
                    {programs?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Filter Semester
                  </label>
                  <select
                    value={modalFilters.semester}
                    onChange={(e) =>
                      setModalFilters({
                        ...modalFilters,
                        semester: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Any Sem</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Course / Subject
                  </label>
                  <select
                    required
                    value={scheduleForm.course_id}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        course_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses
                      ?.filter((c) => {
                        const programMatch =
                          !modalFilters.program_id ||
                          c.program_id === modalFilters.program_id;
                        const semesterMatch =
                          !modalFilters.semester ||
                          c.semester == modalFilters.semester;
                        return programMatch && semesterMatch;
                      })
                      ?.map((c) => {
                        const prog = programs.find(
                          (p) => p.id === c.program_id,
                        );
                        return (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code}) {prog ? ` - ${prog.name}` : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2 uppercase tracking-wider text-gray-400">
                  Target Programs
                </label>

                {/* Custom Multi-Select Trigger */}
                <div
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer min-h-[50px] flex flex-wrap gap-2 items-center border border-transparent hover:border-indigo-500 transition-all"
                >
                  {scheduleForm.programs && scheduleForm.programs.length > 0 ? (
                    scheduleForm.programs.map((bId) => {
                      const prog = programs.find((p) => p.id === bId);
                      return (
                        <span
                          key={bId}
                          className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          {formatProgramName(prog)}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const programs = scheduleForm.programs.filter(
                                (id) => id !== bId,
                              );
                              setScheduleForm({ ...scheduleForm, programs });
                            }}
                            className="hover:text-indigo-900 dark:hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400">Select programs...</span>
                  )}
                  <div className="ml-auto">
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${showBranchDropdown ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>

                {/* Dropdown Options */}
                {showBranchDropdown && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto p-2">
                    {programs?.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={scheduleForm.programs?.includes(p.id)}
                          onChange={(e) => {
                            const programs = [...(scheduleForm.programs || [])];
                            if (e.target.checked) {
                              programs.push(p.id);
                            } else {
                              const index = programs.indexOf(p.id);
                              if (index > -1) programs.splice(index, 1);
                            }
                            setScheduleForm({ ...scheduleForm, programs });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">
                          {p.name} ({p.code})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.exam_date}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        exam_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.start_time}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.end_time}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        end_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              {/* Max Marks derived from Exam Cycle */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {editingSchedule ? "Update Schedule" : "Add Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generate Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Auto-Generate Timetable</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Generate timetables for all programs
                </p>
              </div>
              <button
                onClick={() => setShowAutoModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAutoGenerate} className="p-6 space-y-4">
              {viewingCycle?.cycle_type === "semester_end_external" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Exam Sub-Type
                  </label>
                  <select
                    required
                    value={autoForm.exam_sub_type}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, exam_sub_type: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    <option value="theory">Theory Courses</option>
                    <option value="lab">Lab Courses (External)</option>
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={autoForm.start_date}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, start_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Gap Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={autoForm.gap_days}
                    onChange={(e) =>
                      setAutoForm({
                        ...autoForm,
                        gap_days: e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={autoForm.start_time}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, start_time: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={autoForm.end_time}
                    onChange={(e) =>
                      setAutoForm({ ...autoForm, end_time: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {viewingCycle?.cycle_type?.includes("mid_term") && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoForm.isTwoExamsPerDay}
                        onChange={(e) =>
                          setAutoForm({ ...autoForm, isTwoExamsPerDay: e.target.checked })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                      Schedule Two Exams Per Day
                    </span>
                  </label>

                  {autoForm.isTwoExamsPerDay && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                          Afternoon Start
                        </label>
                        <input
                          type="time"
                          required
                          value={autoForm.afternoon_start_time}
                          onChange={(e) =>
                            setAutoForm({ ...autoForm, afternoon_start_time: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 uppercase tracking-wider text-gray-400">
                          Afternoon End
                        </label>
                        <input
                          type="time"
                          required
                          value={autoForm.afternoon_end_time}
                          onChange={(e) =>
                            setAutoForm({ ...autoForm, afternoon_end_time: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-900 dark:text-blue-400">
                      Smart Scheduling
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                      The system will automatically skip Sundays and holidays from the academic calendar when scheduling exams.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAutoModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={autoGenerating}
                  className="flex-1 py-3 px-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {autoGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate All"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
      {/* Manual Override Modal */}
      {
        showOverrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col animate-slide-up">
              <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black">Manual Override</h3>
                  <p className="text-sm font-medium text-indigo-300">
                    Update eligibility for {activeReg?.student?.first_name}{" "}
                    {activeReg?.student?.last_name}
                  </p>
                </div>
                <ShieldCheck className="w-10 h-10 text-indigo-400 opacity-50" />
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() =>
                      setOverrideData({
                        ...overrideData,
                        is_condoned: !overrideData.is_condoned,
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${overrideData.is_condoned ? "bg-yellow-50 border-yellow-600 text-yellow-900 dark:bg-yellow-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                  >
                    <ShieldCheck
                      className={`w-8 h-8 ${overrideData.is_condoned ? "text-yellow-600" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                      Condone Attendance
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setOverrideData({
                        ...overrideData,
                        has_permission: !overrideData.has_permission,
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${overrideData.has_permission ? "bg-orange-50 border-orange-600 text-orange-900 dark:bg-orange-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                  >
                    <ShieldAlert
                      className={`w-8 h-8 ${overrideData.has_permission ? "text-orange-600" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                      Grant HOD Permission
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setOverrideData({
                        ...overrideData,
                        override_status: !overrideData.override_status,
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${overrideData.override_status ? "bg-purple-50 border-purple-600 text-purple-900 dark:bg-purple-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                  >
                    <ShieldAlert
                      className={`w-8 h-8 ${overrideData.override_status ? "text-purple-600" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                      Override Fee Block
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                      Remarks (Mandatory)
                    </label>
                    <textarea
                      value={overrideData.override_remarks}
                      onChange={(e) =>
                        setOverrideData({
                          ...overrideData,
                          override_remarks: e.target.value,
                        })
                      }
                      placeholder="Enter reason for this override..."
                      className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowOverrideModal(false);
                      setActiveReg(null);
                    }}
                    className="flex-1 py-4 text-gray-500 font-black text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOverride}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Bulk Override Modal */}
      {
        showBulkOverrideModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-black">Bulk Override</h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    Applying changes to {selectedStudents.length} student
                    {selectedStudents.length > 1 ? "s" : ""}
                  </p>
                </div>
                <ShieldCheck className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-10 rotate-12" />
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-amber-900 dark:text-amber-400">
                        Bulk Action Warning
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                        This action will apply the same override settings to all{" "}
                        {selectedStudents.length} selected students. Please ensure
                        this is intentional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() =>
                      setBulkOverrideData({
                        ...bulkOverrideData,
                        is_condoned: !bulkOverrideData.is_condoned,
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${bulkOverrideData.is_condoned ? "bg-yellow-50 border-yellow-600 text-yellow-900 dark:bg-yellow-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                  >
                    <ShieldCheck
                      className={`w-8 h-8 ${bulkOverrideData.is_condoned ? "text-yellow-600" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                      Condone Attendance
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setBulkOverrideData({
                        ...bulkOverrideData,
                        has_permission: !bulkOverrideData.has_permission,
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${bulkOverrideData.has_permission ? "bg-orange-50 border-orange-600 text-orange-900 dark:bg-orange-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                  >
                    <ShieldAlert
                      className={`w-8 h-8 ${bulkOverrideData.has_permission ? "text-orange-600" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                      Grant HOD Permission
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setBulkOverrideData({
                        ...bulkOverrideData,
                        override_status: !bulkOverrideData.override_status,
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${bulkOverrideData.override_status ? "bg-purple-50 border-purple-600 text-purple-900 dark:bg-purple-900/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                  >
                    <ShieldAlert
                      className={`w-8 h-8 ${bulkOverrideData.override_status ? "text-purple-600" : ""}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                      Override Fee Block
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                      Remarks (Mandatory for Bulk Override)
                    </label>
                    <textarea
                      value={bulkOverrideData.override_remarks}
                      onChange={(e) =>
                        setBulkOverrideData({
                          ...bulkOverrideData,
                          override_remarks: e.target.value,
                        })
                      }
                      placeholder={`Enter reason for overriding ${selectedStudents.length} students...`}
                      className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowBulkOverrideModal(false);
                      setBulkOverrideData({
                        is_condoned: false,
                        has_permission: false,
                        override_status: false,
                        override_remarks: "",
                      });
                    }}
                    className="flex-1 py-4 text-gray-500 font-black text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!bulkOverrideData.override_remarks) {
                        alert("Please provide remarks for this bulk action");
                        return;
                      }

                      try {
                        await dispatch(
                          bulkUpdateRegistrationStatus({
                            student_ids: selectedStudents,
                            data: {
                              ...bulkOverrideData,
                              exam_cycle_id: selectedCycle,
                            },
                          }),
                        ).unwrap();

                        alert(
                          `Successfully applied bulk override to ${selectedStudents.length} students`,
                        );
                        setShowBulkOverrideModal(false);
                        setSelectedStudents([]);
                        setBulkOverrideData({
                          is_condoned: false,
                          has_permission: false,
                          override_status: false,
                          override_remarks: "",
                        });

                        // Refresh registrations data
                        if (selectedCycle) {
                          dispatch(fetchRegistrations(selectedCycle));
                        }
                      } catch (err) {
                        alert(err || "Failed to apply bulk override");
                      }
                    }}
                    className="flex-1 py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-colors"
                  >
                    Apply to {selectedStudents.length} Student
                    {selectedStudents.length > 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {undoData && (
        <div className="fixed bottom-8 right-8 z-[100] animate-bounce-in">
          <div className="bg-gray-900 border border-gray-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <div className="flex flex-col mr-2">
              <span className="font-bold">{undoData.message}</span>
              <span className="text-xs text-gray-400">Action can be undone</span>
            </div>
            <button
              onClick={handleUndoClick}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors uppercase tracking-wider"
            >
              Undo
            </button>
            <button
              onClick={() => {
                if (undoData.timer) clearTimeout(undoData.timer);
                setUndoData(null);
              }}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div >
  );
};

export default ExamSchedules;
