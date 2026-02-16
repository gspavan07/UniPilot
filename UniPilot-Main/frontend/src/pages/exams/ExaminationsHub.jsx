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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-20">

      {/* Top Navigation Bar */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">Examinations Hub</span>
          </div>

          <nav className="flex space-x-1 bg-gray-50/80 p-1 rounded-xl border border-gray-100">
            {/* Styled Tabs */}
            {['schedule', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                    px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2
                    ${activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}
                  `}
              >
                {tab === 'schedule' ? <Calendar className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                {tab === 'schedule' ? 'Schedule' : 'Payments'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 animate-fade-in-up">

        {/* Dynamic Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-tight">
            {activeTab === 'schedule' ? 'Examination Schedule' : 'Fee Status & History'}
          </h1>
          <p className="text-gray-500 font-normal flex items-center justify-center md:justify-start gap-2 text-lg">
            {activeTab === 'schedule'
              ? `Upcoming sessions for ${new Date().getFullYear()} Academic Year`
              : 'manage your recurring examination fees'}
          </p>
        </div>

        {/* Content Area */}
        {activeTab === "schedule" ? (
          <div className="space-y-16">
            {exams.length > 0 ? exams.map((exam) => {
              const eligibility = exam.student_eligibilities?.[0];
              const needsFee = exam.needs_fee;
              const paymentStatus = exam.student_payments?.[0]?.status;
              const isEligible = eligibility?.hod_permission && eligibility?.fee_clear_permission;

              return (
                <section key={exam.id} className="group relative">
                  <div className="absolute -left-10 top-0 bottom-0 w-px bg-gray-100 hidden xl:block"></div>

                  {/* Exam Cycle Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                          {exam.semester} Semester
                        </span>
                        {needsFee && (
                          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${paymentStatus === "completed" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                            }`}>
                            {paymentStatus === "completed" ? (
                              <><CheckCircle className="w-3.5 h-3.5" /> Registered</>
                            ) : (
                              <><AlertCircle className="w-3.5 h-3.5" /> Fee Pending</>
                            )}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {exam.cycle_name.replace(/_/g, " ")}
                      </h2>
                    </div>
                    {needsFee && paymentStatus !== "completed" && (
                      <button
                        onClick={() => setActiveTab("payments")}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5"
                      >
                        Pay Registration Fee
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Issues Alert */}
                  {eligibility && !isEligible && (
                    <div className="mb-8 p-6 bg-gray-50/50 border border-gray-200 rounded-2xl flex gap-5 items-start">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <AlertTriangle className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-2">Action Required</h4>
                        <ul className="space-y-2">
                          {!eligibility.hod_permission && (
                            <li className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              Department HOD approval is pending
                            </li>
                          )}
                          {!eligibility.fee_clear_permission && (
                            <li className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              Tuition fee clearance pending (Outstanding: ₹{(eligibility.fee_balance || 0).toLocaleString()})
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Timetable Grid */}
                  {exam.timetables?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {exam.timetables
                        .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
                        .map((timetable) => (
                          <div key={timetable.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:ring-4 hover:ring-blue-50 hover:shadow-xl transition-all duration-300 group/card relative overflow-hidden">
                            <div className="flex justify-between items-start mb-5">
                              <div className="text-center bg-gray-50 rounded-xl p-3 min-w-[4rem] border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {new Date(timetable.exam_date).toLocaleDateString("en-US", { month: "short" })}
                                </div>
                                <div className="text-2xl font-black text-gray-900 leading-none mt-1">
                                  {new Date(timetable.exam_date).toLocaleDateString("en-US", { day: "numeric" })}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${timetable.session === 'morning' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {timetable.session}
                              </span>
                            </div>

                            <div className="mb-6">
                              <h3 className="font-bold text-lg text-gray-900 mb-1 leading-snug line-clamp-2" title={timetable.course.name}>{timetable.course.name}</h3>
                              <p className="text-xs font-mono text-gray-400">{timetable.course.code}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 pt-4 border-t border-gray-100">
                              <Clock className="w-4 h-4 text-blue-600" />
                              {timetable.start_time.slice(0, 5)} - {timetable.end_time.slice(0, 5)}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">Timetable Pending Publication</p>
                    </div>
                  )}
                </section>
              );
            }) : (
              <div className="text-center py-32 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No Examinations Scheduled</h3>
                <p className="text-gray-500 mt-2">Check back later for updates to your exam cycle.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            {/* Left Column: Active Payments */}
            <div className="xl:col-span-8 space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Due Payments</h2>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              {cyclesNeedingFee.length > 0 ? (
                cyclesNeedingFee.map((cycle) => {
                  const isPaid = cycle.student_payments?.length > 0;
                  const eligibility = cycle.student_eligibilities?.[0];
                  const totalAmount = calculateTotalFee(cycle, eligibility);
                  const today = new Date().toISOString().split("T")[0];
                  const isLate = today > cycle.fee_configuration.regular_end_date;
                  const isBlocked = eligibility && (!eligibility.hod_permission || !eligibility.fee_clear_permission);

                  return (
                    <div key={cycle.id} className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative transition-transform hover:-translate-y-1 duration-300">
                      {/* Status Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPaid ? 'bg-blue-400' : isBlocked ? 'bg-gray-300' : 'bg-blue-600'}`}></div>

                      <div className="p-8 pl-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {cycle.cycle_name.replace(/_/g, " ")}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              Registration closes {new Date(cycle.fee_configuration.final_registration_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-left sm:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[140px]">
                            <div className="text-3xl font-black text-gray-900 tracking-tight">₹{totalAmount.toLocaleString()}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Fee</div>
                          </div>
                        </div>

                        {/* Fee Decomposition */}
                        <div className="border-t border-b border-gray-100 py-6 mb-8 space-y-3">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-600 font-medium">Standard Exam Fee</span>
                            <span className="font-bold text-gray-900">₹{parseFloat(cycle.fee_configuration.base_fee).toLocaleString()}</span>
                          </div>
                          {isLate && (
                            <div className="flex justify-between text-sm items-center">
                              <span className="text-gray-600 font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 text-gray-400" /> Late Registration Fine</span>
                              <span className="font-bold text-gray-900">+ ₹{parseFloat(cycle.fee_configuration.slabs.find(s => today >= s.start_date && today <= s.end_date)?.fine_amount || 0).toLocaleString()}</span>
                            </div>
                          )}
                          {eligibility?.has_condonation && (
                            <div className="flex justify-between text-sm items-center">
                              <span className="text-gray-600 font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gray-400" /> Condonation Fee</span>
                              <span className="font-bold text-gray-900">+ ₹{parseFloat(cycle.condonation_fee_amount || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Blockers */}
                        {isBlocked && !isPaid && (
                          <div className="mb-8 flex gap-4 items-start p-5 bg-gray-50 rounded-xl border border-gray-200">
                            <XCircle className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-black text-gray-900 uppercase tracking-wide">Registration Blocked</p>
                              <div className="text-sm text-gray-600 space-y-1 pt-1">
                                {!eligibility.hod_permission && <p>• Attendance below threshold ({cycle.attendance_threshold_condonation}%). HOD Approval required.</p>}
                                {!eligibility.fee_clear_permission && <p>• Outstanding tuition fees pending.</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action */}
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-400 font-medium">
                            Transaction secured by Razorpay
                          </div>

                          {isPaid ? (
                            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                              <CheckCircle className="w-4 h-4" /> Paid & Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePayFee(cycle.id)}
                              disabled={paying === cycle.id || isBlocked}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                            >
                              {paying === cycle.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Proceed to Payment'}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-16 border-2 border-dashed border-gray-100 rounded-3xl text-center bg-gray-50/30">
                  <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">No pending payments needed.</p>
                </div>
              )}
            </div>

            {/* Right Column: History */}
            <div className="xl:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">History</h2>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="space-y-4">
                  {paymentHistory.length > 0 ? paymentHistory.map((payment) => (
                    <div key={payment.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gray-50 group-hover:bg-blue-500 transition-colors"></div>

                      <div className="pl-2">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date(payment.payment_date).toLocaleDateString()}</span>
                          <span className="text-sm font-bold text-gray-900">₹{parseFloat(payment.amount_paid).toLocaleString()}</span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {payment.exam_cycle?.cycle_name?.replace(/_/g, " ")}
                          </p>
                        </div>

                        {payment.payment_status === "success" && (
                          <button
                            onClick={() => handlePrintReceipt(payment)}
                            className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No transaction history available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExaminationsHub;
