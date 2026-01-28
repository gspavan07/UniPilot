import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: AlertCircle,
        label: "Pending",
      },
      paid: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle2,
        label: "Paid",
      },
      waived: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: CheckCircle2,
        label: "Waived",
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hostel Fines</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage student fines and penalties
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Issue Fine
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Fines</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {fines.length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {fines.filter((f) => f.status === "pending").length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-800">Paid</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {fines.filter((f) => f.status === "paid").length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-800">Total Amount</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            ₹
            {fines
              .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFines.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No fines found</p>
                    <p className="text-sm mt-1">
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
                  <tr key={fine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {fine.student?.first_name} {fine.student?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {fine.student?.student_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getTypeLabel(fine.fine_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{parseFloat(fine.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                        {fine.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(fine.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(fine.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {fine.status === "pending" && (
                          <button
                            onClick={() => handleWaiveFine(fine.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Waive Fine"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFine(fine.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Fine"
                        >
                          <Trash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Issue Fine
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create a new fine for a student
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Student Selection */}
              <div className="relative student-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setShowStudentList(true);
                    }}
                    onFocus={() => setShowStudentList(true)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <div className="font-medium text-gray-900 text-sm">
                            {allocation.student?.first_name}{" "}
                            {allocation.student?.last_name}
                          </div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />{" "}
                              {allocation.student?.student_id}
                            </span>
                            <span className="flex items-center gap-1">
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
                        <p className="text-sm font-medium text-gray-900">
                          {selectedStudent.first_name}{" "}
                          {selectedStudent.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fine Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.fine_type}
                  onChange={(e) =>
                    setFormData({ ...formData, fine_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the reason for the fine..."
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationStatus === "loading"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {operationStatus === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
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
  );
};

export default HostelFines;
