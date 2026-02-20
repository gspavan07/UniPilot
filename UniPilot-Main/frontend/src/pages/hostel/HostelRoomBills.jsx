import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Loader2,
  X,
  Download,
  Upload,
  Building,
  Home,
  Users,
  Calendar,
  History,
  ArrowLeft,
  MoreHorizontal,
  CreditCard,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  fetchRoomsForBilling,
  fetchBuildings,
  bulkCreateBills,
  downloadBillingTemplate,
  createRoomBill,
  updateRoomBill,
  deleteRoomBill,
  fetchRoomHistory,
  distributeRoomBill,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const HostelRoomBills = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    buildings,
    roomsForBilling,
    roomBills,
    status,
    operationStatus,
    operationError,
  } = useSelector((state) => state.hostel);

  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  // Modals
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEditBillModal, setShowEditBillModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  // Import state
  const [csvFile, setCsvFile] = useState(null);
  const [parsedBills, setParsedBills] = useState([]);
  const [importErrors, setImportErrors] = useState([]);

  // Form state for individual bill
  const [formData, setFormData] = useState({
    bill_type: "electricity",
    total_amount: "",
    billing_month: new Date().getMonth() + 1,
    billing_year: new Date().getFullYear(),
    description: "",
  });

  // Import month/year state
  const [importMonth, setImportMonth] = useState(new Date().getMonth() + 1);
  const [importYear, setImportYear] = useState(new Date().getFullYear());
  const [importBillType, setImportBillType] = useState("electricity");

  useEffect(() => {
    dispatch(fetchRoomsForBilling());
    dispatch(fetchBuildings());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Operation completed successfully");
      setShowAddBillModal(false);
      setShowImportModal(false);
      setShowEditBillModal(false);
      resetForm();
      dispatch(resetOperationStatus());
      dispatch(fetchRoomsForBilling());
      if (selectedRoom) {
        dispatch(fetchRoomHistory(selectedRoom.id));
      }
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch]);

  const resetForm = () => {
    setFormData({
      bill_type: "electricity",
      total_amount: "",
      billing_month: new Date().getMonth() + 1,
      billing_year: new Date().getFullYear(),
      description: "",
      due_date: "",
    });
    setSelectedRoom(null);
    setCsvFile(null);
    setParsedBills([]);
    setImportErrors([]);
  };

  const handleDownloadTemplate = () => {
    dispatch(
      downloadBillingTemplate({
        building_id: buildingFilter || undefined,
        floor_id: floorFilter || undefined,
      }),
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      const bills = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(",");
        const bill = {};

        headers.forEach((header, index) => {
          bill[header.trim()] = values[index]?.trim();
        });

        // Validation
        if (!bill.room_id) {
          errors.push({ row: i + 1, error: "Missing room_id" });
          continue;
        }
        if (!bill.amount || isNaN(parseFloat(bill.amount))) {
          errors.push({ row: i + 1, error: "Invalid amount" });
          continue;
        }

        bills.push({
          room_id: bill.room_id,
          bill_type: importBillType,
          total_amount: parseFloat(bill.amount),
          billing_month: importMonth,
          billing_year: importYear,
          description: bill.description || "",
        });
      }

      setParsedBills(bills);
      setImportErrors(errors);
    };

    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (parsedBills.length === 0) {
      toast.error("No valid bills to import");
      return;
    }

    await dispatch(bulkCreateBills(parsedBills));
  };

  const handleAddBill = (room) => {
    setSelectedRoom(room);
    setShowAddBillModal(true);
  };

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    await dispatch(
      createRoomBill({
        room_id: selectedRoom.id,
        ...formData,
      }),
    );
  };

  const handleShowHistory = (room) => {
    setSelectedRoom(room);
    dispatch(fetchRoomHistory(room.id));
    setShowHistoryModal(true);
  };

  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setFormData({
      bill_type: bill.bill_type,
      total_amount: bill.total_amount,
      billing_month: bill.billing_month,
      billing_year: bill.billing_year,
      description: bill.description || "",
      due_date: bill.due_date ? bill.due_date.split("T")[0] : "",
    });
    setShowEditBillModal(true);
  };

  const handleUpdateBill = async (e) => {
    e.preventDefault();
    await dispatch(
      updateRoomBill({
        id: selectedBill.id,
        data: formData,
      }),
    );
  };

  const handleDeleteBill = async (billId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this bill? This will also remove associated student fee charges if unpaid.",
      )
    ) {
      await dispatch(deleteRoomBill(billId));
    }
  };

  const handleDistributeBill = async (billId) => {
    if (window.confirm("Distribute this bill to all room occupants?")) {
      await dispatch(distributeRoomBill(billId));
    }
  };

  // Get unique floors from filtered building
  const availableFloors = buildingFilter
    ? [
      ...new Set(
        roomsForBilling
          .filter((r) => r.building?.id === buildingFilter)
          .map((r) => r.floor?.id)
          .filter(Boolean),
      ),
    ]
    : [];

  // Filter rooms
  const filteredRooms = roomsForBilling.filter((room) => {
    const matchesSearch = room.room_number
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBuilding =
      !buildingFilter || room.building?.id === buildingFilter;
    const matchesFloor = !floorFilter || room.floor?.id === floorFilter;
    return matchesSearch && matchesBuilding && matchesFloor;
  });

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1] || "N/A";
  };

  const getBillIcon = (type) => {
    switch (type) {
      case "electricity":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "water":
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case "internet":
        return <Wifi className="w-5 h-5 text-cyan-500" />;
      case "maintenance":
        return <Wrench className="w-5 h-5 text-gray-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-purple-500" />;
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20 font-sans text-gray-900 selection:bg-blue-100">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <button
              onClick={() => navigate(-1)}
              className="mt-1.5 p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Room Billing
              </h1>
              <p className="text-gray-500 font-medium text-lg">
                Manage utility charges and track payments.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Template</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import Bills</span>
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Rooms",
              value: roomsForBilling.length,
              icon: Home,
              bg: "bg-blue-50",
              text: "text-blue-600",
              border: "border-blue-100",
            },
            {
              label: "Occupied Rooms",
              value: roomsForBilling.filter((r) => r.current_occupancy > 0)
                .length,
              icon: Users,
              bg: "bg-emerald-50",
              text: "text-emerald-600",
              border: "border-emerald-100",
            },
            {
              label: "Filtered View",
              value: filteredRooms.length,
              icon: Filter,
              bg: "bg-indigo-50",
              text: "text-indigo-600",
              border: "border-indigo-100",
            },
            {
              label: "Total Capacity",
              value: roomsForBilling.reduce((sum, r) => sum + r.capacity, 0),
              icon: Building,
              bg: "bg-purple-50",
              text: "text-purple-600",
              border: "border-purple-100",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-50 transition-all text-gray-900 font-semibold placeholder:text-gray-400"
            />
          </div>
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex gap-2 w-full md:w-auto p-1">
            <div className="relative min-w-[200px]">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={buildingFilter}
                onChange={(e) => {
                  setBuildingFilter(e.target.value);
                  setFloorFilter("");
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100 border-none rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                disabled={!buildingFilter}
                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100 border-none rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">All Floors</option>
                {availableFloors.map((fid) => {
                  const floor = roomsForBilling.find(
                    (r) => r.floor?.id === fid,
                  )?.floor;
                  return (
                    <option key={fid} value={fid}>
                      Floor {floor?.floor_number}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Room Details
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Last Billing
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-32 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Home className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        No rooms found
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Try adjusting your filters or search terms
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="group hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {room.room_number.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">
                              Room {room.room_number}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`w-2 h-2 rounded-full ${room.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                              ></span>
                              <span className="text-xs font-medium text-gray-500 capitalize">
                                {room.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-gray-400" />
                            {room.building?.name}
                          </p>
                          <p className="text-xs font-medium text-gray-500 pl-5.5">
                            Floor {room.floor?.floor_number}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${room.current_occupancy >= room.capacity ? "bg-red-500" : "bg-blue-500"}`}
                              style={{
                                width: `${(room.current_occupancy / room.capacity) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {room.current_occupancy}/{room.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {room.last_bill_date ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">
                              {new Date(
                                room.last_bill_date,
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide mt-0.5">
                              {room.last_bill_type}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No history
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                          <button
                            onClick={() => handleShowHistory(room)}
                            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all"
                            title="View History"
                          >
                            <History className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAddBill(room)}
                            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 hover:shadow-gray-300 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Bill
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

        {/* MODALS */}

        {/* ADD BILL MODAL */}
        {showAddBillModal && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    New Bill
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {selectedRoom.building?.name} • Room{" "}
                    {selectedRoom.room_number}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddBillModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={handleSubmitBill}
                className="p-8 space-y-6 overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Type
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.bill_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bill_type: e.target.value,
                          })
                        }
                        className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl appearance-none font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
                      >
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="internet">Internet</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="other">Other</option>
                      </select>
                      <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.total_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_amount: e.target.value,
                        })
                      }
                      className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:font-normal"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Month
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.billing_month}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            billing_month: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl appearance-none font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                          <option key={m} value={m}>
                            {getMonthName(m)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Year
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.billing_year}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            billing_year: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl appearance-none font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
                      >
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() - 1 + i,
                        ).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Note
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none resize-none transition-all"
                    placeholder="Add any details about this bill..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBillModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {operationStatus === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Generate Bill"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IMPORT MODAL */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    Bulk Import
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    Upload CSV to generate multiple bills
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 bg-white">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-5">
                    <Zap className="w-4 h-4 text-blue-600" /> Global Settings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Type
                      </label>
                      <select
                        value={importBillType}
                        onChange={(e) => setImportBillType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="internet">Internet</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Month
                        </label>
                        <select
                          value={importMonth}
                          onChange={(e) =>
                            setImportMonth(parseInt(e.target.value))
                          }
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <option key={m} value={m}>
                              {getMonthName(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Year
                        </label>
                        <select
                          value={importYear}
                          onChange={(e) =>
                            setImportYear(parseInt(e.target.value))
                          }
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                          {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - 1 + i,
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="inline-flex p-4 bg-gray-50 group-hover:bg-white rounded-full mb-4 transition-colors shadow-sm">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {csvFile ? csvFile.name : "Click to Upload CSV"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    or drag and drop file here
                  </p>
                </div>

                {parsedBills.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex justify-between items-center">
                      <span>Preview Data</span>
                      <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold">
                        {parsedBills.length} items
                      </span>
                    </h4>
                    <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 sticky top-0 font-bold text-gray-600">
                          <tr>
                            <th className="px-4 py-3">Room ID</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {parsedBills.slice(0, 50).map((b, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2.5 text-gray-900 font-bold">
                                {b.room_id}
                              </td>
                              <td className="px-4 py-2.5 text-gray-900">
                                ₹{b.total_amount}
                              </td>
                              <td className="px-4 py-2.5 text-gray-500 truncate max-w-[150px]">
                                {b.description || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {importErrors.length > 0 && (
                  <div className="bg-red-50 text-red-700 p-5 rounded-2xl text-sm border border-red-100">
                    <div className="flex items-center gap-2 font-bold mb-2">
                      <AlertCircle className="w-5 h-5" /> Validation Errors
                    </div>
                    <ul className="list-disc pl-5 space-y-1 opacity-80">
                      {importErrors.slice(0, 5).map((e, i) => (
                        <li key={i}>
                          Row {e.row}: {e.error}
                        </li>
                      ))}
                      {importErrors.length > 5 && (
                        <li>...and {importErrors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={
                    !parsedBills.length || operationStatus === "loading"
                  }
                  className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
                >
                  {operationStatus === "loading"
                    ? "Processing..."
                    : "Import Bills"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY MODAL */}
        {showHistoryModal && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    Billing History
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Room {selectedRoom.room_number},{" "}
                    {selectedRoom.building?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedRoom(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                {status === "loading" ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  </div>
                ) : roomBills.length === 0 ? (
                  <div className="text-center py-24">
                    <FileText className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                    <h4 className="text-xl font-bold text-gray-900">
                      No records found
                    </h4>
                    <p className="text-gray-400 mt-2">
                      This room has no billing history yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roomBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                          <div className="p-4 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {getBillIcon(bill.bill_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-gray-900 capitalize text-lg">
                                {bill.bill_type} Bill
                              </h4>
                              {bill.status === "distributed" && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                              {getMonthName(bill.billing_month)}{" "}
                              {bill.billing_year}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">
                              ₹{bill.total_amount}
                            </p>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${bill.status === "distributed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {bill.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {bill.status === "pending" && (
                              <button
                                onClick={() => handleDistributeBill(bill.id)}
                                className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors"
                                title="Distribute"
                              >
                                Distribute
                              </button>
                            )}
                            <div className="h-8 w-px bg-gray-100 mx-2"></div>
                            <button
                              onClick={() => handleEditBill(bill)}
                              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                              <Wrench className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill.id)}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT BILL MODAL */}
        {showEditBillModal && selectedBill && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    Edit Bill
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {selectedBill.bill_type} •{" "}
                    {getMonthName(selectedBill.billing_month)}{" "}
                    {selectedBill.billing_year}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditBillModal(false);
                    setSelectedBill(null);
                  }}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateBill} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, total_amount: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 border border-transparent hover:bg-white hover:border-blue-200 rounded-2xl font-bold text-xl text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                  {selectedBill.status === "distributed" && (
                    <p className="text-xs text-amber-600 font-bold flex items-center gap-1.5 bg-amber-50 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4" /> Updates will reflect
                      on student fees automatically.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Month
                    </label>
                    <div className="relative">
                      <select
                        value={formData.billing_month}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            billing_month: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl appearance-none font-bold text-gray-900 focus:border-blue-500 focus:bg-white outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                          <option key={m} value={m}>
                            {getMonthName(m)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Year
                    </label>
                    <div className="relative">
                      <select
                        value={formData.billing_year}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            billing_year: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl appearance-none font-bold text-gray-900 focus:border-blue-500 focus:bg-white outline-none"
                      >
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() - 1 + i,
                        ).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Note
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3.5 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl font-medium text-gray-900 focus:border-blue-500 focus:bg-white outline-none resize-none transition-all"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditBillModal(false);
                      setSelectedBill(null);
                    }}
                    className="flex-1 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
                  >
                    Save Changes
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

export default HostelRoomBills;
