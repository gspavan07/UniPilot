import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  DollarSign,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Download,
  Lock,
  ChevronRight,
  X,
} from "lucide-react";
import {
  configureReverification,
  getReverificationRequests,
  reviewReverification,
  waiveReverificationFee,
  clearMessages,
} from "../../redux/slices/reverificationSlice";
import api from "../../utils/api";

const ReverificationManagement = () => {
  const dispatch = useDispatch();
  const { requests, pagination, loading, error, success } = useSelector(
    (state) => state.reverification,
  );

  const [selectedCycle, setSelectedCycle] = useState("");
  const [examCycles, setExamCycles] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [config, setConfig] = useState({
    is_reverification_open: false,
    reverification_start_date: "",
    reverification_end_date: "",
    reverification_fee_per_paper: 0,
  });

  const [reviewData, setReviewData] = useState({
    status: "",
    revised_marks: "",
    remarks: "",
  });

  useEffect(() => {
    fetchExamCycles();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      // Load the selected cycle's configuration
      const cycle = examCycles.find((c) => c.id === selectedCycle);
      if (cycle) {
        setConfig({
          is_reverification_open: cycle.is_reverification_open || false,
          reverification_start_date: cycle.reverification_start_date || "",
          reverification_end_date: cycle.reverification_end_date || "",
          reverification_fee_per_paper: cycle.reverification_fee_per_paper || 0,
        });
      }
      fetchRequests();
    }
  }, [selectedCycle, examCycles]);

  useEffect(() => {
    if (selectedCycle && filterStatus !== undefined) {
      fetchRequests();
    }
  }, [filterStatus]);

  useEffect(() => {
    if (success || error) {
      setTimeout(() => dispatch(clearMessages()), 3000);
    }
  }, [success, error, dispatch]);

  const fetchExamCycles = async () => {
    try {
      const response = await api.get("/exam/cycles");
      console.log("API response:", response.data);

      // Handle different response structures
      let cycles = [];
      if (Array.isArray(response.data)) {
        cycles = response.data;
      } else if (response.data.cycles && Array.isArray(response.data.cycles)) {
        cycles = response.data.cycles;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        cycles = response.data.data;
      }

      console.log("Extracted cycles:", cycles);
      setExamCycles(cycles.filter((c) => c.exam_type === "semester_end"));
    } catch (err) {
      console.error("Error fetching cycles:", err);
      setExamCycles([]);
    }
  };

  const fetchRequests = () => {
    dispatch(
      getReverificationRequests({
        exam_cycle_id: selectedCycle,
        status: filterStatus || undefined,
      }),
    );
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    dispatch(
      configureReverification({
        exam_cycle_id: selectedCycle,
        ...config,
      }),
    ).then(() => {
      setShowConfigModal(false);
      fetchExamCycles();
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    dispatch(
      reviewReverification({
        id: selectedRequest.id,
        reviewData,
      }),
    ).then(() => {
      setShowReviewModal(false);
      setSelectedRequest(null);
      fetchRequests();
    });
  };

  const handleWaiveFee = (requestId) => {
    if (confirm("Are you sure you want to waive the reverification fee?")) {
      dispatch(waiveReverificationFee(requestId)).then(() => {
        fetchRequests();
      });
    }
  };

  const handleCloseWindow = async () => {
    if (
      !confirm(
        "Close reverification window? All pending requests will move to 'Under Review' status.",
      )
    ) {
      return;
    }
    try {
      await api.post(`/exam/reverification/${selectedCycle}/close-window`);
      alert(
        "Reverification window closed successfully! Requests moved to under review.",
      );
      fetchExamCycles();
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to close window");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
      {/* Professional Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-8 py-5 flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Reverification Hub
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Examination Cell • Quality Control
            </p>
          </div>
          <div className="flex items-center gap-4">
            {selectedCycle && (
              <>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <Calendar size={14} /> Configure
                </button>
                {config.is_reverification_open && (
                  <button
                    onClick={handleCloseWindow}
                    className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Lock size={14} /> Close Window
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Alerts */}
        {(success || error) && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 transition-opacity ${
              success
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            {success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold uppercase tracking-wide">
              {success || error}
            </span>
          </div>
        )}

        {/* Global Controls */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
              Exam Cycle
            </label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
            >
              <option value="">Select Examination Cycle</option>
              {examCycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} ({cycle.year} -{" "}
                  {cycle.month?.toUpperCase() || "N/A"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              disabled={!selectedCycle}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Requests</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed/Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex-[2]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
              Rapid Search
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by ID, First Name, or Last Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                disabled={!selectedCycle}
              />
            </div>
          </div>
        </div>

        {/* Actionable List */}
        {selectedCycle && (
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-gray-700">
                  {filteredRequests.length} Applications Found
                </span>
                {filterStatus && (
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    • Filter: {filterStatus.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-gray-700">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Student Info
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Subject Detail
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                      Grading
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                      Workflow Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                      Finance
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Synchronizing with Server...
                        </p>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-32 text-center text-slate-400"
                      >
                        <FileText
                          className="mx-auto mb-4 opacity-20"
                          size={48}
                        />
                        <p className="text-sm font-bold uppercase tracking-widest">
                          No Applications Recorded
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="group hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div>
                            <div className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                              {request.student.first_name}{" "}
                              {request.student.last_name}
                            </div>
                            <div className="text-[10px] font-bold text-indigo-500 mt-0.5">
                              {request.student.student_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[11px] font-bold text-slate-600 dark:text-gray-300 uppercase truncate max-w-[180px]">
                            {request.schedule.course.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">
                            {request.schedule.course.code}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-xs font-black text-slate-400">
                              {request.original_grade ||
                                request.exam_mark?.grade ||
                                "-"}
                            </span>
                            {(request.revised_marks ||
                              request.revised_grade) && (
                              <>
                                <ChevronRight
                                  size={12}
                                  className="text-slate-300"
                                />
                                <span className="text-xs font-black text-emerald-600">
                                  {request.revised_grade ||
                                    request.exam_mark?.grade}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center">
                            {getStatusBadge(request.status)}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center text-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                request.payment_status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : request.payment_status === "waived"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {request.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewData({
                                  status: request.status,
                                  revised_marks:
                                    request.revised_marks ||
                                    request.original_marks,
                                  remarks: request.remarks || "",
                                });
                                setShowReviewModal(true);
                              }}
                              className="w-10 h-10 border border-slate-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-90"
                              title="Review Application"
                            >
                              <FileText size={16} />
                            </button>
                            {request.payment_status === "pending" && (
                              <button
                                onClick={() => handleWaiveFee(request.id)}
                                className="w-10 h-10 border border-slate-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-90"
                                title="Waive Application Fee"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modern Administrative Modals */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-900/50">
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Window Configuration
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfigSubmit} className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="window-toggle"
                  checked={config.is_reverification_open}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      is_reverification_open: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="window-toggle"
                  className="text-xs font-black text-slate-700 dark:text-gray-300 uppercase tracking-widest cursor-pointer"
                >
                  Accept Applications
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                    Opening Date
                  </label>
                  <input
                    type="date"
                    value={config.reverification_start_date}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        reverification_start_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required={config.is_reverification_open}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    value={config.reverification_end_date}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        reverification_end_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required={config.is_reverification_open}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                  Processing Fee (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={config.reverification_fee_per_paper}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        reverification_fee_per_paper: parseFloat(
                          e.target.value,
                        ),
                      })
                    }
                    className="w-full pl-10 pr-6 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  Apply Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-white/20">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-900/50">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  Review Application
                </h2>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                  {selectedRequest.student.student_id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 pb-0 grid grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                  Subject Context
                </span>
                <p className="text-[11px] font-black text-slate-700 dark:text-gray-300 uppercase leading-tight">
                  {selectedRequest.schedule.course.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                  {selectedRequest.schedule.course.code}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 text-center flex flex-col justify-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                  Score Delta
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg font-black text-slate-400">
                    {selectedRequest.original_marks || "-"}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                  <span className="text-lg font-black text-emerald-600">
                    {reviewData.revised_marks || "-"}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                    Set Status
                  </label>
                  <select
                    value={reviewData.status}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Process Complete</option>
                    <option value="rejected">Reject Application</option>
                  </select>
                </div>

                {reviewData.status === "completed" && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                      Final Evaluated Marks
                    </label>
                    <input
                      type="number"
                      value={reviewData.revised_marks}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          revised_marks: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                  Internal Remarks / Observations
                </label>
                <textarea
                  value={reviewData.remarks}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, remarks: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-none"
                  placeholder="Enter evaluation details or rejection reasons..."
                />
              </div>

              <div className="pt-2 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 py-4 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-gray-600 transition-all"
                >
                  Close Review
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  Finalize Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReverificationManagement;
