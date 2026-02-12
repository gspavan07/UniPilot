import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building,
  Plus,
  Search,
  MoreVertical,
  Layers,
  MapPin,
  Trash2,
  Edit,
  ArrowRight,
  Loader2,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  fetchBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const BuildingManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { buildings, status, operationStatus, operationError } = useSelector(
    (state) => state.hostel,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "boys",
    address: "",
    total_floors: 0,
    status: "active",
  });

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        editingBuilding ? "Building updated!" : "Building created!",
      );
      setIsModalOpen(false);
      setEditingBuilding(null);
      setFormData({
        name: "",
        type: "boys",
        address: "",
        total_floors: 0,
        status: "active",
      });
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, editingBuilding, operationError]);

  const handleEdit = (building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      type: building.type,
      address: building.address || "",
      total_floors: building.total_floors,
      status: building.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this building? This will remove all associated floors and rooms.",
      )
    ) {
      dispatch(deleteBuilding(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBuilding) {
      dispatch(updateBuilding({ id: editingBuilding.id, data: formData }));
    } else {
      dispatch(createBuilding(formData));
    }
  };

  const filteredBuildings =
    buildings?.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white font-display">
            Hostel Buildings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage infrastructure and floor structures.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBuilding(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Building
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search buildings..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary-50 text-primary-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-primary-50 text-primary-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Buildings Content */}
      {status === "loading" ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">
            Loading buildings...
          </p>
        </div>
      ) : filteredBuildings.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBuildings.map((building) => (
              <div
                key={building.id}
                className="group card bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 hover:border-primary-500/30 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          building.type === "boys"
                            ? "bg-blue-100 text-blue-700"
                            : building.type === "girls"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {building.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          building.status === "active"
                            ? "bg-success-100 text-success-700"
                            : "bg-error-100 text-error-700"
                        }`}
                      >
                        {building.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 group-hover:text-primary-600 transition-colors">
                      {building.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-2 italic">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span className="truncate">
                        {building.address || "No address set"}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    <Building className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-gray-700 relative z-10">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Floors
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                      {building.total_floors}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Rooms
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                      {building.total_rooms}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Cap.
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                      {building.total_capacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 space-x-3 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(building)}
                      className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-600 hover:text-primary-600 rounded-xl transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(building.id)}
                      className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-600 hover:text-error-600 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/hostel/rooms?building_id=${building.id}`)
                    }
                    className="flex items-center px-4 py-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 rounded-xl text-xs font-bold hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  >
                    View Floors <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Structure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredBuildings.map((building) => (
                  <tr
                    key={building.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
                          <Building className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {building.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {building.address || "AP, India"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          building.type === "boys"
                            ? "bg-blue-100 text-blue-700"
                            : building.type === "girls"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {building.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="flex items-center">
                          <Layers className="w-3.5 h-3.5 text-gray-400 mr-1" />
                          <span className="font-bold">
                            {building.total_floors}
                          </span>
                        </div>
                        <div className="w-px h-3 bg-gray-200" />
                        <span className="text-gray-500 font-medium">
                          {building.total_rooms} Rooms
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {building.total_capacity}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">Beds</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`flex items-center text-xs font-bold ${building.status === "active" ? "text-success-600" : "text-error-600"}`}
                      >
                        {building.status === "active" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                        )}
                        {building.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(building)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(building.id)}
                          className="p-2 text-gray-400 hover:text-error-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No Buildings Found
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Start by adding your first hostel building to manage rooms and
            students.
          </p>
          <button
            onClick={() => {
              setEditingBuilding(null);
              setIsModalOpen(true);
            }}
            className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
          >
            Add First Building
          </button>
        </div>
      )}

      {/* Modal - Tailwind UI Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="px-8 py-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display">
                  {editingBuilding ? "Edit Building" : "Add New Building"}
                </h2>
                <p className="text-primary-100 text-xs mt-0.5">
                  Enter hostel structure details
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Building Name *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
                    placeholder="e.g. Block A, Krishna Hostel"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Hostel Type
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm cursor-pointer"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="boys">Boys Hostel</option>
                    <option value="girls">Girls Hostel</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
                    value={formData.total_floors}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_floors: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Address / Location
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm resize-none h-24"
                  placeholder="Street name, campus area, etc."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationStatus === "loading"}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                >
                  {operationStatus === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : editingBuilding ? (
                    "Save Changes"
                  ) : (
                    "Create Building"
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

export default BuildingManagement;
