import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  fetchExamCycles,
  fetchBacklogs,
  registerForExams,
  fetchRegistrationStatus,
  fetchExamSchedules,
  fetchMyRegistrations,
} from "../../store/slices/examSlice";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  FileText,
  Download,
  CreditCard,
  History,
  AlertTriangle,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const ExamPayments = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    cycles,
    backlogs,
    schedules,
    currentRegistration,
    activeCycleConfig,
    myRegistrations,
    status,
  } = useSelector((state) => state.exam);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("active");
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subTab, setSubTab] = useState("regular"); // regular, backlogs inside active cycle
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    dispatch(fetchExamCycles());
    dispatch(fetchMyRegistrations());
    dispatch(fetchBacklogs());
  }, [dispatch]);

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

    if (cycle.exam_mode === "supplementary") {
      setSubTab("backlogs");
    } else {
      setSubTab("regular");
    }
  };

  const toggleSubject = (course, type) => {
    const isSelected = selectedSubjects.some((s) => s.id === course.id);
    if (isSelected) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.id !== course.id));
    } else {
      setSelectedSubjects([...selectedSubjects, { ...course, type }]);
    }
  };

  const calculateFees = () => {
    if (!selectedCycle) return 0;

    // Check if we have registration data (even virtually)
    if (currentRegistration) {
      // Use server calculation if available or client side logic
      // For now stick to client side based on selection for dynamic feedback
    }

    let base =
      selectedCycle.exam_mode === "regular" ||
      selectedCycle.exam_mode === "combined"
        ? parseFloat(selectedCycle.regular_fee || 0)
        : 0;

    let supply =
      selectedCycle.exam_mode === "supplementary" ||
      selectedCycle.exam_mode === "combined"
        ? selectedSubjects.filter((s) => s.type === "supply").length *
          parseFloat(selectedCycle.supply_fee_per_paper || 0)
        : 0;

    let total = base + supply;

    const today = new Date().toISOString().split("T")[0];
    if (selectedCycle.reg_end_date && today > selectedCycle.reg_end_date) {
      total += parseFloat(selectedCycle.late_fee_amount || 0);
    }

    return total;
  };

  const calculateTotalFeeBreakdown = () => {
    // Helper to return object with fee parts
    const fees = { regular: 0, supply: 0, late: 0, total: 0 };
    if (!selectedCycle) return fees;

    if (
      selectedCycle.exam_mode === "regular" ||
      selectedCycle.exam_mode === "combined"
    ) {
      fees.regular = parseFloat(selectedCycle.regular_fee || 0);
    }

    if (
      selectedCycle.exam_mode === "supplementary" ||
      selectedCycle.exam_mode === "combined"
    ) {
      fees.supply =
        selectedSubjects.filter((s) => s.type === "supply").length *
        parseFloat(selectedCycle.supply_fee_per_paper || 0);
    }

    const today = new Date().toISOString().split("T")[0];
    if (selectedCycle.reg_end_date && today > selectedCycle.reg_end_date) {
      fees.late = parseFloat(selectedCycle.late_fee_amount || 0);
    }

    fees.total = fees.regular + fees.supply + fees.late;
    return fees;
  };

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0 && !selectedCycle.regular_fee) {
      toast.error("Please select at least one subject");
      return;
    }

    const subjects = selectedSubjects.map((s) => ({
      course_id: s.id,
      type: s.type,
    }));

    try {
      await dispatch(
        registerForExams({
          exam_cycle_id: selectedCycle.id,
          subjects,
        }),
      ).unwrap();
      toast.success("Payment Successful! Registration confirmed.");
      dispatch(fetchMyRegistrations()); // Refresh history
      dispatch(fetchRegistrationStatus(selectedCycle.id)); // Refresh status
    } catch (err) {
      toast.error(err || "Payment failed");
    }
  };

  const handleDownloadHallTicket = async (cycleId, cycleName) => {
    setDownloading(`hall-${cycleId}`);
    try {
      const response = await api.get(
        `/exam/registration/${cycleId}/download-hall-ticket`,
        {
          responseType: "blob",
        },
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

  const renderBlockerMessage = (blocker) => {
    switch (blocker) {
      case "needs_hod_permission":
        return "HOD Permission Required (Attendance Shortage)";
      case "needs_condonation":
        return "Condonation Fee Payment Required (Attendance Shortage)";
      case "fee_pending":
        return "Tuition/Library Dues Pending";
      case "admin_blocked":
        return "Blocked by Admin (Disciplinary/Other)";
      case "low_attendance":
        return "Ineligible due to Low Attendance";
      default:
        return "Eligibility Requirement Not Met";
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 dark:text-indigo-100 mb-2">
            Exam Payments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Manage your exam fees and current registrations
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex p-1 bg-white dark:bg-gray-800 rounded-2xl w-fit border border-gray-100 dark:border-gray-700 shadow-sm">
        <button
          onClick={() => {
            setActiveTab("active");
            setSelectedCycle(null);
          }}
          className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "active" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-400 hover:text-gray-600"}`}
        >
          <CreditCard className="w-4 h-4" />
          Active Payments
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "history" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-400 hover:text-gray-600"}`}
        >
          <History className="w-4 h-4" />
          Payment History
        </button>
      </div>

      {/* Content */}
      {activeTab === "active" ? (
        !selectedCycle ? (
          /* Cycle List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCycles.length > 0 ? (
              activeCycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => handleCycleSelect(cycle)}
                  className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all text-left flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      {(() => {
                        const registration = myRegistrations?.find(
                          (r) => r.exam_cycle_id === cycle.id,
                        );
                        const isPaid =
                          registration?.fee_status === "paid" ||
                          registration?.fee_status === "waived";
                        return (
                          <span
                            className={`text-[10px] px-3 py-1.5 font-black rounded-full uppercase tracking-wider ${
                              isPaid
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            }`}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </span>
                        );
                      })()}
                    </div>
                    <h3 className="text-xl font-black mb-2 leading-tight text-gray-900 dark:text-white">
                      {cycle.name}
                    </h3>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <span className="w-20">Starts</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(cycle.reg_start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <span className="w-20">Deadline</span>
                        <span className="text-red-500">
                          {new Date(cycle.reg_end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm relative z-10">
                    {(() => {
                      const registration = myRegistrations?.find(
                        (r) => r.exam_cycle_id === cycle.id,
                      );
                      const isPaid =
                        registration?.fee_status === "paid" ||
                        registration?.fee_status === "waived";
                      return isPaid ? "View" : "View & Pay";
                    })()}{" "}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 p-20 text-center rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                <h2 className="text-xl font-black mb-2 dark:text-white">
                  All Caught Up!
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  No active exam payments pending at the moment.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Selected Cycle View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            <div className="lg:col-span-2 space-y-8">
              {/* Back Button */}
              <button
                onClick={() => setSelectedCycle(null)}
                className="flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back to Payments
              </button>

              {/* Eligibility Status Banner */}
              {currentRegistration && !currentRegistration.is_eligible && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-[2rem] p-6 border border-red-100 dark:border-red-800 flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-red-900/20 rounded-full shadow-sm text-red-500">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-red-700 dark:text-red-400 mb-1">
                      Payment Locked
                    </h3>
                    <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">
                      You are strictly not eligible to pay exam fees due to the
                      following reasons:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentRegistration.blockers?.map((b, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                        >
                          {renderBlockerMessage(b)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentRegistration && currentRegistration.is_eligible && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-[2rem] p-6 border border-green-100 dark:border-green-800 flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-300">
                      Eligible for Payment
                    </h3>
                    <p className="text-sm text-green-700/70 dark:text-green-400/70">
                      You can proceed with fee payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Subject Selection Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex p-2 gap-2">
                  {(selectedCycle.exam_mode === "regular" ||
                    selectedCycle.exam_mode === "combined") && (
                    <button
                      onClick={() => setSubTab("regular")}
                      className={`flex-1 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all ${subTab === "regular" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                      Regular Subjects
                    </button>
                  )}
                  {(selectedCycle.exam_mode === "supplementary" ||
                    selectedCycle.exam_mode === "combined") && (
                    <button
                      onClick={() => setSubTab("backlogs")}
                      className={`flex-1 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all ${subTab === "backlogs" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                      Backlogs ({backlogs.length})
                    </button>
                  )}
                </div>

                <div className="p-8 pt-4">
                  {subTab === "regular" ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-indigo-900 dark:text-indigo-200 font-bold mb-1">
                              Current Semester: {user.current_semester}
                            </p>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                              Standard Examination Fee
                            </p>
                          </div>
                          <span className="text-2xl font-black text-indigo-600">
                            ₹{selectedCycle.regular_fee}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:border-indigo-500/30 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                                  {schedule.course?.name}
                                </h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                  {schedule.course?.code}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Backlogs
                    <div className="space-y-4">
                      {backlogs.length > 0 ? (
                        backlogs.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:border-indigo-500/50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-xl transition-all ${selectedSubjects.some((s) => s.id === course.id) ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700"}`}
                              >
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-black text-gray-900 dark:text-white leading-tight">
                                  {course.name}
                                </h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                  {course.code} • {course.credits} Credits • ₹
                                  {selectedCycle.supply_fee_per_paper}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleSubject(course, "supply")}
                              disabled={
                                !currentRegistration?.is_eligible &&
                                currentRegistration?.status !== "paid"
                              }
                              className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedSubjects.some((s) => s.id === course.id) ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-white border border-gray-200 text-gray-400 hover:text-indigo-600"}`}
                            >
                              {selectedSubjects.some((s) => s.id === course.id)
                                ? "Selected"
                                : "Select"}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center">
                          <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                          <p className="font-bold text-gray-500">
                            No active backlogs found!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <h3 className="text-xl font-black mb-6 relative z-10 text-gray-900 dark:text-white">
                  Summary
                </h3>

                <div className="space-y-4 mb-8">
                  {calculateTotalFeeBreakdown().regular > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-500">Regular Exam Fee</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{calculateTotalFeeBreakdown().regular}
                      </span>
                    </div>
                  )}
                  {calculateTotalFeeBreakdown().supply > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-500">
                        Supply Fee (
                        {
                          selectedSubjects.filter((s) => s.type === "supply")
                            .length
                        }
                        )
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{calculateTotalFeeBreakdown().supply}
                      </span>
                    </div>
                  )}
                  {calculateTotalFeeBreakdown().late > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium text-red-500">
                      <span>Late Fee Applied</span>
                      <span className="font-bold">
                        ₹{calculateTotalFeeBreakdown().late}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-3xl font-black text-indigo-600">
                      ₹{calculateTotalFeeBreakdown().total}
                    </span>
                  </div>
                </div>

                {currentRegistration?.fee_status === "paid" ||
                currentRegistration?.fee_status === "waived" ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 text-center rounded-2xl border border-green-100 dark:border-green-800">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      Payment Completed
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-widest mt-1">
                      Ref ID: {currentRegistration.id?.slice(0, 8)}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          handleDownloadReceipt(
                            currentRegistration.id,
                            selectedCycle.name || "Exam",
                          )
                        }
                        disabled={downloading === currentRegistration.id}
                        className="flex-1 py-2 bg-white text-green-600 rounded-xl text-xs font-black uppercase tracking-wider border border-green-200 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-3 h-3" />
                        {downloading === currentRegistration.id
                          ? "..."
                          : "Receipt"}
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadHallTicket(
                            selectedCycle.id,
                            selectedCycle.name || "Exam",
                          )
                        }
                        disabled={downloading === `hall-${selectedCycle.id}`}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        {downloading === `hall-${selectedCycle.id}`
                          ? "..."
                          : "Hall Ticket"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={
                      status === "loading" ||
                      (currentRegistration &&
                        !currentRegistration.is_eligible) ||
                      calculateTotalFeeBreakdown().total === 0
                    }
                    className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                  >
                    {status === "loading" ? "Processing..." : "Pay Now"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* HISTORY TAB */
        <div className="grid grid-cols-1 gap-6">
          {myRegistrations && myRegistrations.length > 0 ? (
            myRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                      {reg.cycle?.name || "Exam Registration"}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      {reg.cycle?.month} {reg.cycle?.year} •{" "}
                      {reg.cycle?.exam_mode?.toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${reg.fee_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {reg.fee_status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        ID: {reg.transaction_id || reg.id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-black text-indigo-600">
                    ₹{reg.total_fee}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    Paid on {new Date(reg.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleDownloadReceipt(reg.id, reg.cycle?.name)
                      }
                      disabled={downloading === reg.id}
                      className="px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      {downloading === reg.id ? "..." : "Receipt"}
                    </button>
                    {/* Future: Hall Ticket Download
                                <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-bold text-indigo-600 flex items-center gap-2 transition-colors">
                                    <Download className="w-3 h-3" />
                                    Hall Ticket
                                </button> */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
              <History className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
              <p className="font-bold text-gray-400">
                No payment history found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamPayments;
