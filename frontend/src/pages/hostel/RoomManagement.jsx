import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
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
        return "bg-success-100 text-success-700";
      case "occupied":
        return "bg-primary-100 text-primary-700";
      case "full":
        return "bg-warning-100 text-warning-700";
      case "maintenance":
        return "bg-error-100 text-error-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display">
            Room Inventory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure rooms, beds, and manage maintenance status.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRoom(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-600/25 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Quick Add Room
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Filters
          </span>
        </div>

        <select
          className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[180px]"
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
          className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[150px]"
          value={filters.room_type}
          onChange={(e) => handleFilterChange({ room_type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="ac">AC Rooms</option>
          <option value="non_ac">Non-AC Rooms</option>
        </select>

        <select
          className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[150px]"
          value={filters.status}
          onChange={(e) => handleFilterChange({ status: e.target.value })}
        >
          <option value="">Any Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="full">Full</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Room number..."
            className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Room Grid */}
      {status === "loading" ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">
            Scanning inventory...
          </p>
        </div>
      ) : rooms?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card bg-white dark:bg-gray-800 p-6 border border-gray-50 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 group relative"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-4 rounded-3xl ${room.room_type === "ac" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-700"}`}
                >
                  {room.room_type === "ac" ? (
                    <Wind className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Fan className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex space-x-1">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(room.status)}`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {room.building?.name} • Floor {room.floor?.floor_number}
                </p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1 group-hover:text-primary-600 transition-colors">
                  Room {room.room_number}
                </h3>
              </div>

              {/* Capacity Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {room.current_occupancy} / {room.capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      room.current_occupancy / room.capacity > 0.8
                        ? "bg-error-500"
                        : room.current_occupancy / room.capacity > 0.5
                          ? "bg-warning-500"
                          : "bg-success-500"
                    }`}
                    style={{
                      width: `${(room.current_occupancy / room.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center">
                    <BedDouble className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Beds
                    </span>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {room.beds?.length || 0} Total
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-5 border-t border-gray-50 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs font-bold text-gray-500 hover:text-primary-600 flex items-center">
                  <Settings className="w-3.5 h-3.5 mr-1" /> Configure
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-2 text-gray-400 hover:text-error-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No Rooms Inventory
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2 italic text-sm">
            Use the 'Quick Add' button to create a room and automatically
            generate its beds.
          </p>
        </div>
      )}

      {/* Modal - Tailwind UI Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/20">
            <div className="px-10 py-8 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black font-display tracking-tight">
                  {editingRoom ? "Update Room" : "Add New Room"}
                </h2>
                <p className="text-primary-100 text-sm mt-1 opacity-80 uppercase tracking-widest font-bold text-[10px]">
                  Infrastructure Detail
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all active:scale-95"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                    Select Building *
                  </label>
                  <select
                    required
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
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
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                    Select Floor *
                  </label>
                  <select
                    required
                    disabled={!formData.building_id}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
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
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                    Room Number *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 101, B-202"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                    Capacity (Beds) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-sm shadow-sm"
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
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                    Climate Control
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, room_type: "ac" })
                      }
                      className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center transition-all ${
                        formData.room_type === "ac"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <Wind className="w-4 h-4 mr-2" /> AC Room
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, room_type: "non_ac" })
                      }
                      className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center transition-all ${
                        formData.room_type === "non_ac"
                          ? "bg-gray-800 text-white shadow-lg"
                          : "bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <Fan className="w-4 h-4 mr-2" /> Non-AC
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    Core Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["wifi", "fan", "cupboard", "study_table"].map(
                      (amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              amenities: {
                                ...formData.amenities,
                                [amenity]: !formData.amenities[amenity],
                              },
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                            formData.amenities[amenity]
                              ? "bg-primary-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                          }`}
                        >
                          {amenity.replace("_", " ")}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-full flex items-center space-x-4 pt-6 mt-4 border-t border-gray-50 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={operationStatus === "loading"}
                  className="flex-[2] px-8 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all shadow-xl shadow-primary-600/30 active:scale-95 disabled:opacity-50"
                >
                  {operationStatus === "loading" ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : editingRoom ? (
                    "Commit Changes"
                  ) : (
                    "Initialize Room"
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

export default RoomManagement;
