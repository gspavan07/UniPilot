import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowLeft,
  X,
  FileText,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Bus,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  fetchSpecialTrips,
  createSpecialTrip,
  updateSpecialTrip,
  approveSpecialTrip,
  deleteSpecialTrip,
  fetchTripLogs,
  createTripLog,
  updateTripLog,
  fetchRoutes,
  fetchVehicles,
  resetOperationStatus,
} from "../../store/slices/transportSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const TripManagement = () => {
  const dispatch = useDispatch();
  const {
    specialTrips,
    tripLogs,
    routes,
    vehicles,
    status,
    operationStatus,
    operationError,
  } = useSelector((state) => state.transport);

  const [activeTab, setActiveTab] = useState("special"); // 'special' or 'logs'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form stats for special trip
  const [specialTripData, setSpecialTripData] = useState({
    title: "",
    purpose: "",
    route_description: "",
    requested_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "17:00",
    vehicle_id: "",
    estimated_cost: "",
    status: "pending",
  });

  // Form states for trip log
  const [tripLogData, setTripLogData] = useState({
    route_id: "",
    vehicle_id: "",
    trip_date: new Date().toISOString().split("T")[0],
    shift: "morning",
    start_time: "",
    end_time: "",
    start_odometer: "",
    end_odometer: "",
    fuel_consumed_liters: "",
    student_count: "",
    remarks: "",
  });

  useEffect(() => {
    dispatch(fetchSpecialTrips());
    dispatch(fetchTripLogs());
    dispatch(fetchRoutes());
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Record updated successfully");
      setIsModalOpen(false);
      setSelectedItem(null);
      dispatch(fetchSpecialTrips());
      dispatch(fetchTripLogs());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch]);

  const handleApproveTrip = (id) => {
    if (window.confirm("Approve this special trip request?")) {
      dispatch(approveSpecialTrip(id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 font-display">
            <Link
              to="/transport"
              className="hover:text-primary-600 transition-colors"
            >
              Transport
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Trip Management</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trips & Logging
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("special");
              setSpecialTripData({
                title: "",
                purpose: "",
                route_description: "",
                requested_date: new Date().toISOString().split("T")[0],
                start_time: "09:00",
                end_time: "17:00",
                vehicle_id: "",
                estimated_cost: "",
                status: "pending",
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all font-display"
          >
            <Calendar className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Request Special Trip
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              setTripLogData({
                route_id: "",
                vehicle_id: "",
                trip_date: new Date().toISOString().split("T")[0],
                shift: "morning",
                start_time: "",
                end_time: "",
                start_odometer: "",
                end_odometer: "",
                fuel_consumed_liters: "",
                student_count: "",
                remarks: "",
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all font-display"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Log Trip
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "special" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("special")}
        >
          SPECIAL TRIPS
        </button>
        <button
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "logs" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("logs")}
        >
          TRIP LOGS
        </button>
      </div>

      {activeTab === "special" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(trip.status)}`}
                >
                  {trip.status}
                </span>
                {trip.status === "pending" && (
                  <button
                    onClick={() => handleApproveTrip(trip.id)}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 underline"
                  >
                    Approve Request
                  </button>
                )}
              </div>
              <div className="p-5 flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                  {trip.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {trip.purpose}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>{trip.requested_date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>
                      {trip.start_time?.substring(0, 5)} -{" "}
                      {trip.end_time?.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Navigation className="w-4 h-4 text-indigo-500" />
                    <span className="truncate">{trip.route_description}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {specialTrips.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              No special trip requests found.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date & Route
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Shift/Time
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {tripLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {log.trip_date}
                      </div>
                      <div className="text-xs text-primary-600 font-medium">
                        Route: {log.route?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-gray-400" />
                        <span className="font-bold">
                          {log.vehicle?.registration_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.shift === "morning" ? "bg-orange-100 text-orange-800" : "bg-indigo-100 text-indigo-800"}`}
                      >
                        {log.shift}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {log.start_time?.substring(0, 5)} -{" "}
                        {log.end_time?.substring(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span>{log.student_count} Students</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {log.fuel_consumed_liters}L Fuel |{" "}
                          {log.end_odometer - log.start_odometer}km
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 max-w-xs line-clamp-2">
                        {log.remarks || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
                {tripLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No trip logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Modal */}
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                    {activeTab === "special"
                      ? "Request Special Trip"
                      : "Log Daily Trip"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {activeTab === "special" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dispatch(createSpecialTrip(specialTripData));
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title / Event Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Industrial Visit to Vizag"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={specialTripData.title}
                        onChange={(e) =>
                          setSpecialTripData({
                            ...specialTripData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purpose
                      </label>
                      <textarea
                        required
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                        value={specialTripData.purpose}
                        onChange={(e) =>
                          setSpecialTripData({
                            ...specialTripData,
                            purpose: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={specialTripData.requested_date}
                          onChange={(e) =>
                            setSpecialTripData({
                              ...specialTripData,
                              requested_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estimated Cost (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Budget amount"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={specialTripData.estimated_cost}
                          onChange={(e) =>
                            setSpecialTripData({
                              ...specialTripData,
                              estimated_cost: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex gap-3 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      dispatch(createTripLog(tripLogData));
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Route
                        </label>
                        <select
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={tripLogData.route_id}
                          onChange={(e) =>
                            setTripLogData({
                              ...tripLogData,
                              route_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Choose route...</option>
                          {routes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vehicle
                        </label>
                        <select
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={tripLogData.vehicle_id}
                          onChange={(e) =>
                            setTripLogData({
                              ...tripLogData,
                              vehicle_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Choose vehicle...</option>
                          {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.registration_number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Student Count
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={tripLogData.student_count}
                          onChange={(e) =>
                            setTripLogData({
                              ...tripLogData,
                              student_count: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fuel (Liters)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={tripLogData.fuel_consumed_liters}
                          onChange={(e) =>
                            setTripLogData({
                              ...tripLogData,
                              fuel_consumed_liters: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex gap-3 pt-6 border-t font-display">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
                      >
                        Submit Log
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
