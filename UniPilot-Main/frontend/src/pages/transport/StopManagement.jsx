import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowLeft,
  X,
  Clock,
  Navigation,
  DollarSign,
} from "lucide-react";
import {
  fetchRoutes,
  createStop,
  updateStop,
  deleteStop,
  resetOperationStatus,
} from "../../store/slices/transportSlice";
import toast from "react-hot-toast";

const StopManagement = () => {
  const { routeId } = useParams();
  const dispatch = useDispatch();
  const { routes, status, operationStatus, operationError } = useSelector(
    (state) => state.transport,
  );

  const [route, setRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [formData, setFormData] = useState({
    stop_name: "",
    stop_sequence: "",
    distance_from_start_km: "",
    zone_fee: "",
    morning_pickup_time: "",
    evening_drop_time: "",
    route_id: routeId,
  });

  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  useEffect(() => {
    if (routes.length > 0) {
      const foundRoute = routes.find((r) => r.id === routeId);
      setRoute(foundRoute);
    }
  }, [routes, routeId]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        selectedStop ? "Stop updated successfully" : "Stop added successfully",
      );
      setIsModalOpen(false);
      setSelectedStop(null);
      setFormData({
        stop_name: "",
        stop_sequence: "",
        distance_from_start_km: "",
        zone_fee: "",
        morning_pickup_time: "",
        evening_drop_time: "",
        route_id: routeId,
      });
      dispatch(fetchRoutes());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch, selectedStop, routeId]);

  const handleEdit = (stop) => {
    setSelectedStop(stop);
    setFormData({
      stop_name: stop.stop_name,
      stop_sequence: stop.stop_sequence,
      distance_from_start_km: stop.distance_from_start_km || "",
      zone_fee: stop.zone_fee,
      morning_pickup_time: stop.morning_pickup_time || "",
      evening_drop_time: stop.evening_drop_time || "",
      route_id: routeId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this stop?")) {
      dispatch(deleteStop(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStop) {
      dispatch(updateStop({ id: selectedStop.id, data: formData }));
    } else {
      dispatch(createStop(formData));
    }
  };

  if (!route && status === "loading")
    return <div className="p-6">Loading...</div>;
  if (!route) return <div className="p-6 text-center">Route not found</div>;

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
            <Link
              to="/transport/routes"
              className="hover:text-primary-600 transition-colors"
            >
              Route Management
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{route.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/transport/routes"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Route Stops: {route.name}
            </h1>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedStop(null);
            const nextSeq =
              route.stops?.length > 0
                ? Math.max(...route.stops.map((s) => s.stop_sequence)) + 1
                : 1;
            setFormData({
              stop_name: "",
              stop_sequence: nextSeq,
              distance_from_start_km: "",
              zone_fee: "",
              morning_pickup_time: "",
              evening_drop_time: "",
              route_id: routeId,
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New Stop
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Seq
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Stop Name
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Zone Fee
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Timing
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {route.stops?.map((stop) => (
                <tr
                  key={stop.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300">
                      {stop.stop_sequence}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {stop.stop_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {stop.distance_from_start_km} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      ₹{parseFloat(stop.zone_fee).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="w-8 text-[10px] font-bold uppercase text-gray-400">
                          AM:
                        </span>
                        <Clock className="w-3 h-3 text-blue-500" />
                        {stop.morning_pickup_time
                          ? stop.morning_pickup_time.substring(0, 5)
                          : "--:--"}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-8 text-[10px] font-bold uppercase text-gray-400">
                          PM:
                        </span>
                        <Clock className="w-3 h-3 text-orange-500" />
                        {stop.evening_drop_time
                          ? stop.evening_drop_time.substring(0, 5)
                          : "--:--"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(stop)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stop.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!route.stops || route.stops.length === 0) && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No stops configured for this route yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Stop */}
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
                    {selectedStop ? "Edit Stop" : "Add New Stop"}
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-display">
                        Stop Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand View Center"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.stop_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stop_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sequence Order
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.stop_sequence}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stop_sequence: e.target.value,
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
                        placeholder="from start"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.distance_from_start_km}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            distance_from_start_km: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Zone Fee (Amount in ₹)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
                          ₹
                        </div>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 10000"
                          className="w-full pl-8 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-bold"
                          value={formData.zone_fee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              zone_fee: e.target.value,
                            })
                          }
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This fee will be automatically applied to students using
                        this stop.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pickup Time (AM)
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.morning_pickup_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            morning_pickup_time: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Drop Time (PM)
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.evening_drop_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evening_drop_time: e.target.value,
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
                        : selectedStop
                          ? "Update Stop"
                          : "Add Stop"}
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

export default StopManagement;
