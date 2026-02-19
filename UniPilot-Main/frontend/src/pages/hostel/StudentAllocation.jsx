import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  LayoutGrid,
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
  const navigate = useNavigate();
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

  // Reset room selection if fee structure changes and type mismatch occurs
  useEffect(() => {
    if (formData.fee_structure_id && formData.room_id) {
      const selectedFee = feeStructures.find(
        (f) => f.id === formData.fee_structure_id,
      );
      const selectedRoom = availableRooms.find(
        (r) => r.id === formData.room_id,
      );

      if (
        selectedFee &&
        selectedRoom &&
        selectedRoom.room_type !== selectedFee.room_type
      ) {
        setFormData((prev) => ({ ...prev, room_id: "", bed_id: "" }));
      }
    }
  }, [formData.fee_structure_id, feeStructures, availableRooms]);

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

  const selectedFeeStructureForFilter = feeStructures.find(
    (f) => f.id === formData.fee_structure_id,
  );
  const targetRoomType = selectedFeeStructureForFilter?.room_type;

  const filteredAvailableRooms = availableRooms.filter(
    (r) => !targetRoomType || r.room_type === targetRoomType,
  );

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
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Student Allocation
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-14">
              Assign and manage student room placements efficiently.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Assign New Student
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100/50 rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Filter List
            </span>
          </div>

          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Room Placement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Plan & Fees
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
                {status === "loading" ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-sm">
                        Loading records...
                      </p>
                    </td>
                  </tr>
                ) : filteredAllocations.length > 0 ? (
                  filteredAllocations.map((allocation) => (
                    <tr
                      key={allocation.id}
                      className="group hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mr-3 border border-blue-200">
                            {allocation.student?.first_name?.[0] || "U"}
                            {allocation.student?.last_name?.[0] || ""}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {allocation.student?.first_name}{" "}
                              {allocation.student?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              ID:{" "}
                              <span className="font-mono">
                                {allocation.student?.student_id || "N/A"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            Room {allocation.room?.room_number}
                          </span>
                          <span className="text-xs text-gray-500 font-medium pl-6">
                            {allocation.room?.building?.name || "Unknown Block"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                            {allocation.mess_fee_structure?.mess_type ||
                              "Standard"}{" "}
                            Mess
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {allocation.fee_structure?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase w-fit border ${allocation.status === "active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                          >
                            {allocation.status === "active" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            {allocation.status}
                          </span>
                          {allocation.scheduled_checkout_semester && (
                            <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 w-fit">
                              Checkout Sem{" "}
                              {allocation.scheduled_checkout_semester}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {allocation.status === "active" && (
                            <>
                              <button
                                onClick={() => handleEdit(allocation)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCheckout(allocation.id)}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-100"
                                title="Check Out"
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewHistory(allocation)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            title="History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(allocation.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <Users className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        No active allocations
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Use the "Assign New Student" button to get started.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assignment Modal - Clean Corporate UI */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
              <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {isEditing ? "Modify Allocation" : "New Student Assignment"}
                  </h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
                    Multi-Step Allocation Wizard
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-8 bg-gray-50/50 flex-1">
                <form
                  id="allocationForm"
                  onSubmit={handleAllocate}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* Left Column: Student & Plans */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 uppercase">
                          Student Info
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                            Search Student
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Name or ID..."
                              value={studentSearchTerm}
                              onChange={(e) => {
                                setStudentSearchTerm(e.target.value);
                                setShowStudentResults(true);
                              }}
                              onFocus={() => setShowStudentResults(true)}
                            />
                            {showStudentResults &&
                              studentSearchTerm.length >= 2 && (
                                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
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
                                            `${u.first_name} ${u.last_name}`,
                                          );
                                          setShowStudentResults(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0"
                                      >
                                        <p className="text-sm font-bold text-gray-900">
                                          {u.first_name} {u.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {u.student_id}
                                        </p>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="p-4 text-sm text-gray-500 text-center">
                                      No students found
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                            Mess Plan
                          </label>
                          <select
                            required
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                            value={formData.mess_fee_structure_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mess_fee_structure_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Plan</option>
                            {messFeeStructures?.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} - ₹{m.amount}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                            Fee Structure
                          </label>
                          <select
                            required
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                            value={formData.fee_structure_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fee_structure_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Structure</option>
                            {feeStructures?.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} - ₹{f.base_amount}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                              Join Sem
                            </label>
                            <select
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                              value={formData.semester}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  semester: e.target.value,
                                })
                              }
                            >
                              <option value="">
                                Current (
                                {selectedStudent?.current_semester || "1"})
                              </option>
                              <option
                                value={
                                  (selectedStudent?.current_semester || 1) + 1
                                }
                              >
                                Next (
                                {(selectedStudent?.current_semester || 1) + 1})
                              </option>
                            </select>
                          </div>
                          <div className="flex items-center h-full pt-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={formData.apply_to_future}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    apply_to_future: e.target.checked,
                                  })
                                }
                              />
                              <span className="text-xs font-bold text-gray-600">
                                Apply Future
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Room Details */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 uppercase">
                          Room Allocation
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                            Building
                          </label>
                          <select
                            required
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                            value={formData.building_id}
                            onChange={(e) =>
                              handleBuildingChange(e.target.value)
                            }
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
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                            Available Room{" "}
                            {targetRoomType && (
                              <span className="text-blue-600 ml-1">
                                (
                                {targetRoomType.replace("_", " ").toUpperCase()}
                                )
                              </span>
                            )}
                          </label>
                          <select
                            required
                            disabled={!filteredAvailableRooms?.length}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
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
                            {filteredAvailableRooms?.map((r) => (
                              <option key={r.id} value={r.id}>
                                Room {r.room_number} ({r.current_occupancy}/
                                {r.capacity})
                              </option>
                            ))}
                          </select>
                          {!filteredAvailableRooms?.length &&
                            availableRooms?.length > 0 && (
                              <p className="text-[10px] text-orange-600 font-bold mt-1">
                                No {targetRoomType?.replace("_", " ")} rooms
                                available in this building.
                              </p>
                            )}
                        </div>

                        {formData.room_id && (
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                              Select Bed
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                              {availableRooms
                                ?.find((r) => r.id === formData.room_id)
                                ?.beds?.map((bed) => (
                                  <button
                                    key={bed.id}
                                    type="button"
                                    disabled={bed.status !== "available"}
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        bed_id: bed.id,
                                      })
                                    }
                                    className={`p-3 rounded-lg border text-center transition-all ${formData.bed_id === bed.id
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200"
                                        : bed.status !== "available"
                                          ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                          : "bg-white border-gray-200 hover:border-blue-400 text-gray-700"
                                      }`}
                                  >
                                    <Bed className="w-5 h-5 mx-auto mb-1" />
                                    <span className="text-[10px] font-bold block">
                                      {bed.bed_number.split("-B")[1]}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  form="allocationForm"
                  type="submit"
                  disabled={operationStatus === "loading"}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-500/30 disabled:opacity-70"
                >
                  {operationStatus === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Confirm Allocation"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="p-6 text-center border-b border-gray-50">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                  <LogOut className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  Confirm Checkout
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select checkout type for the student
                </p>
              </div>

              <div className="p-6 space-y-3 bg-gray-50/50">
                <button
                  onClick={() =>
                    setCheckoutData({ ...checkoutData, type: "current" })
                  }
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${checkoutData.type === "current"
                      ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500"
                      : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">
                      Immediate Checkout
                    </p>
                    <p className="text-xs text-gray-500">
                      End stay and stop billing now
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setCheckoutData({ ...checkoutData, type: "next" })
                  }
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${checkoutData.type === "next"
                      ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500"
                      : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">
                      End of Semester
                    </p>
                    <p className="text-xs text-gray-500">
                      Schedule checkout for sem end
                    </p>
                  </div>
                </button>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckout}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black shadow-lg"
                >
                  Process
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">
                      Stay History
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {selectedHistoryAllocation?.student?.first_name}{" "}
                      {selectedHistoryAllocation?.student?.last_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 bg-gray-50 max-h-[60vh] overflow-y-auto">
                {stayHistory?.length > 0 ? (
                  <div className="space-y-4">
                    {stayHistory.map((log, idx) => (
                      <div
                        key={log.id}
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${!log.check_out_date ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                          >
                            {stayHistory.length - idx}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              Room {log.room?.room_number}{" "}
                              <span className="text-gray-400 font-normal mx-1">
                                •
                              </span>{" "}
                              Sem {log.semester}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(log.check_in_date).toLocaleDateString()}{" "}
                              —{" "}
                              {log.check_out_date ? (
                                new Date(
                                  log.check_out_date,
                                ).toLocaleDateString()
                              ) : (
                                <span className="text-green-600 font-bold">
                                  Present
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-md">
                          {log.academic_year}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No history records found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAllocation;
