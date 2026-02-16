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
  ArrowLeft,
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
                <Building className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Building Management
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-14">
              Manage hostel infrastructure and floor structures.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBuilding(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Building
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search buildings by name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buildings Content */}
        {status === "loading" ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              Loading buildings...
            </p>
          </div>
        ) : filteredBuildings.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBuildings.map((building) => (
                <div
                  key={building.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Top Accent Bar */}
                  <div className="h-1 bg-gray-100 group-hover:bg-blue-600 transition-colors"></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${building.type === "boys"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : building.type === "girls"
                                ? "bg-pink-50 text-pink-700 border-pink-100"
                                : "bg-purple-50 text-purple-700 border-purple-100"
                              }`}
                          >
                            {building.type}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${building.status === "active"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-red-50 text-red-700 border-red-100"
                              }`}
                          >
                            {building.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                          {building.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-2 font-medium">
                          <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span className="truncate">
                            {building.address || "No address specified"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Building className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                          Floors
                        </p>
                        <p className="text-2xl font-black text-gray-900">
                          {building.total_floors}
                        </p>
                      </div>
                      <div className="text-center border-l border-r border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                          Rooms
                        </p>
                        <p className="text-2xl font-black text-gray-900">
                          {building.total_rooms || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                          Capacity
                        </p>
                        <p className="text-2xl font-black text-gray-900">
                          {building.total_capacity || 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 gap-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(building)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(building.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/hostel/rooms?building_id=${building.id}`)
                        }
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 hover:border-blue-600"
                      >
                        View Floors <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Building
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Structure
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Capacity
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
                  {filteredBuildings.map((building) => (
                    <tr
                      key={building.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3 border border-blue-100">
                            <Building className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {building.name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {building.address || "No address"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${building.type === "boys"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : building.type === "girls"
                              ? "bg-pink-50 text-pink-700 border-pink-100"
                              : "bg-purple-50 text-purple-700 border-purple-100"
                            }`}
                        >
                          {building.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center">
                            <Layers className="w-3.5 h-3.5 text-gray-400 mr-1" />
                            <span className="font-bold text-gray-900">
                              {building.total_floors}
                            </span>
                          </div>
                          <div className="w-px h-3 bg-gray-200" />
                          <span className="text-gray-600 font-medium">
                            {building.total_rooms || 0} Rooms
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900">
                          {building.total_capacity || 0}
                        </span>
                        <span className="text-xs text-gray-500 ml-1 font-medium">Beds</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center text-xs font-bold w-fit ${building.status === "active"
                            ? "text-green-700"
                            : "text-red-700"
                            }`}
                        >
                          {building.status === "active" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          {building.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(building)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(building.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/hostel/rooms?building_id=${building.id}`)
                            }
                            className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Floors"
                          >
                            <ArrowRight className="w-4 h-4" />
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
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="p-4 bg-gray-50 rounded-full mb-4 border border-gray-100">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Buildings Found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm text-center">
              {searchTerm
                ? "No buildings match your search. Try a different term."
                : "Start by adding your first hostel building to manage rooms and students."}
            </p>
            <button
              onClick={() => {
                setEditingBuilding(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Add First Building
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {editingBuilding ? "Edit Building" : "Add New Building"}
                  </h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
                    Infrastructure Management
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50/50">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Building Name *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g. Block A, Krishna Hostel"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                      Hostel Type
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                      Total Floors
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
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
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Address / Location
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none h-24"
                    placeholder="Street name, campus area, etc."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={operationStatus === "loading"}
                    className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70"
                  >
                    {operationStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
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
    </div>
  );
};

export default BuildingManagement;
