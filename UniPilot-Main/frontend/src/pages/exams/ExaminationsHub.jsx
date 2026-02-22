import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  Award,
  CreditCard,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronRight,
  Download,
  Info,
  FileText,
  Clock,
} from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import { printReceipt } from "../../utils/receiptGenerator";

const ExaminationsHub = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("schedule");
  const [exams, setExams] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [expandedCycles, setExpandedCycles] = useState([]);

  // useEffect(() => {
  //   if (exams.length > 0) {
  //     setExpandedCycles(exams.map((exam) => exam.id));
  //   }
  // }, [exams]);

  console.log("Exams data:", expandedCycles);
  const toggleCycle = (id) => {
    setExpandedCycles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, historyRes] = await Promise.all([
        api.get("/exam/cycles/my/exams"),
        api.get("/exam/cycles/my/payments"),
      ]);
      setExams(examsRes.data.data);
      console.log("📊 Exams data:", examsRes.data.data);
      console.log(
        "🔍 First cycle eligibility:",
        examsRes.data.data[0]?.student_eligibilities,
      );
      setPaymentHistory(historyRes.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load examination data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (payment) => {
    const breakup = payment.amount_breakup || {};
    const semester = payment.exam_cycle?.semester || "N/A";

    const headerInfo = {
      transaction_id: payment.transaction?.transaction_id || "N/A",
      student: user,
      amount_paid: payment.amount_paid,
      payment_date: payment.transaction?.payment_date || payment.payment_date,
      payment_method: payment.transaction?.payment_method || "Online",
      fee_structure: payment.fee_type,
      semester: semester,
      remarks: "Student Portal Download",
    };

    const items = [];

    if (breakup.base_fee > 0) {
      items.push({
        ...headerInfo,
        amount_paid: breakup.base_fee,
        fee_structure: { category: { name: payment.fee_type || "Exam Fee" } },
        remarks: "Examination Registration Fee",
      });
    }

    if (breakup.late_fine > 0) {
      items.push({
        ...headerInfo,
        amount_paid: breakup.late_fine,
        fee_structure: { category: { name: "Late Fine" } },
        remarks: "Fine for registration after regular deadline",
      });
    }

    if (breakup.condonation > 0) {
      items.push({
        ...headerInfo,
        amount_paid: breakup.condonation,
        fee_structure: { category: { name: "Condonation Fee" } },
        remarks: "Attendance shortage condonation fee",
      });
    }

    if (items.length === 0) {
      items.push({
        ...headerInfo,
        amount_paid: payment.amount_paid,
        fee_structure: { category: { name: payment.fee_type || "Exam Fee" } },
      });
    }

    printReceipt(headerInfo, items);
  };

  const calculateTotalFee = (cycle, eligibility) => {
    if (!cycle?.fee_configuration) return 0;
    const config = cycle.fee_configuration;
    let total = parseFloat(config.base_fee);
    const today = new Date().toISOString().split("T")[0];

    if (today > config.regular_end_date) {
      const slabs = [...config.slabs].sort(
        (a, b) => new Date(b.end_date) - new Date(a.end_date),
      );
      const applicableSlab = slabs.find(
        (s) => today >= s.start_date && today <= s.end_date,
      );
      if (applicableSlab) {
        total += parseFloat(applicableSlab.fine_amount);
      }
    }

    if (eligibility?.has_condonation && cycle.condonation_fee_amount) {
      total += parseFloat(cycle.condonation_fee_amount);
    }

    console.log("💰 Total calculation:", {
      base: config.base_fee,
      hasCondonation: eligibility?.has_condonation,
      condonationAmount: cycle.condonation_fee_amount,
      total,
    });

    return total;
  };

  const handlePayFee = async (cycleId) => {
    try {
      setPaying(cycleId);
      const response = await api.post(`/exam/cycles/${cycleId}/pay-fee`);

      if (response.data.data.razorpay_order) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id: response.data.data.razorpay_order.id,
          name: "Exam Fee Payment",
          description: response.data.data.cycle_name,
          handler: async (paymentResponse) => {
            try {
              await api.post(`/exam/cycles/${cycleId}/verify-payment`, {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                amount: response.data.data.amount,
              });
              toast.success("Payment successful!");
              fetchData();
            } catch (error) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-100"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const cyclesNeedingFee = exams.filter((c) => c.needs_fee);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">
        {/* Modern Header / Hero Section */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>

            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                Exams & Finance
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Examinations <span className="text-blue-600">Hub.</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Access your schedules, manage registrations, and track
                examination fees.
              </p>
            </div>

            {/* Premium Tab Navigation */}
            <div className="relative z-10 w-full lg:w-auto">
              <nav className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 shadow-md shadow-black/[0.02]">
                {["schedule", "payments"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-8 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-3
                      ${
                        activeTab === tab
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-gray-400 hover:text-black hover:bg-gray-50"
                      }
                    `}
                  >
                    {tab === "schedule" ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {tab === "schedule" ? "Schedule" : "Payments"}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "schedule" ? (
            <div className="space-y-16">
              {exams.length > 0 ? (
                exams.map((exam) => {
                  const eligibility = exam.student_eligibilities?.[0];
                  const needsFee = exam.needs_fee;
                  const paymentStatus = exam.student_payments?.[0]?.status;
                  const isEligible =
                    eligibility?.hod_permission &&
                    eligibility?.fee_clear_permission;
                  const isExpanded = expandedCycles.includes(exam.id);

                  return (
                    <section key={exam.id} className="relative">
                      {/* Exam Cycle Hero Block */}
                      <div
                        onClick={() => toggleCycle(exam.id)}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pb-10 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-2xl p-6 -m-6 mb-4"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                              {exam.semester} Semester
                            </span>
                            {needsFee && (
                              <div
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm ${
                                  paymentStatus === "completed"
                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                    : "bg-red-50 text-red-600 border border-red-100 animate-pulse"
                                }`}
                              >
                                {paymentStatus === "completed" ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />{" "}
                                    Registered
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4" />{" "}
                                    Registration Pending
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <h2 className="text-3xl font-black text-black leading-tight">
                            {exam.cycle_name.replace(/_/g, " ")}
                          </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          {needsFee && paymentStatus !== "completed" && (
                            <button
                              onClick={() => setActiveTab("payments")}
                              className="group flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1"
                            >
                              Pay Registration Fee
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleCycle(exam.id)}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 border ${
                              isExpanded
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                : "bg-white text-gray-400 border-gray-400 hover:border-blue-600 hover:text-blue-600 hover:shadow-md"
                            }`}
                          >
                            <ChevronRight
                              className={`w-5 h-5 transition-transform duration-500 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Content Section */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          isExpanded
                            ? "max-h-[2000px] opacity-100 mb-16"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {/* Eligibility / Issues Section */}
                        {eligibility && !isEligible && (
                          <div className="mb-12 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-300 shadow-md shadow-black/[0.02] flex gap-8 items-start relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-[4rem]"></div>
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-black/[0.05] flex items-center justify-center shrink-0 relative z-10">
                              <AlertTriangle className="w-8 h-8 text-black" />
                            </div>
                            <div className="relative z-10">
                              <h4 className="text-xl font-black text-black mb-4">
                                Academic Clearance Required
                              </h4>
                              <ul className="space-y-4">
                                {!eligibility.hod_permission && (
                                  <li className="text-sm text-gray-600 font-bold flex items-center gap-4">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    Departmental HOD approval is pending review
                                  </li>
                                )}
                                {!eligibility.fee_clear_permission && (
                                  <li className="text-sm text-gray-600 font-bold flex items-center gap-4">
                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                    Cumulative tuition fee clearance required (₹
                                    {(
                                      eligibility.fee_balance || 0
                                    ).toLocaleString()}
                                    )
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Timetable Grid */}
                        {exam.timetables?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {exam.timetables
                              .sort(
                                (a, b) =>
                                  new Date(a.exam_date) - new Date(b.exam_date),
                              )
                              .map((timetable) => (
                                <div
                                  key={timetable.id}
                                  className="group relative bg-white border border-gray-300 p-8 rounded-[2.5rem] shadow-md shadow-black/[0.02] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 overflow-hidden"
                                >
                                  {/* Background Accent */}
                                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50/50 rounded-full group-hover:bg-blue-600/5 transition-all duration-700 blur-3xl"></div>

                                  <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                      <div className="bg-gray-50 group-hover:bg-blue-50 rounded-2xl p-4 min-w-[4.5rem] transition-colors shadow-sm">
                                        <div className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest text-center">
                                          {new Date(
                                            timetable.exam_date,
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                          })}
                                        </div>
                                        <div className="text-3xl font-black text-black group-hover:text-blue-600 leading-none mt-1 text-center">
                                          {new Date(
                                            timetable.exam_date,
                                          ).toLocaleDateString("en-US", {
                                            day: "numeric",
                                          })}
                                        </div>
                                      </div>
                                      <span
                                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                          timetable.session === "morning"
                                            ? "bg-blue-600 text-white"
                                            : "bg-black text-white"
                                        }`}
                                      >
                                        {timetable.session}
                                      </span>
                                    </div>

                                    <div className="space-y-2 mb-8 min-h-[4.5rem]">
                                      <h3 className="font-black text-lg text-black leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {timetable.course.name}
                                      </h3>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {timetable.course.code}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs font-black text-gray-500 pt-6 border-t border-gray-100 group-hover:text-black transition-colors">
                                      <Clock className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                      {timetable.start_time.slice(0, 5)} -{" "}
                                      {timetable.end_time.slice(0, 5)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/[0.02] mb-6">
                              <FileText className="w-8 h-8 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-black">
                              Timeline Pending
                            </h3>
                            <p className="text-gray-400 font-medium max-w-sm px-6 mt-2">
                              The official examination timetable for this cycle
                              is currently under preparation and will be
                              published shortly.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })
              ) : (
                <div className="py-40 flex flex-col items-center justify-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-[3rem]">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/[0.02] mb-8 group transition-transform hover:rotate-6">
                    <Award className="w-10 h-10 text-gray-200 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-3">
                    No Active Cycles
                  </h3>
                  <p className="text-gray-400 font-medium text-center max-w-sm px-6">
                    Your current semester has no examinations scheduled yet.
                    Keep tracking this space for academic updates.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 items-start">
              {/* Left Column: Active Billing Blocks */}
              <div className="xl:col-span-8 space-y-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">
                    Pending Dues
                  </h2>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                {cyclesNeedingFee.length > 0 ? (
                  cyclesNeedingFee.map((cycle) => {
                    const isPaid = cycle.student_payments?.length > 0;
                    const eligibility = cycle.student_eligibilities?.[0];
                    const totalAmount = calculateTotalFee(cycle, eligibility);
                    const today = new Date().toISOString().split("T")[0];
                    const isLate =
                      today > cycle.fee_configuration.regular_end_date;
                    const isBlocked =
                      eligibility &&
                      (!eligibility.hod_permission ||
                        !eligibility.fee_clear_permission);

                    return (
                      <div
                        key={cycle.id}
                        className="group relative bg-white rounded-[3rem] shadow-xl shadow-black/[0.03] border border-gray-300 overflow-hidden transition-all duration-500 hover:shadow-2xl"
                      >
                        {/* Status Strip */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-3 transition-colors ${
                            isPaid
                              ? "bg-green-600"
                              : isBlocked
                                ? "bg-red-200"
                                : "bg-blue-600 animate-pulse"
                          }`}
                        ></div>

                        <div className="p-6 pl-14">
                          <div className="flex flex-col md:flex-row justify-between items-start mb-5 gap-8">
                            <div className="space-y-4">
                              <h3 className="text-2xl font-black text-black tracking-tight leading-none">
                                {cycle.cycle_name.replace(/_/g, " ")}
                              </h3>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-bold text-gray-500">
                                    Closes{" "}
                                    {new Date(
                                      cycle.fee_configuration
                                        .final_registration_date,
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-100/60 p-6 rounded-[2rem] border border-gray-200 min-w-[200px] text-center">
                              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                                Total Outstanding
                              </div>
                              <div className="text-xl font-black text-black tracking-tighter">
                                ₹{totalAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-5 border-t border-gray-100 mb-10">
                            <div className="flex justify-between items-center group/item">
                              <span className="text-sm font-bold text-gray-400 group-hover/item:text-black transition-colors">
                                Exam Base Fee
                              </span>
                              <span className="text-sm font-black text-black">
                                ₹
                                {parseFloat(
                                  cycle.fee_configuration.base_fee,
                                ).toLocaleString()}
                              </span>
                            </div>
                            {isLate && (
                              <div className="flex justify-between items-center group/item">
                                <span className="text-sm font-bold text-red-400 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" /> Late Fine
                                </span>
                                <span className="text-sm font-black text-red-600">
                                  + ₹
                                  {parseFloat(
                                    cycle.fee_configuration.slabs.find(
                                      (s) =>
                                        today >= s.start_date &&
                                        today <= s.end_date,
                                    )?.fine_amount || 0,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {eligibility?.has_condonation && (
                              <div className="flex justify-between items-center group/item">
                                <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />{" "}
                                  Condonation
                                </span>
                                <span className="text-sm font-black text-blue-600">
                                  + ₹
                                  {parseFloat(
                                    cycle.condonation_fee_amount || 0,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Late Fee Schedule */}
                          <div className="mb-5 p-4 bg-gray-50/50 rounded-[1rem] border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <Info className="w-4 h-4 text-blue-600" />
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                Late Fee Schedule
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Regular Slab */}
                              <div className="relative px-5 py-2 rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden group/slab">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/slab:opacity-100 transition-opacity">
                                  <CheckCircle className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="space-y-1 relative z-10">
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                    Regular
                                  </span>
                                  <p className="text-xs font-black text-black pt-1">
                                    Until{" "}
                                    {new Date(
                                      cycle.fee_configuration.regular_end_date,
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                  </p>
                                  <p className="text-[10px] font-bold text-gray-400">
                                    Base Fee Only
                                  </p>
                                  <div className="text-sm font-black text-gray-600 tracking-tighter">
                                    +₹
                                    {parseFloat(
                                      cycle.fee_configuration.base_fee,
                                    ).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Fine Slabs */}
                              {cycle.fee_configuration.slabs.map(
                                (slab, index) => (
                                  <div
                                    key={index}
                                    className={`relative px-5 py-2  rounded-2xl border transition-all duration-300 overflow-hidden group/slab ${
                                      today >= slab.start_date &&
                                      today <= slab.end_date
                                        ? "bg-red-50/30 border-red-200 shadow-md ring-1 ring-red-100"
                                        : "bg-white border-gray-100 opacity-60 hover:opacity-100"
                                    }`}
                                  >
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/slab:opacity-100 transition-opacity">
                                      <AlertCircle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div className="space-y-1 relative z-10">
                                      <span
                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                          today >= slab.start_date &&
                                          today <= slab.end_date
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-100 text-gray-400"
                                        }`}
                                      >
                                        Slab {index + 1}
                                      </span>
                                      <p className="text-xs font-black text-black pt-1">
                                        {new Date(
                                          slab.start_date,
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                          slab.end_date,
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                        })}
                                      </p>
                                      <p
                                        className={`text-[10px] font-bold ${
                                          today >= slab.start_date &&
                                          today <= slab.end_date
                                            ? "text-red-600"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        + ₹
                                        {parseFloat(
                                          slab.fine_amount,
                                        ).toLocaleString()}{" "}
                                        Fine
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Blockers / Warnings */}
                          {isBlocked && !isPaid && (
                            <div className="mb-5 p-6 bg-red-50/50 rounded-2xl border border-red-100 flex gap-4 items-start">
                              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="text-sm font-black text-red-600 uppercase tracking-wide">
                                  Account On Hold
                                </p>
                                <div className="text-xs font-bold text-red-600/70 space-y-1 pt-1 opacity-80">
                                  {!eligibility.hod_permission && (
                                    <p>
                                      • Administrative Review Pending:
                                      Attendance criteria (
                                      {cycle.attendance_threshold_condonation}%)
                                      not met.
                                    </p>
                                  )}
                                  {!eligibility.fee_clear_permission && (
                                    <p>
                                      • Finance Warning: Outstanding academic
                                      tuition fees detected.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Footer Action */}
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">
                              Payment Gateway: Encrypted & Secure
                            </p>

                            {isPaid ? (
                              <div className="flex items-center gap-3 px-8 py-4 bg-blue-50 text-blue-600 font-black uppercase tracking-widest text-xs rounded-2xl">
                                <CheckCircle className="w-5 h-5 shadow-lg shadow-blue-500/10" />{" "}
                                Authorized & Registered
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePayFee(cycle.id)}
                                disabled={paying === cycle.id || isBlocked}
                                className="w-full sm:w-auto overflow-hidden group/btn relative flex items-center justify-center px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-2xl shadow-black/20 hover:shadow-blue-600/30 hover:-translate-y-1 active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                              >
                                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <span className="relative z-10 flex items-center gap-3">
                                  {paying === cycle.id ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    "Express Checkout"
                                  )}
                                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/[0.02] mb-6">
                      <CheckCircle className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-black">
                      All Cleared
                    </h3>
                    <p className="text-gray-400 font-medium max-w-sm px-6 mt-2">
                      No outstanding examination fees were found for your
                      student profile at this time.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: High-End Transaction Log */}
              <div className="xl:col-span-4">
                <div className="sticky top-32 space-y-10">
                  <div className="flex items-center gap-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">
                      Transaction History
                    </h2>
                    <div className="h-px bg-gray-100 flex-1"></div>
                  </div>

                  <div className="space-y-6">
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment) => (
                        <div
                          key={payment.id}
                          className="group relative bg-white border border-gray-300 p-6 rounded-[2rem] shadow-md shadow-black/[0.02] transition-all hover:shadow-xl hover:border-blue-200"
                        >
                          <div className="absolute left-0 top-6 bottom-6 w-1 bg-gray-50 group-hover:bg-blue-600 transition-all rounded-r-lg"></div>

                          <div className="space-y-5">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {new Date(
                                  payment.payment_date,
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-lg font-black text-black">
                                ₹
                                {parseFloat(
                                  payment.amount_paid,
                                ).toLocaleString()}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-black line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {payment.exam_cycle?.cycle_name?.replace(
                                  /_/g,
                                  " ",
                                )}
                              </h4>
                              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">
                                {payment.transaction?.payment_method ||
                                  "DIGITAL PAYMENT"}
                              </p>
                            </div>

                            {payment.payment_status === "success" && (
                              <button
                                onClick={() => handlePrintReceipt(payment)}
                                className="w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <Download className="w-4 h-4" /> Download
                                Receipt
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 bg-gray-50/50 rounded-[2rem] border border-gray-100 text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          No Records Found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExaminationsHub;
