import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowLeft,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Briefcase,
} from "lucide-react";
import {
  fetchDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  resetOperationStatus,
} from "../../store/slices/transportSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const DriverManagement = () => {
  const dispatch = useDispatch();
  const { drivers, status, operationStatus, operationError } = useSelector(
    (state) => state.transport,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    driver_license_number: "",
    license_expiry: "",
    staff_type: "driver",
    date_of_joining: "",
    is_verified: false,
    address: "",
  });

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        selectedDriver
          ? "Staff details updated"
          : "Staff registered successfully",
      );
      setIsModalOpen(false);
      setSelectedDriver(null);
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        driver_license_number: "",
        license_expiry: "",
        staff_type: "driver",
        date_of_joining: "",
        is_verified: false,
        address: "",
      });
      dispatch(fetchDrivers());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch, selectedDriver]);

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      first_name: driver.first_name,
      last_name: driver.last_name,
      phone: driver.phone,
      email: driver.email || "",
      driver_license_number: driver.driver_license_number || "",
      license_expiry: driver.license_expiry || "",
      staff_type: driver.staff_type,
      date_of_joining: driver.date_of_joining || "",
      is_verified: driver.is_verified,
      address: driver.address || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to deactivate this staff member?")
    ) {
      dispatch(deleteDriver(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDriver) {
      dispatch(updateDriver({ id: selectedDriver.id, data: formData }));
    } else {
      dispatch(createDriver(formData));
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
            <span className="text-gray-900 font-medium">
              Driver & Staff Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Driver & Staff Management
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedDriver(null);
            setFormData({
              first_name: "",
              last_name: "",
              phone: "",
              email: "",
              driver_license_number: "",
              license_expiry: "",
              staff_type: "driver",
              date_of_joining: "",
              is_verified: false,
              address: "",
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all font-display"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {status === "loading" && (
          <div className="text-center py-12 col-span-full">Loading...</div>
        )}

        {drivers.length === 0 && status === "succeeded" && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 col-span-full">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No staff members found
            </h3>
            <p className="text-gray-500 mt-1">
              Register drivers and conductors for the transport fleet.
            </p>
          </div>
        )}

        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${driver.staff_type === "driver"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : driver.staff_type === "conductor"
                        ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                >
                  {driver.staff_type}
                </span>
                {driver.is_verified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(driver)}
                  className="p-1 px-2 text-xs font-bold text-gray-500 hover:text-primary-600 hover:bg-white rounded transition-colors uppercase"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="p-1 px-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors uppercase"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${driver.first_name}+${driver.last_name}&background=random&color=fff`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize leading-tight font-display">
                    {driver.first_name} {driver.last_name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="w-3 h-3" />
                    {driver.phone}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {driver.staff_type === "driver" && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 tracking-wider">
                      Driving License
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {driver.driver_license_number || "NOT PROVIDED"}
                      </p>
                      <p className="text-xs font-medium text-blue-600">
                        Exp: {driver.license_expiry || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      Joined: {driver.date_of_joining || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="truncate">
                      Status: {driver.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Driver */}
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
            <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                    {selectedDriver
                      ? "Edit Staff Details"
                      : "Register New Staff Member"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Staff Type
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.staff_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            staff_type: e.target.value,
                          })
                        }
                      >
                        <option value="driver">Driver</option>
                        <option value="conductor">Conductor</option>
                        <option value="helper">Helper</option>
                      </select>
                    </div>

                    {formData.staff_type === "driver" && (
                      <>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            License Number
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white uppercase"
                            value={formData.driver_license_number}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                driver_license_number: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            License Expiry
                          </label>
                          <input
                            type="date"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            value={formData.license_expiry}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                license_expiry: e.target.value,
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date of Joining
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.date_of_joining}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date_of_joining: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center h-full pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          checked={formData.is_verified}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              is_verified: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Background Verified
                        </span>
                      </label>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Residential Address
                      </label>
                      <textarea
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
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
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-display"
                    >
                      {operationStatus === "loading"
                        ? "Saving..."
                        : selectedDriver
                          ? "Update Details"
                          : "Register Staff"}
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

export default DriverManagement;
