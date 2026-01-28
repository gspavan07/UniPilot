import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Search,
  UserPlus,
  Home,
  Bed,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Plus,
  XCircle,
  AlertCircle,
  MoreVertical,
  LogOut,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Edit2,
  Trash2,
  History,
} from "lucide-react";
import {
  fetchAllocations,
  allocateStudent,
  updateAllocation,
  deleteAllocation,
  checkoutStudent,
  fetchBuildings,
  fetchAvailableRooms,
  fetchFeeStructures,
  fetchMessFeeStructures,
  fetchStayHistory,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import toast from "react-hot-toast";

const StudentAllocation = () => {
  const dispatch = useDispatch();
  const {
    allocations,
    buildings,
    availableRooms,
    feeStructures,
    messFeeStructures,
    stayHistory,
    status,
    operationStatus,
    operationError,
  } = useSelector((state) => state.hostel);
  const { users } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    id: null,
    type: "current",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedHistoryAllocation, setSelectedHistoryAllocation] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    building_id: "",
    room_id: "",
    bed_id: "",
    mess_fee_structure_id: "",
    fee_structure_id: "",
    semester: "",
    apply_to_future: true,
  });

  useEffect(() => {
    dispatch(fetchAllocations());
    dispatch(fetchBuildings());
    dispatch(fetchFeeStructures());
    dispatch(fetchMessFeeStructures());
    // No longer fetching all students at once for scalability
  }, [dispatch]);

  // Debounced student search
  useEffect(() => {
    if (studentSearchTerm.length < 2) return;
    const timer = setTimeout(() => {
      dispatch(fetchUsers({ role: "student", search: studentSearchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, studentSearchTerm]);

  useEffect(() => {
    if (formData.room_id) {
      // Optional: fetch specific bed details if needed,
      // but availableRooms already includes beds from hostelController
    }
  }, [formData.room_id]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        isEditing
          ? "Allocation updated!"
          : "Assignment completed successfully!",
      );
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        student_id: "",
        building_id: "",
        room_id: "",
        bed_id: "",
        mess_fee_structure_id: "",
        fee_structure_id: "",
        semester: "",
        apply_to_future: true,
      });
      setSelectedStudent(null);
      setStudentSearchTerm("");
      dispatch(fetchAllocations());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Assignment failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, operationError]);

  const handleAllocate = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updateAllocation({ id: editingId, data: formData }));
    } else {
      dispatch(allocateStudent(formData));
    }
  };

  const handleEdit = (allocation) => {
    setIsEditing(true);
    setEditingId(allocation.id);
    setFormData({
      student_id: allocation.student_id,
      building_id: allocation.room?.building_id || "",
      room_id: allocation.room_id,
      bed_id: allocation.bed_id,
      mess_fee_structure_id: allocation.mess_fee_structure_id,
      fee_structure_id: allocation.fee_structure_id,
      semester: allocation.semester,
      apply_to_future: false,
    });
    setSelectedStudent(allocation.student);
    setStudentSearchTerm(
      `${allocation.student?.first_name} ${allocation.student?.last_name} (${allocation.student?.student_id})`,
    );
    if (allocation.room?.building_id) {
      dispatch(
        fetchAvailableRooms({ building_id: allocation.room.building_id }),
      );
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this allocation? This will also deactivate the linked student invoices.",
      )
    ) {
      dispatch(deleteAllocation(id)).then(() => dispatch(fetchAllocations()));
    }
  };

  const handleCheckout = (id) => {
    setCheckoutData({ id, type: "current" });
    setIsCheckoutModalOpen(true);
  };

  const confirmCheckout = async () => {
    try {
      await dispatch(
        checkoutStudent({
          id: checkoutData.id,
          checkout_type: checkoutData.type,
        }),
      ).unwrap();
      setIsCheckoutModalOpen(false);
      dispatch(fetchAllocations());
      toast.success(
        checkoutData.type === "next"
          ? "Scheduled checkout for next semester"
          : "Student checked out successfully",
      );
    } catch (error) {
      toast.error(error || "Checkout failed");
    }
  };

  const handleViewHistory = (allocation) => {
    setSelectedHistoryAllocation(allocation);
    dispatch(fetchStayHistory(allocation.id));
    setIsHistoryOpen(true);
  };

  const handleBuildingChange = (building_id) => {
    setFormData((prev) => ({ ...prev, building_id, room_id: "", bed_id: "" }));
    dispatch(fetchAvailableRooms({ building_id }));
  };

  const filteredAllocations =
    allocations?.filter(
      (a) =>
        a?.student?.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        a?.student?.student_id
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/40 rounded-3xl">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
              Student Allocation
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Assign and manage student room placements.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-600/30 active:scale-95 group"
        >
          <UserPlus className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
          Assign New Student
        </button>
      </div>

      {/* Main List Management */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center hover:bg-gray-100 transition-all shadow-sm">
              <Filter className="w-4 h-4 mr-2" /> Recent Allocations
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Student Details
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Room Info
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Mess & Fees
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {status === "loading" ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold font-display uppercase tracking-widest text-xs">
                      Fetching records...
                    </p>
                  </td>
                </tr>
              ) : filteredAllocations.length > 0 ? (
                filteredAllocations.map((allocation) => (
                  <tr
                    key={allocation.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                          <span className="text-primary-700 dark:text-primary-300 font-bold font-display">
                            {allocation.student?.first_name?.[0] || "U"}
                            {allocation.student?.last_name?.[0] || "P"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            {allocation.student?.first_name}{" "}
                            {allocation.student?.last_name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider">
                            ID: {allocation.student?.student_id || "N/A"} •{" "}
                            {allocation.academic_year || "2024-25"} (Sem{" "}
                            {allocation.semester})
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
                          <Home className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            Room {allocation.room?.room_number}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {allocation.room?.building?.name || "Block"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <span className="inline-flex px-2 py-0.5 bg-success-100 text-success-700 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                          {allocation.mess_fee_structure?.mess_type || "N/A"}{" "}
                          Mess
                        </span>
                        <p className="text-[11px] font-bold text-gray-500 line-clamp-1 italic">
                          {allocation.fee_structure?.name || "Standard Plan"}
                        </p>
                        <p className="text-[10px] font-bold text-success-600">
                          {allocation.mess_fee_structure?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            allocation.status === "active"
                              ? "bg-success-100 text-success-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {allocation.status === "active" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                          )}
                          {allocation.status?.replace("_", " ") || "UNKNOWN"}
                        </span>
                        {allocation.scheduled_checkout_semester && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-warning-100 text-warning-700">
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Exits Sem {allocation.scheduled_checkout_semester}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        {allocation.status === "active" && (
                          <>
                            <button
                              onClick={() => handleEdit(allocation)}
                              className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-sm"
                              title="Edit Allocation"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCheckout(allocation.id)}
                              className="p-3 bg-warning-50 dark:bg-warning-900/30 text-warning-600 hover:bg-warning-600 hover:text-white rounded-2xl transition-all shadow-sm"
                              title="Check Out"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewHistory(allocation)}
                          className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm"
                          title="View Stay History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(allocation.id)}
                          className="p-3 bg-error-50 dark:bg-error-900/30 text-error-600 hover:bg-error-600 hover:text-white rounded-2xl transition-all shadow-sm"
                          title="Delete Allocation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      No active allocations
                    </h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm italic">
                      You haven't assigned any students to hostel rooms yet.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal - Premium UI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/20 my-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-90" />
              <div className="relative p-10 flex items-center justify-between text-white">
                <div className="flex items-center space-x-5">
                  <div className="p-4 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10">
                    <UserPlus className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-display tracking-tight">
                      {isEditing ? "Edit Allocation" : "Assignment Wizard"}
                    </h2>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="flex items-center text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Multi-Step
                        Check
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setFormData({
                      student_id: "",
                      building_id: "",
                      room_id: "",
                      bed_id: "",
                      mess_fee_structure_id: "",
                      fee_structure_id: "",
                      semester: "",
                      apply_to_future: true,
                    });
                    setSelectedStudent(null);
                    setStudentSearchTerm("");
                  }}
                  className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-[1.5rem] backdrop-blur-md transition-all active:scale-95"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAllocate} className="p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Step 1: Student Selection */}
                <div className="space-y-8">
                  <div className="relative">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-xs">
                        01
                      </div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        Student Information
                      </h4>
                    </div>

                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      Search Student (Name or ID) *
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
                          placeholder="Type to search students..."
                          value={studentSearchTerm}
                          onChange={(e) => {
                            setStudentSearchTerm(e.target.value);
                            setShowStudentResults(true);
                          }}
                          onFocus={() => setShowStudentResults(true)}
                        />
                      </div>

                      {showStudentResults && studentSearchTerm.length >= 2 && (
                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto overflow-x-hidden py-4">
                          {users.length > 0 ? (
                            users.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    student_id: u.id,
                                  });
                                  setSelectedStudent(u);
                                  setStudentSearchTerm(
                                    `${u.first_name} ${u.last_name} (${u.student_id})`,
                                  );
                                  setShowStudentResults(false);
                                }}
                                className="w-full px-8 py-4 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex flex-col"
                              >
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {u.first_name} {u.last_name}
                                </span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                  {u.student_id} • {u.program?.code}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-8 py-4 text-gray-500 text-sm font-bold flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2" /> No
                              matching students...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      Mess Charge Plan
                    </label>
                    <select
                      required
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
                      value={formData.mess_fee_structure_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mess_fee_structure_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Mess Plan</option>
                      {messFeeStructures?.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.mess_type.toUpperCase()}) - ₹{m.amount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      Hostel Fee Structure
                    </label>
                    <select
                      required
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
                      value={formData.fee_structure_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fee_structure_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Fees Plan</option>
                      {feeStructures?.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} - ₹{f.base_amount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                        Join From Semester
                      </label>
                      <select
                        className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
                        value={formData.semester}
                        onChange={(e) =>
                          setFormData({ ...formData, semester: e.target.value })
                        }
                      >
                        <option value="">
                          Current (Sem{" "}
                          {selectedStudent?.current_semester || "1"})
                        </option>
                        <option
                          value={(selectedStudent?.current_semester || 1) + 1}
                        >
                          Next (Sem{" "}
                          {(selectedStudent?.current_semester || 1) + 1})
                        </option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-center">
                      <label className="flex items-center space-x-3 cursor-pointer group mt-6">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.apply_to_future}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                apply_to_future: e.target.checked,
                              })
                            }
                          />
                          <div
                            className={`w-12 h-6 rounded-full transition-all ${formData.apply_to_future ? "bg-primary-600 shadow-lg shadow-primary-600/30" : "bg-gray-300 dark:bg-gray-600"}`}
                          />
                          <div
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.apply_to_future ? "translate-x-6" : ""}`}
                          />
                        </div>
                        <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-primary-600 transition-colors">
                          Apply to future sems
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Step 2: Room Placement */}
                <div className="space-y-8 lg:border-l lg:border-gray-50 lg:dark:border-gray-700 lg:pl-12">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-black text-xs">
                        02
                      </div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        Deployment Details
                      </h4>
                    </div>

                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      Target Building *
                    </label>
                    <select
                      required
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl focus:ring-4 focus:ring-secondary-500/10 transition-all font-bold text-sm shadow-sm"
                      value={formData.building_id}
                      onChange={(e) => handleBuildingChange(e.target.value)}
                    >
                      <option value="">Select Building</option>
                      {buildings?.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      Available Room *
                    </label>
                    <select
                      required
                      disabled={!availableRooms?.length}
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-700 border-none rounded-3xl focus:ring-4 focus:ring-secondary-500/10 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
                      value={formData.room_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          room_id: e.target.value,
                          bed_id: "",
                        })
                      }
                    >
                      <option value="">Select Room</option>
                      {availableRooms?.map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.room_number} ({r.current_occupancy}/
                          {r.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.room_id && (
                    <div className="animate-fade-in">
                      <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">
                        Choose Specific Bed
                      </label>
                      <div className="grid grid-cols-4 gap-4">
                        {availableRooms
                          ?.find((r) => r.id === formData.room_id)
                          ?.beds?.map((bed) => (
                            <button
                              key={bed.id}
                              type="button"
                              disabled={bed.status !== "available"}
                              onClick={() =>
                                setFormData({ ...formData, bed_id: bed.id })
                              }
                              className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] transition-all border-2 relative ${
                                bed.status !== "available"
                                  ? "opacity-30 grayscale cursor-not-allowed"
                                  : formData.bed_id === bed.id
                                    ? "border-primary-500 bg-primary-50 scale-110 shadow-lg z-10"
                                    : "border-gray-100 dark:border-gray-700 hover:border-primary-200"
                              }`}
                            >
                              <Bed
                                className={`w-6 h-6 ${formData.bed_id === bed.id ? "text-primary-600" : "text-gray-400"}`}
                              />
                              <span className="text-[9px] font-bold mt-2 uppercase">
                                {bed.bed_number.split("-B")[1]}
                              </span>
                              {formData.bed_id === bed.id && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-full flex items-center space-x-6 pt-12 mt-12 border-t border-gray-50 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-5 bg-white border-2 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  Cancel Step
                </button>
                <button
                  type="submit"
                  disabled={operationStatus === "loading"}
                  className="flex-1 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center transition-all shadow-2xl shadow-primary-600/40 active:scale-95 disabled:opacity-50"
                >
                  {operationStatus === "loading" ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isEditing ? "Update Allocation" : "Complete Allocation"}{" "}
                      <UserCheck className="w-4 h-4 ml-3" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Configuration Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/20">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-warning-100 dark:bg-warning-900/40 rounded-3xl flex items-center justify-center mx-auto mb-6 text-warning-600">
                <LogOut className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight mb-2">
                Checkout Configuration
              </h3>
              <p className="text-sm text-gray-500 font-medium px-4">
                Verify when the student is officially ending their hostel stay.
              </p>
            </div>

            <div className="px-8 pb-4 space-y-3">
              <button
                type="button"
                onClick={() =>
                  setCheckoutData({ ...checkoutData, type: "current" })
                }
                className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-start space-x-4 ${
                  checkoutData.type === "current"
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${checkoutData.type === "current" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Immediate Checkout
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Student leaves now. Deactivate all fees.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCheckoutData({ ...checkoutData, type: "next" })
                }
                className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-start space-x-4 ${
                  checkoutData.type === "next"
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${checkoutData.type === "next" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    End of Semester
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Stay until sem end. Deactivate future fees.
                  </p>
                </div>
              </button>
            </div>

            <div className="p-8 flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all font-display"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCheckout}
                className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-600/30 transition-all active:scale-95 font-display"
              >
                Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stay History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/20 my-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90" />
              <div className="relative p-10 flex items-center justify-between text-white">
                <div className="flex items-center space-x-5">
                  <div className="p-4 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10">
                    <History className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-display tracking-tight">
                      Stay History
                    </h2>
                    <p className="text-sm font-bold opacity-80 mt-1 uppercase tracking-widest">
                      {selectedHistoryAllocation?.student?.first_name}{" "}
                      {selectedHistoryAllocation?.student?.last_name} (
                      {selectedHistoryAllocation?.student?.student_id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-[1.5rem] backdrop-blur-md transition-all active:scale-95"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {stayHistory?.length > 0 ? (
                  stayHistory.map((log, idx) => (
                    <div
                      key={log.id}
                      className="group p-8 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${
                              log.check_out_date
                                ? "bg-gray-100 text-gray-400"
                                : "bg-success-100 text-success-600 animate-pulse"
                            }`}
                          >
                            #{stayHistory.length - idx}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                Room {log.room?.room_number} • Bed{" "}
                                {log.bed?.bed_number?.split("-B")[1]}
                              </p>
                              {idx === 0 && !log.check_out_date && (
                                <span className="px-3 py-1 bg-success-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-2 space-x-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                              <span className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                {new Date(log.check_in_date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span
                                className={`flex items-center ${!log.check_out_date ? "text-success-600 italic" : ""}`}
                              >
                                {log.check_out_date
                                  ? new Date(
                                      log.check_out_date,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Present"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-700 px-4 py-1.5 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm">
                            {log.academic_year} • Sem {log.semester}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                      No logs found for this student.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-12 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-full py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 text-gray-500 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                Close History View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAllocation;
