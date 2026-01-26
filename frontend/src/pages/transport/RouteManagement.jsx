import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronRight,
  Info,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  fetchRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  createStop,
  updateStop,
  deleteStop,
  resetOperationStatus,
} from "../../store/slices/transportSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const RouteManagement = () => {
  const dispatch = useDispatch();
  const { routes, status, operationStatus, operationError } = useSelector(
    (state) => state.transport,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    route_code: "",
    distance_km: "",
    start_location: "",
    end_location: "University Campus",
    direction: "Both",
    morning_start_time: "",
    evening_start_time: "",
  });

  const [activeTab, setActiveTab] = useState("routes"); // 'routes' or 'stops'
  const [viewingStopsFor, setViewingStopsFor] = useState(null);

  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        selectedRoute
          ? "Route updated successfully"
          : "Route created successfully",
      );
      setIsModalOpen(false);
      setSelectedRoute(null);
      setFormData({
        name: "",
        route_code: "",
        distance_km: "",
        start_location: "",
        end_location: "University Campus",
        morning_start_time: "",
        evening_start_time: "",
      });
      dispatch(fetchRoutes());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch, selectedRoute]);

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      route_code: route.route_code,
      distance_km: route.distance_km,
      start_location: route.start_location,
      end_location: route.end_location,
      morning_start_time: route.morning_start_time || "",
      evening_start_time: route.evening_start_time || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to deactivate this route?")) {
      dispatch(deleteRoute(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoute) {
      dispatch(updateRoute({ id: selectedRoute.id, data: formData }));
    } else {
      dispatch(createRoute(formData));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link
              to="/transport"
              className="hover:text-primary-600 transition-colors"
            >
              Transport
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Route Management</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Route Management
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedRoute(null);
            setFormData({
              name: "",
              route_code: "",
              distance_km: "",
              start_location: "",
              end_location: "University Campus",
              morning_start_time: "",
              evening_start_time: "",
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New Route
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {status === "loading" && (
          <div className="text-center py-12">Loading...</div>
        )}

        {routes.length === 0 && status === "succeeded" && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No routes found
            </h3>
            <p className="text-gray-500 mt-1">
              Get started by creating your first transport route.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                        {route.name}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded uppercase">
                        {route.route_code}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(route)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-24 font-medium">Path:</div>
                    <div className="truncate">
                      {route.start_location} → Campus
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-24 font-medium">Distance:</div>
                    <div>{route.distance_km} km</div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-24 font-medium">Morning:</div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.morning_start_time
                        ? route.morning_start_time.substring(0, 5)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-24 font-medium">Evening:</div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.evening_start_time
                        ? route.evening_start_time.substring(0, 5)
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-sm text-gray-500">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {route.stops?.length || 0}
                    </span>{" "}
                    stops configured
                  </div>
                  <Link
                    to={`/transport/routes/${route.id}/stops`}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
                  >
                    Manage Stops
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Add/Edit Route */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedRoute ? "Edit Route" : "Add New Route"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Route Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Route 1 - Kakinada"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Route Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. R001"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white uppercase"
                        value={formData.route_code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            route_code: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 25.5"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.distance_km}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            distance_km: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Location
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand View Center"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.start_location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Morning Start
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.morning_start_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            morning_start_time: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Evening Start
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.evening_start_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evening_start_time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={operationStatus === "loading"}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {operationStatus === "loading"
                        ? "Saving..."
                        : selectedRoute
                          ? "Update Route"
                          : "Create Route"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add explicit X component since Lucide might not have it in all versions
const X = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default RouteManagement;
