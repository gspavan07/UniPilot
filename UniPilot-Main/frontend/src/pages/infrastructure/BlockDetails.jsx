import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchBlockDetails,
  generateRooms,
  addRoom,
  deleteBlock,
  deleteRoom,
  updateBlock,
  updateRoom,
} from "../../store/slices/infrastructureSlice";
import {
  Building,
  ArrowLeft,
  Wand2,
  Plus,
  LayoutGrid,
  Monitor,
  FlaskConical,
  Users,
  Mic2,
  Trash2,
  Settings,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BlockDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBlock: block, status } = useSelector(
    (state) => state.infrastructure,
  );

  const [activeFloor, setActiveFloor] = useState(1);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isEditBlockOpen, setIsEditBlockOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Wizard State
  const [wizardConfig, setWizardConfig] = useState({
    floors_start: 1,
    floors_end: 1,
    rooms_per_floor: 10,
    capacity: 60,
  });

  // New Room State
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    name: "",
    type: "classroom",
    capacity: 30,
  });

  // Edit Block State
  const [editBlockData, setEditBlockData] = useState({
    name: "",
    code: "",
    type: "academic",
  });

  useEffect(() => {
    dispatch(fetchBlockDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (block) {
      setEditBlockData({
        name: block.name,
        code: block.code,
        type: block.type || "academic",
      });
    }
  }, [block]);

  const handleAutoGenerate = async () => {
    await dispatch(generateRooms({ blockId: id, config: wizardConfig }));
    setIsWizardOpen(false);
    dispatch(fetchBlockDetails(id));
    toast.success("Rooms generated successfully!");
  };

  const handleAddRoom = async () => {
    if (!newRoom.room_number) return toast.error("Room Number is required");

    const payload = {
      ...newRoom,
      floor_number: activeFloor,
    };

    try {
      await dispatch(addRoom({ blockId: id, roomData: payload })).unwrap();
      setIsRoomModalOpen(false);
      setNewRoom({
        room_number: "",
        name: "",
        type: "classroom",
        capacity: 30,
      });
      toast.success("Room added successfully");
    } catch (error) {
      toast.error(error || "Failed to add room");
    }
  };

  const handleUpdateBlock = async () => {
    try {
      await dispatch(updateBlock({ id, data: editBlockData })).unwrap();
      setIsEditBlockOpen(false);
      dispatch(fetchBlockDetails(id));
      toast.success("Block updated successfully");
    } catch (error) {
      toast.error(error || "Failed to update block");
    }
  };

  const handleDeleteBlock = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this block? This cannot be undone.",
      )
    ) {
      await dispatch(deleteBlock(id));
      toast.success("Block deleted");
      navigate("/infrastructure");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Delete this room?")) {
      try {
        await dispatch(deleteRoom(roomId)).unwrap();
        toast.success("Room deleted");
      } catch (error) {
        toast.error("Failed to delete room");
      }
    }
  };

  const handleEditRoomClick = (room) => {
    setEditingRoom({ ...room });
  };

  const handleUpdateRoom = async () => {
    try {
      await dispatch(
        updateRoom({ id: editingRoom.id, data: editingRoom }),
      ).unwrap();
      setEditingRoom(null);
      dispatch(fetchBlockDetails(id)); // Refresh to get latest data
      toast.success("Room updated successfully");
    } catch (error) {
      toast.error(error || "Failed to update room");
    }
  };

  if (!block) return <div className="p-6">Loading...</div>;

  // Group rooms by floor
  const roomsByFloor = block.rooms
    ? block.rooms.reduce((acc, room) => {
        const floor = room.floor_number;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(room);
        return acc;
      }, {})
    : {};

  const getRoomIcon = (type) => {
    switch (type) {
      case "lab":
        return <FlaskConical className="w-5 h-5 text-purple-500" />;
      case "seminar_hall":
      case "auditorium":
        return <Mic2 className="w-5 h-5 text-orange-500" />;
      case "staff_room":
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <Monitor className="w-5 h-5 text-blue-500" />; // Classroom default
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/infrastructure")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blocks
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {block.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                  {block.code}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {block.total_floors} Floors • {block.rooms?.length || 0} Rooms
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditBlockOpen(true)}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
              title="Edit Block"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteBlock}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              title="Delete Block"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-xl font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Generate Rooms
            </button>
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>
        </div>
      </div>

      {/* Floor Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: block.total_floors }, (_, i) => i + 1).map(
          (floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeFloor === floor
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Floor {floor}
            </button>
          ),
        )}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {roomsByFloor[activeFloor]?.map((room) => (
          <div
            key={room.id}
            className="group relative bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary-500/30 transition-all cursor-pointer"
          >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditRoomClick(room);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRoom(room.id);
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 items-center mb-3">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-400 group-hover:text-primary-500 transition-colors">
                {getRoomIcon(room.type)}
              </div>
              <span className="text-xs font-mono font-semibold text-gray-400">
                {room.room_number}
              </span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white truncate">
              {room.name || room.room_number}
            </h4>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="capitalize">{room.type.replace("_", " ")}</span>
              <span>{room.capacity} seats</span>
            </div>
          </div>
        ))}

        {/* Add Room Placeholder Card */}
        <button
          onClick={() => setIsRoomModalOpen(true)}
          className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-400 hover:text-primary-600 transition-all min-h-[120px]"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">
            Add Room to Floor {activeFloor}
          </span>
        </button>
      </div>

      {/* Edit Block Modal */}
      {isEditBlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Block Details
              </h2>
              <button
                onClick={() => setIsEditBlockOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Block Name
                </label>
                <input
                  type="text"
                  value={editBlockData.name}
                  onChange={(e) =>
                    setEditBlockData({ ...editBlockData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Block Code
                </label>
                <input
                  type="text"
                  value={editBlockData.code}
                  onChange={(e) =>
                    setEditBlockData({ ...editBlockData, code: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={editBlockData.type}
                  onChange={(e) =>
                    setEditBlockData({ ...editBlockData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  <option value="academic">Academic Block</option>
                  <option value="hostel">Hostel</option>
                  <option value="admin">Administrative</option>
                  <option value="library">Library</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditBlockOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBlock}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add Room to Floor {activeFloor}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={newRoom.room_number}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, room_number: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry Lab"
                  value={newRoom.name}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newRoom.type}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, type: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="seminar_hall">Seminar Hall</option>
                    <option value="staff_room">Staff Room</option>
                    <option value="auditorium">Auditorium</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoom}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit Room {editingRoom.room_number}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={editingRoom.room_number}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      room_number: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Name (Optional)
                </label>
                <input
                  type="text"
                  value={editingRoom.name || ""}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={editingRoom.type}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, type: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="seminar_hall">Seminar Hall</option>
                    <option value="staff_room">Staff Room</option>
                    <option value="auditorium">Auditorium</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={editingRoom.capacity}
                    onChange={(e) =>
                      setEditingRoom({
                        ...editingRoom,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingRoom(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRoom}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Generate Wizard Modal - ... existing code ... */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            {/* ... existing wizard content ... */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Auto-Generate Rooms
                </h2>
                <p className="text-sm text-gray-500">
                  Quickly populate floors with standard rooms.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Floor
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={block.total_floors}
                    value={wizardConfig.floors_start}
                    onChange={(e) =>
                      setWizardConfig({
                        ...wizardConfig,
                        floors_start: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Floor
                  </label>
                  <input
                    type="number"
                    min={wizardConfig.floors_start}
                    max={block.total_floors}
                    value={wizardConfig.floors_end}
                    onChange={(e) =>
                      setWizardConfig({
                        ...wizardConfig,
                        floors_end: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rooms per Floor
                </label>
                <input
                  type="number"
                  min="1"
                  value={wizardConfig.rooms_per_floor}
                  onChange={(e) =>
                    setWizardConfig({
                      ...wizardConfig,
                      rooms_per_floor: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Creates {wizardConfig.rooms_per_floor} rooms on each selected
                  floor.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Capacity (Seats)
                </label>
                <input
                  type="number"
                  min="1"
                  value={wizardConfig.capacity}
                  onChange={(e) =>
                    setWizardConfig({
                      ...wizardConfig,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAutoGenerate}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-medium"
              >
                Generate{" "}
                {(wizardConfig.floors_end - wizardConfig.floors_start + 1) *
                  wizardConfig.rooms_per_floor}{" "}
                Rooms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BlockDetails;
