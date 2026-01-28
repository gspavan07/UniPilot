import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Plus,
  Search,
  AlertCircle,
  Filter,
  Loader2,
  X,
  Download,
  Upload,
  CheckCircle2,
  Building,
  Home,
  Users,
  Calendar,
  History,
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Room Billing Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage utility bills for all hostel rooms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Import Bills
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {roomsForBilling.length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-800">Filtered Rooms</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {filteredRooms.length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-800">Occupied Rooms</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {roomsForBilling.filter((r) => r.current_occupancy > 0).length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <p className="text-sm text-purple-800">Total Capacity</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {roomsForBilling.reduce((sum, r) => sum + r.capacity, 0)}
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
              placeholder="Search by room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Building Filter */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                setFloorFilter(""); // Reset floor when building changes
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Buildings</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              disabled={!buildingFilter}
            >
              <option value="">All Floors</option>
              {availableFloors.map((floorId) => {
                const floor = roomsForBilling.find(
                  (r) => r.floor?.id === floorId,
                )?.floor;
                return (
                  <option key={floorId} value={floorId}>
                    Floor {floor?.floor_number}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Bill
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No rooms found</p>
                    <p className="text-sm mt-1">
                      {searchTerm || buildingFilter || floorFilter
                        ? "Try adjusting your filters"
                        : "No rooms available for billing"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Home className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Room {room.room_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {room.status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.building?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Floor {room.floor?.floor_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {room.current_occupancy} / {room.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.last_bill_date ? (
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(room.last_bill_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {room.last_bill_type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No bills yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleShowHistory(room)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                          History
                        </button>
                        <button
                          onClick={() => handleAddBill(room)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Add Bill Modal */}
      {showAddBillModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Add Bill for Room {selectedRoom.room_number}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRoom.building?.name} - Floor{" "}
                  {selectedRoom.floor?.floor_number}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddBillModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitBill} className="p-6 space-y-4">
              {/* Bill Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bill_type}
                  onChange={(e) =>
                    setFormData({ ...formData, bill_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="internet">Internet</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, total_amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Billing Month & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.billing_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_month: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.billing_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_year: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - 1 + i,
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional details..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBillModal(false);
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Create Bill
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Import Bills from CSV
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a CSV file with bill information
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Billing Month & Year */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  Billing Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill Type
                    </label>
                    <select
                      value={importBillType}
                      onChange={(e) => setImportBillType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="electricity">Electricity</option>
                      <option value="water">Water</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="internet">Internet</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={importMonth}
                      onChange={(e) => setImportMonth(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={importYear}
                      onChange={(e) => setImportYear(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - 1 + i,
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  These values will be applied to all bills in the CSV
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Download the template first, fill in the amounts, then upload
                  it here
                </p>
              </div>

              {/* Preview */}
              {parsedBills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Preview ({parsedBills.length} bills)
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {parsedBills.slice(0, 10).map((bill, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          Room{" "}
                          {roomsForBilling.find((r) => r.id === bill.room_id)
                            ?.room_number || bill.room_id}{" "}
                          - ₹{bill.total_amount} ({bill.bill_type})
                        </li>
                      ))}
                      {parsedBills.length > 10 && (
                        <li className="text-sm text-gray-500">
                          ... and {parsedBills.length - 10} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">
                    Errors ({importErrors.length})
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {importErrors.map((err, index) => (
                        <li key={index} className="text-sm text-red-700">
                          Row {err.row}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={
                    parsedBills.length === 0 || operationStatus === "loading"
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {operationStatus === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {parsedBills.length} Bills
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Billing History: Room {selectedRoom.room_number}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRoom.building?.name} - Floor{" "}
                  {selectedRoom.floor?.floor_number}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedRoom(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {status === "loading" ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : roomBills.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">
                    No billing history found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Period
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {roomBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {bill.bill_type}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {getMonthName(bill.billing_month)}{" "}
                            {bill.billing_year}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            ₹{bill.total_amount}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                bill.status === "distributed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              {bill.status === "pending" && (
                                <button
                                  onClick={() => handleDistributeBill(bill.id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                  title="Distribute to students"
                                >
                                  Distribute
                                </button>
                              )}
                              <button
                                onClick={() => handleEditBill(bill)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBill(bill.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedRoom(null);
                }}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Room Bill
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Updating {selectedBill.bill_type} bill for{" "}
                  {getMonthName(selectedBill.billing_month)}{" "}
                  {selectedBill.billing_year}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditBillModal(false);
                  setSelectedBill(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateBill} className="p-6 space-y-4">
              {/* Bill Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bill_type}
                  onChange={(e) =>
                    setFormData({ ...formData, bill_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="internet">Internet</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, total_amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedBill.status === "distributed" && (
                  <p className="text-xs text-amber-600 mt-1">
                    Note: Changing the amount will automatically update shared
                    charges for all occupants.
                  </p>
                )}
              </div>

              {/* Billing Month & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.billing_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_month: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {getMonthName(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.billing_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_year: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - 1 + i,
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBillModal(false);
                    setSelectedBill(null);
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Save Changes
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

export default HostelRoomBills;
