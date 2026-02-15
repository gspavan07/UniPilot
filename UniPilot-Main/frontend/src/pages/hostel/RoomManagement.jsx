import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Home,
  Plus,
  Search,
  Building,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Loader2,
  Settings,
  MoreVertical,
  Filter,
  Users,
  BedDouble,
  Wind,
  Fan,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import {
  fetchRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  fetchBuildings,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const RoomManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rooms, buildings, status, operationStatus, operationError } =
    useSelector((state) => state.hostel);

  const initialBuildingId = searchParams.get("building_id") || "";
  const initialFloorId = searchParams.get("floor_id") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filters, setFilters] = useState({
    building_id: initialBuildingId,
    floor_id: initialFloorId,
    room_type: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    building_id: "",
    floor_id: "",
    room_number: "",
    capacity: 4,
    room_type: "non_ac",
    amenities: { wifi: true, fan: true, cupboard: true },
    status: "available",
  });

  useEffect(() => {
    dispatch(fetchBuildings());
    dispatch(fetchRooms(filters));
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(editingRoom ? "Room updated!" : "Room created with beds!");
      setIsModalOpen(false);
      setEditingRoom(null);
      dispatch(fetchRooms(filters)); // Refresh with current filters
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, editingRoom, operationError, filters]);

  const selectedBuilding = buildings?.find(
    (b) => b.id === formData.building_id,
  );
  const floors = selectedBuilding?.floors || [];

  const handleBuildingChange = (id) => {
    setFilters({ ...filters, building_id: id, floor_id: "" });
    dispatch(fetchRooms({ ...filters, building_id: id, floor_id: "" }));
  };

  const handleFilterChange = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    dispatch(fetchRooms(updated));
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      building_id: room.building_id,
      floor_id: room.floor_id,
      room_number: room.room_number,
      capacity: room.capacity,
      room_type: room.room_type,
      amenities: room.amenities || { wifi: true, fan: true, cupboard: true },
      status: room.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this room? This will also remove associated beds.",
      )
    ) {
      dispatch(deleteRoom(id)).then(() => {
        dispatch(fetchRooms(filters));
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      dispatch(updateRoom({ id: editingRoom.id, data: formData }));
    } else {
      dispatch(createRoom(formData));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200";
      case "occupied":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "full":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "maintenance":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

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
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Room Inventory
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-14">
              Manage hostel rooms, capacity, and maintenance status.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRoom(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Room
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100/50 rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Filters
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 w-full lg:w-auto">
            <select
              className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[200px]"
              value={filters.building_id}
              onChange={(e) => handleBuildingChange(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[160px]"
              value={filters.room_type}
              onChange={(e) => handleFilterChange({ room_type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="ac">AC Rooms</option>
              <option value="non_ac">Non-AC Rooms</option>
            </select>

            <select
              className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[160px]"
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
            >
              <option value="">Any Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by room number..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Room Grid */}
        {status === "loading" ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              Loading inventory...
            </p>
          </div>
        ) : rooms?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 relative overflow-hidden"
              >
                {/* Top Banner */}
                <div className="h-1 bg-gray-100 group-hover:bg-blue-600 transition-colors"></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${room.room_type === 'ac' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                        {room.room_type === "ac" ? <Wind className="w-5 h-5" /> : <Fan className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-500 uppercase">
                          {room.building?.name}
                        </span>
                        <span className="block text-xs font-medium text-gray-400">
                          Floor {room.floor?.floor_number}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                      {room.room_number}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {room.room_type === "ac" ? "Air Conditioned" : "Non-AC Standard"}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(room.amenities || {}).filter(([_, v]) => v).slice(0, 3).map(([key]) => (
                      <span key={key} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase border border-gray-200 rounded">
                        {key}
                      </span>
                    ))}
                    {(Object.keys(room.amenities || {}).filter(k => room.amenities[k]).length > 3) && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold border border-gray-200 rounded">
                        +{Object.keys(room.amenities || {}).filter(k => room.amenities[k]).length - 3}
                      </span>
                    )}
                  </div>

                  {/* Occupancy Bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Occupancy</span>
                      <span>{room.current_occupancy} / {room.capacity}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${room.current_occupancy / room.capacity >= 1
                          ? "bg-red-500"
                          : room.current_occupancy / room.capacity >= 0.75
                            ? "bg-orange-500"
                            : "bg-green-500"
                          }`}
                        style={{ width: `${(room.current_occupancy / room.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" />
                      {room.beds?.length || 0} Beds
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Room"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Rooms Found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm text-center">
              No rooms match your current filters. Try changing filters or add a new room.
            </p>
            <button
              onClick={() => {
                setEditingRoom(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Add First Room
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {editingRoom ? "Edit Room Details" : "Add New Room"}
                  </h2>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">
                    Room Infrastructure Management
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Building
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                      value={formData.building_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          building_id: e.target.value,
                          floor_id: "",
                        })
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
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Floor
                    </label>
                    <select
                      required
                      disabled={!formData.building_id}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all disabled:opacity-50 disabled:bg-gray-50"
                      value={formData.floor_id}
                      onChange={(e) =>
                        setFormData({ ...formData, floor_id: e.target.value })
                      }
                    >
                      <option value="">Select Floor</option>
                      {floors?.map((f) => (
                        <option key={f.id} value={f.id}>
                          Floor {f.floor_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Room Number
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 101, A-202"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all placeholder:text-gray-400"
                      value={formData.room_number}
                      onChange={(e) =>
                        setFormData({ ...formData, room_number: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Capacity
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, room_type: "ac" })
                        }
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${formData.room_type === "ac"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        <Wind className="w-4 h-4" /> AC
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, room_type: "non_ac" })
                        }
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${formData.room_type === "non_ac"
                          ? "bg-gray-100 border-gray-300 text-gray-900"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        <Fan className="w-4 h-4" /> Non-AC
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Amenities
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["wifi", "fan", "cupboard", "study_table"].map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              amenities: {
                                ...formData.amenities,
                                [amenity]: !formData.amenities?.[amenity]
                              }
                            })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${formData.amenities?.[amenity]
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                        >
                          {amenity.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex gap-3 pt-6 mt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="flex-[2] px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:shadow-none"
                  >
                    {operationStatus === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      editingRoom ? "Save Changes" : "Create Room"
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

export default RoomManagement;
