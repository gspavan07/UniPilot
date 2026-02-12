import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bus,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowLeft,
  X,
  Calendar,
  Shield,
  Clock,
  Settings,
  AlertCircle,
} from "lucide-react";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  resetOperationStatus,
} from "../../store/slices/transportSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const { vehicles, status, operationStatus, operationError } = useSelector(
    (state) => state.transport,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registration_number: "",
    vehicle_type: "bus",
    seating_capacity: "",
    make_model: "",
    year_of_manufacture: "",
    insurance_number: "",
    insurance_expiry: "",
    fitness_certificate_expiry: "",
    rc_book_number: "",
    current_mileage: "0",
    status: "active",
  });

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        selectedVehicle
          ? "Vehicle updated successfully"
          : "Vehicle registered successfully",
      );
      setIsModalOpen(false);
      setSelectedVehicle(null);
      setFormData({
        registration_number: "",
        vehicle_type: "bus",
        seating_capacity: "",
        make_model: "",
        year_of_manufacture: "",
        insurance_number: "",
        insurance_expiry: "",
        fitness_certificate_expiry: "",
        rc_book_number: "",
        current_mileage: "0",
        status: "active",
      });
      dispatch(fetchVehicles());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch, selectedVehicle]);

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number,
      vehicle_type: vehicle.vehicle_type,
      seating_capacity: vehicle.seating_capacity,
      make_model: vehicle.make_model || "",
      year_of_manufacture: vehicle.year_of_manufacture || "",
      insurance_number: vehicle.insurance_number || "",
      insurance_expiry: vehicle.insurance_expiry || "",
      fitness_certificate_expiry: vehicle.fitness_certificate_expiry || "",
      rc_book_number: vehicle.rc_book_number || "",
      current_mileage: vehicle.current_mileage || "0",
      status: vehicle.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to retire this vehicle?")) {
      dispatch(deleteVehicle(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedVehicle) {
      dispatch(updateVehicle({ id: selectedVehicle.id, data: formData }));
    } else {
      dispatch(createVehicle(formData));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "retired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
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
            <span className="text-gray-900 font-medium font-display">
              Vehicle Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vehicle Management
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedVehicle(null);
            setFormData({
              registration_number: "",
              vehicle_type: "bus",
              seating_capacity: "",
              make_model: "",
              year_of_manufacture: "",
              insurance_number: "",
              insurance_expiry: "",
              fitness_certificate_expiry: "",
              rc_book_number: "",
              current_mileage: "0",
              status: "active",
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all font-display"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {status === "loading" && (
          <div className="text-center py-12 col-span-full">Loading...</div>
        )}

        {vehicles.length === 0 && status === "succeeded" && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 col-span-full">
            <Bus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No vehicles registered
            </h3>
            <p className="text-gray-500 mt-1">
              Add your first transport vehicle to manage the fleet.
            </p>
          </div>
        )}

        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(vehicle.status)}`}
              >
                {vehicle.status}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Bus className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase leading-tight font-display">
                    {vehicle.registration_number}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {vehicle.make_model || "Unknown Model"} (
                    {vehicle.vehicle_type})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                    Capacity
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {vehicle.seating_capacity} Seats
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                    Mileage
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {vehicle.current_mileage} km
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${isExpiringSoon(vehicle.insurance_expiry) ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-gray-50 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 opacity-70" />
                    <span className="text-sm font-medium">Insurance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">
                      {vehicle.insurance_expiry || "N/A"}
                    </span>
                    {isExpiringSoon(vehicle.insurance_expiry) && (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${isExpiringSoon(vehicle.fitness_certificate_expiry) ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 opacity-70" />
                    <span className="text-sm font-medium">Fitness Cert</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">
                      {vehicle.fitness_certificate_expiry || "N/A"}
                    </span>
                    {isExpiringSoon(vehicle.fitness_certificate_expiry) && (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Vehicle */}
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
            <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                    {selectedVehicle ? "Edit Vehicle" : "Register New Vehicle"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-primary-600 uppercase border-b pb-1">
                        Basic Details
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reg Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AP 12 X 4567"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white uppercase"
                          value={formData.registration_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              registration_number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vehicle Type
                          </label>
                          <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            value={formData.vehicle_type}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vehicle_type: e.target.value,
                              })
                            }
                          >
                            <option value="bus">Bus</option>
                            <option value="van">Van</option>
                            <option value="minibus">Mini Bus</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Capacity
                          </label>
                          <input
                            type="number"
                            required
                            placeholder="Seats"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            value={formData.seating_capacity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                seating_capacity: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Make & Model
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tata Starbus 2023"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={formData.make_model}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              make_model: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Compliance Info */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-primary-600 uppercase border-b pb-1">
                        Compliance & Maintenance
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Insurance Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={formData.insurance_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              insurance_number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-xs">
                            Insurance Expiry
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                            value={formData.insurance_expiry}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                insurance_expiry: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-xs">
                            Fitness Expiry
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                            value={formData.fitness_certificate_expiry}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fitness_certificate_expiry: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Mileage (km)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={formData.current_mileage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              current_mileage: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vehicle Status
                        </label>
                        <select
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                        >
                          <option value="active">Active</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3 border-t pt-6">
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
                        : selectedVehicle
                          ? "Update Vehicle"
                          : "Register Vehicle"}
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

export default VehicleManagement;
