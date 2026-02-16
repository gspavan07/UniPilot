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

    // Prepare header info that will be used for the receipt identification
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

    // 1. Base Fee
    if (breakup.base_fee > 0) {
      items.push({
        ...headerInfo,
        amount_paid: breakup.base_fee,
        fee_structure: { category: { name: payment.fee_type || "Exam Fee" } },
        remarks: "Examination Registration Fee",
      });
    }

    // 2. Late Fine
    if (breakup.late_fine > 0) {
      items.push({
        ...headerInfo,
        amount_paid: breakup.late_fine,
        fee_structure: { category: { name: "Late Fine" } },
        remarks: "Fine for registration after regular deadline",
      });
    }

    // 3. Condonation Fee
    if (breakup.condonation > 0) {
      items.push({
        ...headerInfo,
        amount_paid: breakup.condonation,
        fee_structure: { category: { name: "Condonation Fee" } },
        remarks: "Attendance shortage condonation fee",
      });
    }

    // Fallback if no breakup is available
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

    // Add condonation fee if applicable
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cyclesNeedingFee = exams.filter((c) => c.needs_fee);

  return (
    <div className="space-y-6 text-gray-900 dark:text-white pb-20 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center">
            <Award className="w-8 h-8 mr-3 text-blue-600" />
            Examinations Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your exam schedules and fee payments.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "schedule"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "payments"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <CreditCard className="w-4 h-4" />
            Exam Fee
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "schedule" ? (
        // SCHEDULE TAB
        <div className="space-y-4">
          {exams.length > 0 ? (
            exams.map((exam) => {
              const eligibility = exam.student_eligibilities?.[0];
              const needsFee = exam.needs_fee;
              const paymentStatus = exam.student_payments?.[0]?.status;
              const isEligible =
                eligibility?.hod_permission &&
                eligibility?.fee_clear_permission;

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {exam.cycle_name.replace(/_/g, " ")}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Semester {exam.semester} • {exam.exam_month}{" "}
                        {exam.exam_year}
                      </p>
                    </div>
                    {needsFee &&
                      (paymentStatus === "completed" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-bold">
                          Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveTab("payments")}
                          className="px-3 py-1 cursor-pointer bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg border border-yellow-700 text-xs font-bold"
                        >
                          Pay Fee
                        </button>
                      ))}
                  </div>

                  {/* Timetable */}
                  {exam.timetables && exam.timetables.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Session
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {exam.timetables
                            .sort(
                              (a, b) =>
                                new Date(a.exam_date) - new Date(b.exam_date),
                            )
                            .map((timetable) => (
                              <tr
                                key={timetable.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-bold text-sm">
                                    {timetable.course.code}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {timetable.course.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                  {new Date(
                                    timetable.exam_date,
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${timetable.session === "morning"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                                      }`}
                                  >
                                    {timetable.session.charAt(0).toUpperCase() +
                                      timetable.session.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                  {timetable.start_time.slice(0, 5)} -{" "}
                                  {timetable.end_time.slice(0, 5)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No timetable available yet</p>
                    </div>
                  )}

                  {/* Eligibility Issues */}
                  {eligibility && !isEligible && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
                        Eligibility Issues
                      </p>
                      <div className="space-y-1">
                        {!eligibility.hod_permission && (
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <XCircle className="w-4 h-4" />
                            HOD permission required
                          </div>
                        )}
                        {!eligibility.fee_clear_permission && (
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <XCircle className="w-4 h-4" />
                            Fee clearance required (₹
                            {(
                              eligibility.fee_balance || 0
                            ).toLocaleString()}{" "}
                            pending)
                          </div>
                        )}
                        {eligibility.has_condonation && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="w-4 h-4" />
                            Condonation fee applicable
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Exams Scheduled</h3>
              <p className="text-gray-500 dark:text-gray-400">
                You don't have any exam schedules at the moment.
              </p>
            </div>
          )}
        </div>
      ) : (
        // EXAM FEE TAB
        <div className="space-y-8">
          {/* Active Fee Payments */}
          {cyclesNeedingFee.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Active Fee Payments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cyclesNeedingFee.map((cycle) => {
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
                      className="p-6 rounded-2xl border bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    >
                      {!isPaid && isLate && (
                        <div className="absolute top-0 right-0 p-4">
                          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Pending
                          </div>
                        </div>
                      )}

                      <h3 className="text-lg font-bold mb-1">
                        {cycle.cycle_name.replace(/_/g, " ")}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6 font-bold">
                        <Calendar className="w-3 h-3 mr-1" />
                        Deadline:{" "}
                        {new Date(
                          cycle.fee_configuration.final_registration_date,
                        ).toLocaleDateString()}
                      </div>

                      {/* Fee Breakdown */}
                      <div className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-3">
                          Fee Breakdown
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Base Fee
                            </span>
                            <span className="font-bold">
                              ₹
                              {parseFloat(
                                cycle.fee_configuration.base_fee,
                              ).toLocaleString()}
                            </span>
                          </div>
                          {isLate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Late Fee
                              </span>
                              <span className="font-bold text-red-600 dark:text-red-400">
                                +₹
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
                            <div className="flex justify-between text-sm">
                              <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Condonation Fee
                              </span>
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                +₹
                                {parseFloat(
                                  cycle.condonation_fee_amount || 0,
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                            <span className="font-black text-gray-900 dark:text-white">
                              Total Amount
                            </span>
                            <span className="text-xl font-black text-blue-600">
                              ₹{totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Condonation Notice */}
                      {eligibility?.has_condonation && !isPaid && (
                        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800/50">
                          <p className="text-xs text-orange-700 dark:text-orange-400 flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>
                              Your attendance is in the{" "}
                              <strong>condonation range</strong>. An additional
                              fee of ₹
                              {parseFloat(
                                cycle.condonation_fee_amount || 0,
                              ).toLocaleString()}{" "}
                              has been included in the total.
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Block Warning */}
                      {isBlocked && !isPaid && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Payment Blocked
                          </p>
                          <div className="space-y-1.5">
                            {!eligibility.hod_permission && (
                              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>
                                  <strong>HOD Permission Required:</strong> Your
                                  attendance is below{" "}
                                  {cycle.attendance_threshold_condonation}%.
                                  Contact your department for approval.
                                </span>
                              </div>
                            )}
                            {!eligibility.fee_clear_permission && (
                              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>
                                  <strong>Fee Clearance Required:</strong> You
                                  have pending tuition fees of ₹
                                  {(
                                    eligibility.fee_balance || 0
                                  ).toLocaleString()}
                                  . Clear your dues first.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pay Button */}
                      {!isPaid ? (
                        <button
                          onClick={() => handlePayFee(cycle.id)}
                          disabled={paying === cycle.id || isBlocked}
                          className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 group ${isBlocked
                              ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                            } disabled:opacity-50`}
                        >
                          {paying === cycle.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : isBlocked ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Payment Blocked
                            </>
                          ) : (
                            <>
                              Proceed to Pay
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center text-emerald-600 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl ring-1 ring-emerald-500/20">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Payment Completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Payment History
            </h2>
            {paymentHistory.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Exam Cycle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4">
                          <div className="font-bold">
                            {payment.exam_cycle?.cycle_name?.replace(/_/g, " ")}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.exam_cycle?.semester} Semester
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                          ₹{parseFloat(payment.amount_paid).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${payment.payment_status === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : payment.payment_status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                          >
                            {payment.payment_status.toUpperCase()}
                          </span>

                          {payment.payment_status === "success" && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handlePrintReceipt(payment)}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3 h-3" /> #
                                {payment?.transaction?.transaction_id?.slice(
                                  -6,
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No payment history found
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationsHub;
