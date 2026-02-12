import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Filter,
  User,
  Home,
  LogOut,
  LogIn,
  ChevronRight,
  Loader2,
  Calendar,
  Zap,
  Ticket,
  Key,
  CalendarDays,
  MapPin,
  MessageSquare,
  QrCode,
  ArrowRight,
  Download,
} from "lucide-react";
import {
  fetchGatePasses,
  createGatePass,
  verifyGatePassOtp,
  rejectGatePass,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const GatePassManagement = () => {
  const dispatch = useDispatch();
  const { gatePasses, status, operationStatus, operationError } = useSelector(
    (state) => state.hostel,
  );
  const { user } = useSelector((state) => state.auth);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [activeTab, setActiveTab] = useState("requests"); // For students: 'requests', 'passes'
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [formData, setFormData] = useState({
    purpose: "",
    destination: "",
    pass_type: "long", // 'day' or 'long'
    going_date: new Date().toISOString().split("T")[0],
    coming_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    expected_out_time: "09:00",
    expected_in_time: "18:00",
  });

  useEffect(() => {
    const params = {};
    if (user?.role !== "student") {
      params.month = filters.month;
      params.year = filters.year;
    }
    dispatch(fetchGatePasses(params));
  }, [dispatch, filters, user?.role]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Operation successful!");
      setIsRequestModalOpen(false);
      setIsVerifyModalOpen(false);
      setOtpValue("");
      setRejectionRemarks("");
      setSelectedPass(null);
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, operationError]);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    dispatch(createGatePass(formData));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpValue) return toast.error("Please enter OTP");
    dispatch(verifyGatePassOtp({ id: selectedPass.id, otp: otpValue }));
  };

  const handleReject = () => {
    if (!rejectionRemarks)
      return toast.error("Please provide rejection reason");
    dispatch(
      rejectGatePass({ id: selectedPass.id, remarks: rejectionRemarks }),
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="col-span-full py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 text-center">
      <Icon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Empty</h3>
      <p className="text-gray-500 text-sm mt-2 italic px-10">{message}</p>
    </div>
  );

  const DigitalPass = ({ pass }) => (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl hover:-translate-y-2 transition-all duration-500 group">
      {/* Ticket Header */}
      <div className="bg-indigo-600 p-6 text-white text-center pb-12">
        <div className="flex justify-between items-center mb-4">
          <Ticket className="w-6 h-6 opacity-50" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Official Outing Pass
          </span>
          <ShieldCheck className="w-6 h-6 opacity-50" />
        </div>
        <h3 className="text-2xl font-black tracking-tighter">
          UNIPILOT UNIVERSITY
        </h3>
      </div>

      {/* Ticket Body */}
      <div className="px-8 pb-8 -mt-6 bg-white dark:bg-gray-800 rounded-t-[3rem] relative">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white dark:bg-gray-700 p-2 rounded-2xl shadow-lg -mt-12 mb-6 border-4 border-indigo-50 dark:border-indigo-900/50">
            <QrCode className="w-full h-full text-gray-900 dark:text-gray-100" />
          </div>

          <div className="w-full text-center space-y-1 mb-8">
            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase leading-none">
              {pass.student?.first_name} {pass.student?.last_name}
            </h4>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              ID: {pass.student?.student_id} • {pass.student?.section}
            </p>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 border-y border-dashed border-gray-100 dark:border-gray-700 py-6 mb-6">
            <div className="text-center border-r border-gray-50 dark:border-gray-700">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Outing Date
              </p>
              <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                {new Date(pass.going_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                {pass.pass_type === "day" ? "Expected Return" : "Expiry Date"}
              </p>
              <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                {pass.pass_type === "day"
                  ? pass.expected_in_time
                  : new Date(pass.coming_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-gray-400 uppercase tracking-widest">
                Pass Type
              </span>
              <span className="text-gray-800 dark:text-gray-300 font-black uppercase text-indigo-600">
                {pass.pass_type === "day" ? "Day Outing" : "Long Leave"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-gray-400 uppercase tracking-widest">
                Destination
              </span>
              <span className="text-gray-800 dark:text-gray-300 font-black truncate ml-4 italic">
                {pass.destination}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-gray-400 uppercase tracking-widest">
                Warden Verified
              </span>
              <span className="p-1 bg-green-500 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>
          </div>

          <div className="mt-8 w-full">
            <button className="w-full py-4 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Download e-Pass
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Ticket Punches */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-indigo-950 rounded-full z-10 hidden md:block" />
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-indigo-950 rounded-full z-10 hidden md:block" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-3xl">
            <Ticket className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
              Hostel Gate Pass
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Request outing authorization via parent SMS OTP verification.
            </p>
          </div>
        </div>
        {user?.role === "student" && (
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30 active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-3" />
            Request Pass
          </button>
        )}
      </div>

      {/* Stats Summary for Warden */}
      {user?.role !== "student" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Pending Verification
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {gatePasses?.filter((p) => p.status === "pending").length ||
                    0}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Attendance Synced
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {gatePasses?.filter((p) => p.attendance_synced).length || 0}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Total Issued (Month)
                </p>
                <h3 className="text-2xl font-black mt-1">
                  {gatePasses?.filter((p) => p.status === "approved").length ||
                    0}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {user?.role === "student" ? (
          <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "requests"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab("passes")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "passes"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Outing Pass
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-xs font-bold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
            <select
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-xs font-bold text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {status === "loading" ? (
          <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Fetching pass records...
            </p>
          </div>
        ) : user?.role === "student" ? (
          /* Student View logic */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "requests" ? (
              /* Pending/Rejected Cards */
              gatePasses?.filter((p) => p.status !== "approved").length > 0 ? (
                gatePasses
                  .filter((p) => p.status !== "approved")
                  .map((pass) => (
                    <div
                      key={pass.id}
                      className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(pass.status)}`}
                        >
                          {pass.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {pass.pass_type === "day"
                            ? "Day Outing"
                            : "Long Leave"}
                        </span>
                      </div>
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-indigo-400 mr-3" />
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {new Date(pass.going_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-indigo-400 mr-3 mt-1" />
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {pass.destination}
                          </p>
                        </div>
                      </div>
                      {pass.status === "pending" && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <p className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">
                            Waiting for OTP
                          </p>
                          <p className="text-[9px] text-amber-600 font-bold mt-1">
                            Parent OTP:{" "}
                            <span className="text-indigo-600 font-black tracking-widest">
                              {pass.parent_otp}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <EmptyState
                  icon={Ticket}
                  message="No pending or rejected requests found."
                />
              )
            ) : /* Approved - Digital Pass View */
            gatePasses?.filter((p) => p.status === "approved").length > 0 ? (
              gatePasses
                .filter((p) => p.status === "approved")
                .map((pass) => <DigitalPass key={pass.id} pass={pass} />)
            ) : (
              <EmptyState
                icon={ShieldCheck}
                message="No active outing passes found."
              />
            )}
          </div>
        ) : (
          /* Management View - Table */
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Pass Details
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Duration
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {gatePasses?.length > 0 ? (
                    gatePasses.map((pass) => (
                      <tr
                        key={pass.id}
                        className="hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900 dark:text-white">
                                {pass.student?.first_name}{" "}
                                {pass.student?.last_name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {pass.student?.student_id} •{" "}
                                {pass.student?.section}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                              {pass.pass_type === "day"
                                ? "Day Outing"
                                : "Long Leave"}
                            </span>
                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 truncate w-32">
                              {pass.destination}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            {new Date(pass.going_date).toLocaleDateString()}
                            {pass.pass_type === "long" && (
                              <>
                                <ArrowRight className="w-3 h-3 mx-2 text-gray-400" />
                                {new Date(
                                  pass.coming_date,
                                ).toLocaleDateString()}
                              </>
                            )}
                            {pass.pass_type === "day" && (
                              <span className="ml-2 text-indigo-500">
                                ({pass.expected_out_time} -{" "}
                                {pass.expected_in_time})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(pass.status)}`}
                          >
                            {pass.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {pass.status === "pending" && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedPass(pass);
                                  setIsVerifyModalOpen(true);
                                }}
                                className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                title="Verify OTP"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPass(pass);
                                  const reason = prompt(
                                    "Enter rejection reason:",
                                  );
                                  if (reason)
                                    dispatch(
                                      rejectGatePass({
                                        id: pass.id,
                                        remarks: reason,
                                      }),
                                    );
                                }}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {pass.status === "approved" && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Verified
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Search className="w-12 h-12 text-gray-200 mb-4" />
                          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            No pass records found for this period
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Pass Request (Student) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in">
            <div className="px-10 py-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white font-display">
                    Request Pass
                  </h2>
                  <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    Authorization Details
                  </p>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"
                >
                  <Plus className="w-7 h-7 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-6">
                {/* Pass Type Toggle */}
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, pass_type: "day" })
                    }
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      formData.pass_type === "day"
                        ? "bg-white dark:bg-gray-600 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Day Outing
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, pass_type: "long" })
                    }
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      formData.pass_type === "long"
                        ? "bg-white dark:bg-gray-600 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Long Leave
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div
                    className={formData.pass_type === "day" ? "col-span-2" : ""}
                  >
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      {formData.pass_type === "day"
                        ? "Outing Date"
                        : "Going Date"}
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                        value={formData.going_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            going_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {formData.pass_type === "long" ? (
                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        Coming Date
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          required
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                          value={formData.coming_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coming_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                          Out Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            required={formData.pass_type === "day"}
                            className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                            value={formData.expected_out_time}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expected_out_time: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                          In Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            required={formData.pass_type === "day"}
                            className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                            value={formData.expected_in_time}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expected_in_time: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="text"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-bold shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Home, Local Market, Hospital"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Purpose/Reason *
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl text-sm font-bold shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                    placeholder="Briefly explain your requirement..."
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                  />
                </div>

                <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start">
                  <AlertCircle className="w-5 h-5 text-indigo-600 mr-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-indigo-700 leading-relaxed italic">
                    SMS alert with an OTP will be sent to your parent's
                    registered mobile number. You must provide that OTP to the
                    Warden for final approval.
                  </p>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="w-full px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center shadow-2xl shadow-indigo-600/40"
                  >
                    {operationStatus === "loading" ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Submit Pass Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Verify OTP (Warden) */}
      {isVerifyModalOpen && selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in border border-gray-100">
            <div className="px-10 py-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white font-display">
                  Verification Required
                </h2>
                <p className="text-gray-500 text-xs font-medium mt-2">
                  Enter the 6-digit OTP received by{" "}
                  <span className="font-bold text-gray-900 font-mono italic">
                    {selectedPass.student?.first_name}'s
                  </span>{" "}
                  parent.
                </p>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl w-full text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Type
                    </span>
                    <span className="text-xs font-black text-indigo-600 uppercase">
                      {selectedPass.pass_type === "day"
                        ? "Day Outing"
                        : "Long Leave"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {selectedPass.pass_type === "day" ? "Date" : "Going"}
                    </span>
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                      {new Date(selectedPass.going_date).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedPass.pass_type === "day" ? (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Times
                      </span>
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                        {selectedPass.expected_out_time} -{" "}
                        {selectedPass.expected_in_time}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Returns
                      </span>
                      <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                        {new Date(
                          selectedPass.coming_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  <input
                    required
                    maxLength={6}
                    type="text"
                    className="w-full pl-16 pr-6 py-6 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl text-2xl font-black tracking-[0.5em] text-center focus:ring-8 focus:ring-indigo-600/5 transition-all text-indigo-600"
                    placeholder="000000"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsVerifyModalOpen(false)}
                    className="flex-1 px-6 py-4 border-2 border-gray-100 dark:border-gray-700 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center shadow-xl shadow-indigo-600/20"
                  >
                    {operationStatus === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Confirm & Approve"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatePassManagement;
