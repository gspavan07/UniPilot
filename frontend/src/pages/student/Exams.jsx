import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  CreditCard,
  Award,
  RefreshCw,
  FileText,
  Clock,
  BookOpen,
  MapPin,
  ChevronRight,
  Info,
  GraduationCap,
  Download,
  AlertCircle,
  CheckCircle,
  History,
  Lock,
  Eye,
  Search,
  Users,
  Monitor,
  EyeOff,
} from "lucide-react";
import {
  fetchMyExamSchedules,
  fetchExamCycles,
  fetchBacklogs,
  registerForExams,
  fetchRegistrationStatus,
  fetchMyRegistrations,
  createRegistrationOrder,
  createReverificationOrder,
  applyReverificationWithPayment,
} from "../../store/slices/examSlice";
import {
  getMyReverificationEligibility,
  applyForReverification,
  getMyReverificationRequests,
  getMyScripts,
  payScriptViewAccess,
  clearMessages as clearReverificationMessages,
} from "../../redux/slices/studentReverificationSlice";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const Exams = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("schedule");
  const { user } = useSelector((state) => state.auth);

  // Redux States
  const {
    schedules,
    status: examStatus,
    cycles,
    backlogs,
    currentRegistration,
    myRegistrations,
  } = useSelector((state) => state.exam);

  const {
    eligibility,
    myRequests,
    myScripts,
    loading: reverificationLoading,
    error: reverificationError,
    success: reverificationSuccess,
  } = useSelector((state) => state.studentReverification);

  // Local States
  const [downloading, setDownloading] = useState(null);
  const [regActiveTab, setRegActiveTab] = useState("active");
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [regSubTab, setRegSubTab] = useState("regular");

  // Reverification Local States
  const [revSelectedSubjects, setRevSelectedSubjects] = useState([]);
  const [revReason, setRevReason] = useState("");
  const [showRevPaymentModal, setShowRevPaymentModal] = useState(false);
  const [selectedRevRequest, setSelectedRevRequest] = useState(null);

  // Script Local States
  const [scriptFilterCycle, setScriptFilterCycle] = useState("all");
  const [activePreviewScript, setActivePreviewScript] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    // Initial data fetch based on active tab
    if (activeTab === "schedule") {
      dispatch(fetchMyExamSchedules());
    } else if (activeTab === "registration") {
      dispatch(fetchExamCycles());
      dispatch(fetchMyRegistrations());
      dispatch(fetchBacklogs());
    } else if (activeTab === "reverification") {
      dispatch(getMyReverificationEligibility());
      dispatch(getMyReverificationRequests());
    } else if (activeTab === "scripts") {
      dispatch(getMyScripts());
      dispatch(fetchExamCycles());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (reverificationSuccess) {
      setRevSelectedSubjects([]);
      setRevReason("");
      setShowRevPaymentModal(false);
      setTimeout(() => {
        dispatch(clearReverificationMessages());
        dispatch(getMyReverificationRequests());
      }, 2000);
    }
  }, [reverificationSuccess, dispatch]);

  // Cleanup Preview Blob URLs
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  // --- Handlers ---

  const handleDownloadHallTicket = async (cycleId, cycleName) => {
    setDownloading(`hall-${cycleId}`);
    try {
      const response = await api.get(
        `/exam/registration/${cycleId}/download-hall-ticket`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `HallTicket_${cycleName}_${user.student_id}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Hall Ticket downloaded");
    } catch (error) {
      toast.error("Failed to download hall ticket");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadReceipt = async (registrationId, cycleName) => {
    setDownloading(registrationId);
    try {
      const response = await api.get(
        `/exam/registration/${registrationId}/receipt`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Receipt_${cycleName}_${registrationId}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Receipt downloaded");
    } catch (error) {
      toast.error("Failed to download receipt");
    } finally {
      setDownloading(null);
    }
  };

  // --- Sub-components (Tabs) ---

  const ScheduleTab = () => {
    const [subTab, setSubTab] = useState("upcoming");
    const today = new Date().toISOString().split("T")[0];

    const groupedSchedules = schedules.reduce((acc, schedule) => {
      const cycleId = schedule.cycle?.id || schedule.exam_cycle_id;
      if (!acc[cycleId]) {
        acc[cycleId] = {
          id: cycleId,
          name: schedule.cycle?.name || "Exam Cycle",
          type: schedule.cycle?.cycle_type,
          instance: schedule.cycle?.instance_number,
          components: schedule.cycle?.component_breakdown || [],
          max_marks: schedule.cycle?.max_marks,
          latest_date: schedule.exam_date,
          schedules: [],
        };
      }
      acc[cycleId].schedules.push(schedule);
      if (schedule.exam_date > acc[cycleId].latest_date) {
        acc[cycleId].latest_date = schedule.exam_date;
      }
      return acc;
    }, {});

    const cycles = Object.values(groupedSchedules);
    const upcomingCycles = cycles.filter((c) => c.latest_date >= today);
    const completedCycles = cycles.filter((c) => c.latest_date < today);

    const activeCycles =
      subTab === "upcoming" ? upcomingCycles : completedCycles;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Sub-Tab Navigation */}
        <div className="flex justify-start mb-10">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setSubTab("upcoming")}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === "upcoming"
                ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-700"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
            >
              Upcoming ({upcomingCycles.length})
            </button>
            <button
              onClick={() => setSubTab("completed")}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === "completed"
                ? "bg-white dark:bg-gray-800 text-slate-600 shadow-sm border border-gray-100 dark:border-gray-700"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
            >
              Completed ({completedCycles.length})
            </button>
          </div>
        </div>

        {examStatus === "loading" ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Syncing Timetables...
            </p>
          </div>
        ) : activeCycles.length > 0 ? (
          <div className="space-y-12">
            {activeCycles.map((cycleInfo) => (
              <div key={cycleInfo.id} className="group">
                {/* Board-Style Group Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white dark:bg-gray-800 rounded-t-[2.5rem] border-x border-t border-gray-100 dark:border-gray-700 shadow-sm gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-50 uppercase tracking-tight">
                        {cycleInfo.name}
                      </h2>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black rounded-lg uppercase tracking-wider">
                          {cycleInfo.type?.replace("_", " ")}
                        </span>
                        {cycleInfo.instance && (
                          <span className="text-[9px] px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-black rounded-lg uppercase tracking-wider">
                            Instance {cycleInfo.instance}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-xl text-center flex-1 md:flex-none">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Courses
                      </p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {cycleInfo.schedules.length}
                      </p>
                    </div>
                    {/* Hall Ticket Button as an Action within Cycle - Only for Upcoming */}
                    {subTab === "upcoming" && (
                      <button
                        onClick={() =>
                          handleDownloadHallTicket(cycleInfo.id, cycleInfo.name)
                        }
                        disabled={downloading === `hall-${cycleInfo.id}`}
                        className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3 flex-1 md:flex-none"
                      >
                        {downloading === `hall-${cycleInfo.id}` ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        Hall Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* High-Density Row List */}
                <div className="bg-white dark:bg-gray-800 rounded-b-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Subject Detail
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Exam Date
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Time Dimension
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Allocation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                      {cycleInfo.schedules.map((schedule) => (
                        <tr
                          key={schedule.id}
                          className="group/row hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 text-indigo-500 rounded-xl group-hover/row:scale-110 transition-transform">
                                <Award size={18} />
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                  {schedule.course?.name}
                                </div>
                                <div className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-widest">
                                  {schedule.course?.code}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {new Date(
                                  schedule.exam_date,
                                ).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                {schedule.start_time.substring(0, 5)} -{" "}
                                {schedule.end_time.substring(0, 5)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <MapPin size={14} className="text-rose-400" />
                              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                {schedule.venue || "TBA"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-32 text-center border border-gray-100 dark:border-gray-700 shadow-sm border-dashed">
            <div className="w-24 h-24 bg-slate-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-10">
              <Calendar
                size={48}
                className="text-slate-200 dark:text-gray-700"
              />
            </div>
            <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter">
              {subTab === "upcoming" ? "Timetable Clear" : "No Past Records"}
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto font-bold text-sm leading-relaxed">
              {subTab === "upcoming"
                ? "Examination schedules are currently being processed. Please check back later for updates."
                : "No past examination records found in your workspace."}
            </p>
          </div>
        )}
      </div>
    );
  };

  const RegistrationTab = () => {
    const activeCycles = cycles.filter((c) => {
      const today = new Date().toISOString().split("T")[0];
      return (
        c.reg_start_date &&
        today >= c.reg_start_date &&
        (today <= c.reg_end_date ||
          (c.reg_late_fee_date && today <= c.reg_late_fee_date))
      );
    });

    const handleCycleSelect = (cycle) => {
      setSelectedCycle(cycle);
      dispatch(fetchRegistrationStatus(cycle.id));
      dispatch(fetchExamSchedules({ exam_cycle_id: cycle.id }));
      // Always start with the main cycle subjects
      setRegSubTab("regular");
      setSelectedSubjects([]);
    };

    const toggleSubject = (course, type) => {
      const isSelected = selectedSubjects.some((s) => s.id === course.id);
      if (isSelected) {
        setSelectedSubjects(selectedSubjects.filter((s) => s.id !== course.id));
      } else {
        setSelectedSubjects([...selectedSubjects, { ...course, type }]);
      }
    };

    const cycleSchedules = schedules.filter(
      (s) => (s.cycle?.id || s.exam_cycle_id) === selectedCycle?.id,
    );

    const calculateFees = () => {
      if (!selectedCycle) return 0;

      const attemptType =
        currentRegistration?.attempt_type ||
        (selectedCycle.exam_mode === "supplementary" ? "supply" : "regular");

      let base = 0;
      let supply = 0;

      if (attemptType === "regular") {
        // Flat fee for current semester (Regular/Combined)
        base = parseFloat(selectedCycle.regular_fee || 0);
        // Add additional supply fees if any backlogs are selected in a combined cycle
        supply =
          selectedSubjects.filter((s) => s.type === "supply").length *
          parseFloat(selectedCycle.supply_fee_per_paper || 0);
      } else {
        // Per-paper fee for Senior/Backlog attempts
        supply =
          selectedSubjects.length *
          parseFloat(selectedCycle.supply_fee_per_paper || 0);
      }

      let total = base + supply;

      const today = new Date().toISOString().split("T")[0];
      if (selectedCycle.reg_end_date && today > selectedCycle.reg_end_date) {
        total += parseFloat(selectedCycle.late_fee_amount || 0);
      }

      // Add condonation fee ONLY for regular attempts with low attendance AND NOT condoned
      if (attemptType === "regular") {
        if (
          !currentRegistration?.is_condoned &&
          (currentRegistration?.attendance_status === "low" ||
            currentRegistration?.attendance_status === "condoned" ||
            currentRegistration?.blockers?.includes("needs_condonation"))
        ) {
          total += parseFloat(selectedCycle.condonation_fee || 0);
        }
      }

      return total;
    };

    const handleRegistrationSubmit = async () => {
      const attemptType =
        currentRegistration?.attempt_type ||
        (selectedCycle.exam_mode === "supplementary" ? "supply" : "regular");

      let regularSubjects = [];
      let selectionSubjects = [];

      if (attemptType === "regular") {
        // 1. Identify Regular subjects (auto-included for juniors)
        regularSubjects = cycleSchedules.map((s) => ({
          course_id: s.course?.id,
          type: "regular",
        }));

        // 2. Identify Selection subjects (manually selected backlogs if combined)
        selectionSubjects = selectedSubjects.map((s) => ({
          course_id: s.id,
          type: s.type, // usually 'supply'
        }));
      } else {
        // 1. Senior/Supply Path: only manually selected subjects from the cycle list
        selectionSubjects = selectedSubjects.map((s) => ({
          course_id: s.id,
          type: "supply",
        }));
      }

      const subjects = [...regularSubjects, ...selectionSubjects];

      if (subjects.length === 0) {
        toast.error("Please select at least one subject");
        return;
      }

      const currentTotalFee = calculateFees();

      // --- Payment Flow ---
      if (currentTotalFee > 0) {
        try {
          // 1. Load Razorpay SDK
          const res = await new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(true); // Already loaded
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

          if (!res) {
            toast.error("Razorpay SDK failed to load. Check internet connection.");
            return;
          }

          // 2. Create Order
          // We must pass the is_condoned flag if we are overriding
          // But strict backend logic should ideally re-evaluate
          // For now, let's pass explicit fields
          const orderRes = await dispatch(
            createRegistrationOrder({
              cycleId: selectedCycle.id,
              subjects,
              is_condoned: currentRegistration?.is_condoned // pass logic if needed
            })
          ).unwrap();

          // 3. Open Razorpay
          const options = {
            key: orderRes.key_id,
            amount: orderRes.data.amount,
            currency: orderRes.data.currency,
            name: "UniPilot Exams",
            description: `Registration for ${selectedCycle.name}`,
            order_id: orderRes.data.id,
            handler: async function (response) {
              try {
                // 4. Verify & Register
                await dispatch(
                  registerForExams({
                    exam_cycle_id: selectedCycle.id,
                    subjects,
                    payment: {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature
                    }
                  }),
                ).unwrap();

                toast.success("Registration & Payment Successful!");
                dispatch(fetchMyRegistrations());
                dispatch(fetchRegistrationStatus(selectedCycle.id));
              } catch (err) {
                toast.error("Payment verification failed: " + err);
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: user.phone || ""
            },
            theme: {
              color: "#4f46e5" // Indigo 600
            }
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            toast.error(response.error.description || "Payment Failed");
          });
          rzp1.open();

        } catch (err) {
          toast.error(err || "Failed to initiate payment");
        }
      } else {
        // Zero Fee Flow (No Payment)
        try {
          await dispatch(
            registerForExams({ exam_cycle_id: selectedCycle.id, subjects }),
          ).unwrap();
          toast.success("Registration Successful!");
          dispatch(fetchMyRegistrations());
          dispatch(fetchRegistrationStatus(selectedCycle.id));
        } catch (err) {
          toast.error(err || "Registration failed");
        }
      }
    };

    if (selectedCycle) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <button
              onClick={() => setSelectedCycle(null)}
              className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
              Back to Registration List
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {selectedCycle.name}
                  </h3>
                  {selectedCycle.exam_month && selectedCycle.exam_year && (
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      Session: {selectedCycle.exam_month}{" "}
                      {selectedCycle.exam_year}
                    </p>
                  )}
                </div>
                <span className="text-xs px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black rounded-xl uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                  {selectedCycle.exam_mode} Mode
                </span>
              </div>

              {selectedCycle.exam_mode === "combined" && (
                <div className="flex p-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-8">
                  <button
                    onClick={() => setRegSubTab("regular")}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${regSubTab === "regular" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Regular Subjects
                  </button>
                  <button
                    onClick={() => setRegSubTab("backlogs")}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${regSubTab === "backlogs" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Backlogs ({backlogs.length})
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {regSubTab === "regular" ? (
                  cycleSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 text-indigo-600 rounded-xl shadow-sm">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {schedule.course?.name}
                          </h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {schedule.course?.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {currentRegistration?.attempt_type === "supply" ||
                          selectedCycle.exam_mode === "supplementary" ? (
                          <button
                            onClick={() =>
                              toggleSubject(schedule.course, "supply")
                            }
                            className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedSubjects.some((s) => s.id === schedule.course?.id) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 dark:bg-gray-800 dark:border-gray-700"}`}
                          >
                            {selectedSubjects.some(
                              (s) => s.id === schedule.course?.id,
                            )
                              ? "Selected"
                              : "Select"}
                          </button>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100 dark:border-green-800">
                            <CheckCircle size={10} />
                            Included
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : backlogs.length > 0 ? (
                  backlogs.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl transition-all ${selectedSubjects.some((s) => s.id === course.id) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white dark:bg-gray-800 text-gray-400"}`}
                        >
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {course.name}
                          </h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                            {course.code} • Fee: ₹
                            {selectedCycle.supply_fee_per_paper}
                            {course.last_attempt_period && (
                              <span className="block text-rose-500 mt-0.5">
                                Last Attempt: {course.last_attempt_period} (
                                {course.last_grade})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSubject(course, "supply")}
                        className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedSubjects.some((s) => s.id === course.id) ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-indigo-600"}`}
                      >
                        {selectedSubjects.some((s) => s.id === course.id)
                          ? "Selected"
                          : "Select"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No backlogs found
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-lg shadow-indigo-500/5 border border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                Fee Summary
              </h4>
              <div className="space-y-4 mb-8">
                {/* Regular Fee */}
                {(selectedCycle.exam_mode === "regular" ||
                  selectedCycle.exam_mode === "combined") && (
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Regular Exam Fee</span>
                      <span>₹{selectedCycle.regular_fee}</span>
                    </div>
                  )}

                {/* Supply Fee Breakdown if applicable */}
                {selectedSubjects.filter((s) => s.type === "supply").length >
                  0 && (
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>
                        Supply Fee (
                        {
                          selectedSubjects.filter((s) => s.type === "supply")
                            .length
                        }{" "}
                        Subjects)
                      </span>
                      <span>
                        ₹
                        {selectedSubjects.filter((s) => s.type === "supply")
                          .length *
                          parseFloat(selectedCycle.supply_fee_per_paper || 0)}
                      </span>
                    </div>
                  )}

                {/* Condonation Fee */}
                {!currentRegistration?.is_condoned &&
                  (currentRegistration?.attendance_status === "low" ||
                    currentRegistration?.attendance_status === "condoned" ||
                    currentRegistration?.blockers?.includes(
                      "needs_condonation",
                    )) && (
                    <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest">
                      <span>Condonation Fee</span>
                      <span>₹{selectedCycle.condonation_fee}</span>
                    </div>
                  )}

                {/* Late Fee */}
                {new Date().toISOString().split("T")[0] >
                  selectedCycle.reg_end_date && (
                    <div className="flex justify-between text-xs font-bold text-amber-500 uppercase tracking-widest">
                      <span>Late Fee</span>
                      <span>₹{selectedCycle.late_fee_amount}</span>
                    </div>
                  )}

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Total Payable
                  </span>
                  <span className="text-2xl font-black text-indigo-600">
                    ₹{calculateFees()}
                  </span>
                </div>
              </div>

              {currentRegistration?.fee_status === "paid" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl border border-green-100 dark:border-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-black text-xs uppercase tracking-widest">
                      Fee Paid Successfully
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleDownloadReceipt(
                          currentRegistration.id,
                          selectedCycle.name,
                        )
                      }
                      className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Receipt
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadHallTicket(
                          selectedCycle.id,
                          selectedCycle.name,
                        )
                      }
                      className="flex items-center justify-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Hall Ticket
                      </span>
                    </button>
                  </div>
                </div>
              ) : currentRegistration?.is_eligible === false ? (
                <div className="space-y-4">
                  <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-3xl border border-rose-100 dark:border-rose-800">
                    <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
                      <Lock className="w-5 h-5" />
                      <span className="font-black text-xs uppercase tracking-widest">
                        Registration Blocked
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {currentRegistration.blockers?.map((blocker, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[10px] font-bold text-rose-500/80 leading-relaxed uppercase"
                        >
                          <span className="mt-1 w-1 h-1 bg-rose-400 rounded-full flex-shrink-0" />
                          {blocker === "fee_pending" &&
                            "Outstanding Semester Fees - Please clear your dues at the Finance Office."}
                          {blocker === "needs_hod_permission" &&
                            "Attendance Below 65% - Requires HOD permission and condonation fee to register."}
                          {blocker === "admin_blocked" &&
                            "Registration explicitly blocked by Exam Cell Administrator."}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    disabled
                    className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-[1.5rem] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  >
                    Action Required
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegistrationSubmit}
                  disabled={
                    calculateFees() === 0 &&
                    selectedCycle.exam_mode !== "regular" &&
                    selectedCycle.exam_mode !== "combined"
                  }
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  Pay Fees Now
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex p-1.5 bg-white dark:bg-gray-800 rounded-2xl w-fit border border-gray-100 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setRegActiveTab("active")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regActiveTab === "active" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-gray-600"}`}
          >
            Active Registrations
          </button>
          <button
            onClick={() => setRegActiveTab("history")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regActiveTab === "history" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-gray-600"}`}
          >
            Payment History
          </button>
        </div>

        {regActiveTab === "active" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCycles.length > 0 ? (
              activeCycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => handleCycleSelect(cycle)}
                  className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-indigo-500/30 group transition-all duration-500 relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10 flex justify-between items-start mb-8">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[9px] px-3 py-1.5 font-black uppercase tracking-widest rounded-full ${myRegistrations?.some((r) => r.exam_cycle_id === cycle.id && r.fee_status === "paid") ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {myRegistrations?.some(
                        (r) =>
                          r.exam_cycle_id === cycle.id &&
                          r.fee_status === "paid",
                      )
                        ? "PAID"
                        : "PENDING"}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 leading-tight uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
                    {cycle.name}
                  </h3>
                  {cycle.exam_month && cycle.exam_year && (
                    <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest mb-3">
                      {cycle.exam_month} {cycle.exam_year}
                    </p>
                  )}
                  <div className="space-y-2 mb-8">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Ends:{" "}
                      <span className="text-red-500">
                        {new Date(cycle.reg_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-widest">
                    Proceed{" "}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  Registration Closed
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  There are no active exam registration cycles at this time.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {myRegistrations?.length > 0 ? (
              myRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-500 group"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-3xl group-hover:scale-110 transition-transform">
                      <History className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        {reg.cycle?.name}
                      </h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {reg.cycle?.month} {reg.cycle?.year} •{" "}
                        {reg.fee_status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-4">
                    <div className="text-2xl font-black text-indigo-600">
                      ₹{reg.total_fee}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleDownloadReceipt(reg.id, reg.cycle?.name)
                        }
                        className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-500 font-black uppercase text-xs">
                No records found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const ReverificationTab = () => {
    const handleSubjectToggle = (scheduleId, examMarkId) => {
      const key = `${scheduleId}_${examMarkId}`;
      if (revSelectedSubjects.find((s) => s.key === key)) {
        setRevSelectedSubjects(
          revSelectedSubjects.filter((s) => s.key !== key),
        );
      } else {
        setRevSelectedSubjects([
          ...revSelectedSubjects,
          { schedule_id: scheduleId, exam_mark_id: examMarkId, key },
        ]);
      }
    };

    const handleRevApply = () => {
      if (revSelectedSubjects.length === 0)
        return toast.error("Select at least one subject");
      if (!revReason.trim()) return toast.error("Provide a reason");
      setShowRevPaymentModal(true);
    };

    const handleRevPayment = async (method) => {
      if (revSelectedSubjects.length === 0) return;

      if (method === "online") {
        try {
          // 1. Load Razorpay SDK
          const res = await new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(true); // Already loaded
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

          if (!res) {
            toast.error("Razorpay SDK failed to load. Check internet connection.");
            return;
          }

          // 2. Create Order
          // Use s.schedule_id || s.id based on what was there before
          const orderRes = await dispatch(
            createReverificationOrder({
              exam_schedule_ids: revSelectedSubjects.map((s) => s.schedule_id || s.id),
            })
          ).unwrap();

          // 3. Open Razorpay
          const options = {
            key: orderRes.key_id,
            amount: orderRes.order.amount,
            currency: orderRes.order.currency,
            name: "UniPilot Reverification",
            description: `Reverification for ${revSelectedSubjects.length} subjects`,
            order_id: orderRes.order.id,
            handler: async function (response) {
              try {
                // 4. Submit Application with Payment
                await dispatch(
                  applyReverificationWithPayment({
                    exam_schedule_ids: revSelectedSubjects.map((s) => s.schedule_id || s.id),
                    reason: revReason,
                    payment_method: "razorpay",
                    payment: {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                  })
                ).unwrap();

                toast.success("Application Submitted!");
                dispatch(getMyReverificationEligibility());
                dispatch(getMyReverificationRequests());
                setShowRevPaymentModal(false);
                setRevSelectedSubjects([]);
                setRevReason("");
              } catch (err) {
                toast.error(err.message || "Payment verification failed");
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: user.phone || "",
            },
            theme: {
              color: "#4f46e5",
            },
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            toast.error(response.error.description || "Payment Failed");
          });
          rzp1.open();

        } catch (err) {
          toast.error(err.message || "Failed to initiate payment");
        }
      } else {
        toast.error("Only online payment is supported");
      }
    };

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Application Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">
                Apply for Reverification
              </h3>
            </div>

            {eligibility?.eligibleExams?.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eligibility.eligibleExams[0].available_subjects.map(
                    (subject) => {
                      const isSelected = revSelectedSubjects.some(
                        (s) => s.schedule_id === subject.schedule_id,
                      );
                      return (
                        <button
                          key={subject.schedule_id}
                          onClick={() =>
                            handleSubjectToggle(
                              subject.schedule_id,
                              subject.exam_mark_id,
                            )
                          }
                          className={`p-6 rounded-3xl border transition-all duration-300 relative text-left group ${isSelected ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-500/30" : "bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700 hover:border-indigo-500/50"}`}
                        >
                          <div
                            className={`absolute top-4 right-4 ${isSelected ? "text-indigo-100" : "text-gray-300"}`}
                          >
                            <CheckCircle
                              className={`w-6 h-6 ${isSelected ? "fill-indigo-400" : ""}`}
                            />
                          </div>
                          <h4
                            className={`font-black uppercase tracking-wide mb-1 ${isSelected ? "text-white" : "text-gray-900 dark:text-gray-100"}`}
                          >
                            {subject.course_name}
                          </h4>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-indigo-200" : "text-gray-400"}`}
                          >
                            {subject.course_code}
                          </p>
                          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                            <span
                              className={
                                isSelected ? "text-indigo-100" : "text-gray-500"
                              }
                            >
                              Original Grade
                            </span>
                            <span
                              className={
                                isSelected
                                  ? "text-white text-xl"
                                  : "text-indigo-600 text-xl"
                              }
                            >
                              {subject.grade}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">
                    Reason for Application
                  </label>
                  <textarea
                    value={revReason}
                    onChange={(e) => setRevReason(e.target.value)}
                    placeholder="Explain why you are requesting reverification (e.g., missed questions, total check)..."
                    className="w-full h-32 p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium text-gray-700 dark:text-gray-200 outline-none"
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800">
                  <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                      Total Reverification Fee
                    </p>
                    <p className="text-4xl font-black text-indigo-900 dark:text-indigo-50">
                      ₹
                      {(eligibility.eligibleExams[0].fee_per_paper || 0) *
                        revSelectedSubjects.length}
                    </p>
                  </div>
                  <button
                    onClick={handleRevApply}
                    className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 bg-gray-50 dark:bg-gray-900/40 rounded-3xl text-center border border-dashed border-gray-200 dark:border-gray-700">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                  No exams currently eligible for reverification
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Table */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] ml-2">
            Recent Requests
          </h3>
          <div className="space-y-4">
            {myRequests?.length > 0 ? (
              myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:shadow-xl transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`p-4 rounded-3xl transition-all duration-500 ${req.status === "completed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}
                    >
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        {req.schedule.course.name}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {req.schedule.course.code} • Applied{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 items-center lg:justify-end">
                    <div className="text-center px-6 border-r border-gray-100 dark:border-gray-700 last:border-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">
                        Original Grade
                      </p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {req.original_grade || "N/A"}
                      </p>
                    </div>
                    {req.status === "completed" && (
                      <div className="text-center px-6 border-r border-gray-100 dark:border-gray-700 last:border-0">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">
                          Revised Grade
                        </p>
                        <p className="text-2xl font-black text-indigo-600">
                          {req.revised_grade || req.exam_mark?.grade}
                        </p>
                      </div>
                    )}
                    <div
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : req.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-indigo-100 text-indigo-700"
                        }`}
                    >
                      {req.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 bg-white dark:bg-gray-800 rounded-3xl text-center text-gray-400 font-bold uppercase tracking-widest text-xs border border-gray-50 dark:border-gray-700">
                No requests to track
              </div>
            )}
          </div>
        </div>

        {/* Rev Payment Modal */}
        {showRevPaymentModal && (
          <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-center">
                Checkout
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900/40 p-8 rounded-3xl mb-8 space-y-4">
                <div className="flex justify-between items-center text-xs font-black text-gray-500 uppercase tracking-widest">
                  <span>Subjects ({revSelectedSubjects.length})</span>
                  <span className="text-gray-900 dark:text-white">
                    ₹
                    {(eligibility.eligibleExams[0].fee_per_paper || 0) *
                      revSelectedSubjects.length}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-4xl font-black text-indigo-600">
                    ₹
                    {(eligibility.eligibleExams[0].fee_per_paper || 0) *
                      revSelectedSubjects.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleRevPayment("online")}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                >
                  Pay Online
                </button>
                <button
                  onClick={() => setShowRevPaymentModal(false)}
                  className="w-full py-4 text-gray-400 hover:text-gray-600 font-black uppercase tracking-widest text-xs"
                >
                  I'll do it later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ScriptsTab = () => {
    const handleViewScript = async (script) => {
      if (activePreviewScript?.id === script.id) return;

      setIsPreviewLoading(true);
      setActivePreviewScript(script);

      try {
        if (previewBlobUrl) {
          window.URL.revokeObjectURL(previewBlobUrl);
        }

        const response = await api.get(`/exam/scripts/${script.id}/view`, {
          responseType: "blob",
        });

        // Explicitly set type to application/pdf to avoid "unknown file" issues
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
      } catch (error) {
        console.error("Error loading script preview:", error);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    const handleDownload = (script, blobUrl) => {
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName =
        `${script.schedule?.course?.code}_${script.schedule?.course?.name}_AnswerScript.pdf`.replace(
          /\s+/g,
          "_",
        );
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const filteredScripts =
      scriptFilterCycle === "all"
        ? myScripts
        : myScripts.filter((s) => s.schedule?.cycle?.id === scriptFilterCycle);

    const scriptCycles = [
      ...new Set(myScripts.map((s) => s.schedule?.cycle?.id)),
    ]
      .filter(Boolean)
      .map((id) => {
        const script = myScripts.find((s) => s.schedule?.cycle?.id === id);
        return { id, name: script.schedule?.cycle?.name || "Unknown Cycle" };
      });

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
          <div>
            <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-50 uppercase tracking-wider">
              Answer Script Hub
            </h3>
            <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-widest">
              View and download your evaluated digital scripts
            </p>
          </div>
          <select
            value={scriptFilterCycle}
            onChange={(e) => setScriptFilterCycle(e.target.value)}
            className="px-8 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-xs uppercase tracking-widest text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-w-[250px] appearance-none cursor-pointer"
          >
            <option value="all">All Examination Cycles</option>
            {scriptCycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>
        </div>

        {filteredScripts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px]">
            {/* Sidebar: Script List */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Available Scripts ({filteredScripts.length})
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredScripts.map((script) => (
                  <button
                    key={script.id}
                    onClick={() => handleViewScript(script)}
                    className={`w-full text-left p-6 rounded-[2rem] transition-all duration-300 group border ${activePreviewScript?.id === script.id
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-500/30 hover:bg-indigo-50/30"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl transition-colors ${activePreviewScript?.id === script.id
                          ? "bg-white/20 text-white"
                          : "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                          }`}
                      >
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-black uppercase tracking-tight truncate ${activePreviewScript?.id === script.id
                            ? "text-white"
                            : "text-gray-900 dark:text-white"
                            }`}
                        >
                          {script.schedule?.course?.name}
                        </div>
                        <div
                          className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activePreviewScript?.id === script.id
                            ? "text-indigo-100"
                            : "text-indigo-500"
                            }`}
                        >
                          {script.schedule?.course?.code}
                        </div>
                      </div>
                      <div
                        className={`transition-transform duration-300 ${activePreviewScript?.id === script.id
                          ? "translate-x-1"
                          : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                          }`}
                      >
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main: PDF Viewer */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col relative">
              {activePreviewScript ? (
                <>
                  {/* Viewer Header */}
                  <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                        {activePreviewScript.schedule?.course?.name}
                      </h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">
                        {activePreviewScript.schedule?.cycle?.name}
                      </p>
                    </div>
                    {previewBlobUrl && !isPreviewLoading && (
                      <button
                        onClick={() =>
                          handleDownload(activePreviewScript, previewBlobUrl)
                        }
                        className="p-3 bg-white dark:bg-gray-800 text-indigo-600 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Download size={14} /> Download
                      </button>
                    )}
                  </div>

                  {/* Viewer Content */}
                  <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
                    {isPreviewLoading ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                          Fetching Secure Script...
                        </span>
                      </div>
                    ) : previewBlobUrl ? (
                      <iframe
                        src={`${previewBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-none"
                        title="Script Preview"
                      />
                    ) : (
                      <div className="text-center p-12">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                          <EyeOff size={32} />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                          Failed to load preview.
                          <br />
                          Please try downloading the script.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-32 h-32 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-8">
                    <Monitor className="w-12 h-12 text-gray-200" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                    Select a script to view
                  </h4>
                  <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
                    Click on an answer script from the list on the left to open
                    it in the viewer.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-24 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700 text-center">
            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
              No Answer Scripts Found
            </h3>
            <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto">
              Answer scripts will appear here once they are uploaded and
              published by the exam cell.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 pb-20 space-y-8">
      {/* Condensed Professional Header */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm gap-4">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-50 uppercase tracking-tighter leading-none">
              Examination <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-indigo-500/30"></span>
              Student Academic Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
          {[
            { id: "schedule", label: "Schedules", icon: Calendar },
            { id: "registration", label: "Registration", icon: CreditCard },
            { id: "reverification", label: "Reverification", icon: RefreshCw },
            { id: "scripts", label: "Scripts", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                  ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-700 scale-[1.02]"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-indigo-600" : "text-gray-400"}
                />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Workspace Context Bar */}
      <div className="px-2 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          {activeTab === "schedule" && "Active Exam Timetables & Venues"}
          {activeTab === "registration" && "Enrollment & Fee Settlements"}
          {activeTab === "reverification" && "Quality Control & Grade Reviews"}
          {activeTab === "scripts" && "Digital Answer Script Repository"}
        </p>
        {/* <div className="flex items-center gap-4">
          Add dynamic metadata here if needed
        </div> */}
      </div>

      {/* Tab Content Area */}
      <main className="min-h-[60vh] animate-in fade-in duration-700">
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "registration" && <RegistrationTab />}
        {activeTab === "reverification" && <ReverificationTab />}
        {activeTab === "scripts" && <ScriptsTab />}
      </main>
    </div>
  );
};

export default Exams;
