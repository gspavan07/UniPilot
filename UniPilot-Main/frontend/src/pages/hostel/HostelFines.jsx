import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  Calendar,
  Loader2,
  Edit,
  Trash2,
  X,
  CreditCard,
  Hash,
  Home,
  ArrowLeft,
  TrendingUp,
  Receipt,
} from "lucide-react";
import {
  fetchFines,
  issueFine,
  updateFine,
  deleteFine,
  resetOperationStatus,
  fetchAllocations,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const HostelFines = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { fines, allocations, status, operationStatus, operationError } =
    useSelector((state) => state.hostel);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Student Search in Modal
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentList, setShowStudentList] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    fine_type: "damage",
    amount: "",
    reason: "",
    due_date: "",
  });

  useEffect(() => {
    dispatch(fetchFines());
    dispatch(fetchAllocations());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Operation completed successfully");
      setShowModal(false);
      resetForm();
      dispatch(resetOperationStatus());
      dispatch(fetchFines());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch]);

  // Handle click away for student list
  useEffect(() => {
    const handleClickAway = (e) => {
      if (showStudentList && !e.target.closest(".student-search-container")) {
        setShowStudentList(false);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [showStudentList]);

  const resetForm = () => {
    setFormData({
      student_id: "",
      fine_type: "damage",
      amount: "",
      reason: "",
      due_date: "",
    });
    setSelectedStudent(null);
    setStudentSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(issueFine(formData));
  };

  const handleWaiveFine = async (id) => {
    if (window.confirm("Are you sure you want to waive this fine?")) {
      await dispatch(updateFine({ id, data: { status: "waived" } }));
    }
  };

  const handleDeleteFine = async (id) => {
    if (window.confirm("Are you sure you want to delete this fine?")) {
      await dispatch(deleteFine(id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-100",
        icon: AlertCircle,
        label: "Pending",
      },
      paid: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-100",
        icon: CheckCircle2,
        label: "Paid",
      },
      waived: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-100",
        icon: CheckCircle2,
        label: "Waived",
      },
      cancelled: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-100",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      damage: "Damage",
      disciplinary: "Disciplinary",
      late_payment: "Late Payment",
      curfew_violation: "Curfew Violation",
      other: "Other",
    };
    return labels[type] || type;
  };

  // Filter fines
  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.student?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      fine.student?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      fine.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || fine.status === statusFilter;

    const matchesType = typeFilter === "all" || fine.fine_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans text-gray-900">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 mr-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Fines & Penalties
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-14">
              Manage student fines and penalty records.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Issue Fine
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Total Fines</p>
                <p className="text-2xl font-black text-gray-900 mt-2">
                  {fines.length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Receipt className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-yellow-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase">Pending</p>
                <p className="text-2xl font-black text-yellow-900 mt-2">
                  {fines.filter((f) => f.status === "pending").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-700 uppercase">Paid</p>
                <p className="text-2xl font-black text-green-900 mt-2">
                  {fines.filter((f) => f.status === "paid").length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase">Total Amount</p>
                <p className="text-2xl font-black text-blue-900 mt-2">
                  ₹{fines
                    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer appearance-none"
              >
                <option value="all">All Types</option>
                <option value="damage">Damage</option>
                <option value="disciplinary">Disciplinary</option>
                <option value="late_payment">Late Payment</option>
                <option value="curfew_violation">Curfew Violation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fines Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFines.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-20 text-center"
                    >
                      <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4 border border-gray-100">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No fines found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchTerm ||
                          statusFilter !== "all" ||
                          typeFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Issue fines to students for violations"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredFines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mr-3 border border-blue-200">
                            {fine.student?.first_name?.[0] || "U"}
                            {fine.student?.last_name?.[0] || ""}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {fine.student?.first_name} {fine.student?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              ID: <span className="font-mono">{fine.student?.student_id}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {getTypeLabel(fine.fine_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900">
                          ₹{parseFloat(fine.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {fine.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {new Date(fine.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(fine.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {fine.status === "pending" && (
                            <button
                              onClick={() => handleWaiveFine(fine.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="Waive Fine"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFine(fine.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete Fine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Fine Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    Issue Fine
                  </h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
                    Create New Penalty Record
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50/50 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Student Selection */}
                <div className="relative student-search-container">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or roll number..."
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setShowStudentList(true);
                      }}
                      onFocus={() => setShowStudentList(true)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {showStudentList && (
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {allocations
                        .filter(
                          (a) =>
                            a.student?.first_name
                              ?.toLowerCase()
                              .includes(studentSearch.toLowerCase()) ||
                            a.student?.last_name
                              ?.toLowerCase()
                              .includes(studentSearch.toLowerCase()) ||
                            a.student?.student_id
                              ?.toLowerCase()
                              .includes(studentSearch.toLowerCase()) ||
                            a.room?.room_number
                              ?.toLowerCase()
                              .includes(studentSearch.toLowerCase()),
                        )
                        .map((allocation) => (
                          <button
                            key={allocation.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudent(allocation.student);
                              setFormData({
                                ...formData,
                                student_id: allocation.student.id,
                              });
                              setStudentSearch(
                                `${allocation.student.first_name} ${allocation.student.last_name} (${allocation.student.student_id})`,
                              );
                              setShowStudentList(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <div className="font-bold text-gray-900 text-sm">
                              {allocation.student?.first_name}{" "}
                              {allocation.student?.last_name}
                            </div>
                            <div className="text-xs text-gray-500 flex justify-between mt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <Hash className="w-3 h-3" />{" "}
                                {allocation.student?.student_id}
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Home className="w-3 h-3" />{" "}
                                {allocation.room?.room_number}
                              </span>
                            </div>
                          </button>
                        ))}
                      {allocations.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No students found
                        </div>
                      )}
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {selectedStudent.first_name}{" "}
                            {selectedStudent.last_name}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">
                            {selectedStudent.student_id}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setFormData({ ...formData, student_id: "" });
                          setStudentSearch("");
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="hidden"
                    name="student_id"
                    required
                    value={formData.student_id}
                  />
                </div>

                {/* Fine Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Fine Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.fine_type}
                    onChange={(e) =>
                      setFormData({ ...formData, fine_type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="damage">Damage</option>
                    <option value="disciplinary">Disciplinary</option>
                    <option value="late_payment">Late Payment</option>
                    <option value="curfew_violation">Curfew Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0.00"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Describe the reason for the fine..."
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {operationStatus === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Issuing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Issue Fine
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelFines;
