import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Wallet,
  Plus,
  Coins,
  Settings,
  CreditCard,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Filter,
  ArrowUpRight,
  Home,
  TrendingUp,
  Receipt,
} from "lucide-react";
import {
  fetchFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  fetchMessFeeStructures,
  createMessFeeStructure,
  updateMessFeeStructure,
  deleteMessFeeStructure,
  resetOperationStatus,
} from "../../store/slices/hostelSlice";
import toast from "react-hot-toast";

const HostelFeeManagement = () => {
  const dispatch = useDispatch();
  const {
    feeStructures,
    messFeeStructures, // New selector
    status,
    operationStatus,
    operationError,
  } = useSelector((state) => state.hostel);

  const [activeTab, setActiveTab] = useState("rent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Separate form data for Rent and Mess
  const [rentFormData, setRentFormData] = useState({
    name: "",
    room_type: "non_ac",
    base_amount: 0,
    security_deposit: 0,
    academic_year:
      new Date().getFullYear().toString() +
      "-" +
      (new Date().getFullYear() + 1).toString().slice(-2),
  });

  const [messFormData, setMessFormData] = useState({
    name: "",
    mess_type: "veg",
    amount: 0,
    academic_year:
      new Date().getFullYear().toString() +
      "-" +
      (new Date().getFullYear() + 1).toString().slice(-2),
  });

  useEffect(() => {
    dispatch(fetchFeeStructures());
    dispatch(fetchMessFeeStructures()); // Fetch mess fee structures
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success(
        activeTab === "rent"
          ? selectedItem
            ? "Rent plan updated!"
            : "Rent plan created!"
          : selectedItem
            ? "Mess plan updated!"
            : "Mess plan created!",
      );
      setIsModalOpen(false);
      // Reset relevant form
      if (activeTab === "rent") {
        setRentFormData({
          name: "",
          room_type: "non_ac",
          base_amount: 0,
          security_deposit: 0,
          academic_year:
            new Date().getFullYear().toString() +
            "-" +
            (new Date().getFullYear() + 1).toString().slice(-2),
        });
      } else {
        setMessFormData({
          name: "",
          mess_type: "veg",
          amount: 0,
          academic_year:
            new Date().getFullYear().toString() +
            "-" +
            (new Date().getFullYear() + 1).toString().slice(-2),
        });
      }
      dispatch(fetchFeeStructures());
      dispatch(fetchMessFeeStructures()); // Re-fetch mess fee structures
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, operationError, activeTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "rent") {
      if (selectedItem) {
        dispatch(
          updateFeeStructure({ id: selectedItem.id, data: rentFormData }),
        );
      } else {
        dispatch(createFeeStructure(rentFormData));
      }
    } else {
      if (selectedItem) {
        dispatch(
          updateMessFeeStructure({ id: selectedItem.id, data: messFormData }),
        );
      } else {
        dispatch(createMessFeeStructure(messFormData));
      }
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    if (activeTab === "rent") {
      setRentFormData({
        name: item.name,
        room_type: item.room_type,
        base_amount: item.base_amount,
        security_deposit: item.security_deposit,
        academic_year: item.academic_year,
      });
    } else {
      setMessFormData({
        name: item.name,
        mess_type: item.mess_type,
        amount: item.amount,
        academic_year: item.academic_year,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      if (activeTab === "rent") {
        dispatch(deleteFeeStructure(id)).then((res) => {
          if (!res.error) toast.success("Rent plan removed");
        });
      } else {
        dispatch(deleteMessFeeStructure(id)).then((res) => {
          if (!res.error) toast.success("Mess plan removed");
        });
      }
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // totalMonthly calculation is removed as it's specific to the old combined form

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-3xl">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
              Hostel Economy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Configure independent Rent and Mess charges per semester.
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-600/30 active:scale-95 group"
        >
          <Plus className="w-5 h-5 mr-3" /> Add{" "}
          {activeTab === "rent" ? "Rent" : "Mess"} Plan
        </button>
      </div>

      {/* Stats Summary - Removed as per instruction's implied change */}

      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-3xl w-fit border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("rent")}
          className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "rent"
              ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-xl"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Rent Plans
        </button>
        <button
          onClick={() => setActiveTab("mess")}
          className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "mess"
              ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-xl"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Mess Plans
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {status === "loading" ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="card p-8 bg-white dark:bg-gray-800 animate-pulse border-none shadow-sm h-64"
            />
          ))
        ) : activeTab === "rent" ? (
          feeStructures?.length > 0 ? (
            feeStructures.map((fee) => (
              <div
                key={fee.id}
                className="card bg-white dark:bg-gray-800 p-0 border border-transparent hover:border-indigo-500/20 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div
                  className={`h-2 w-full ${fee.room_type === "ac" ? "bg-blue-500" : "bg-indigo-500"}`}
                />
                <div className="p-8">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700">
                    {fee.room_type.replace("_", " ")}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2 font-display">
                    {fee.name}
                  </h3>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Rent / Sem</span>
                      <span className="text-lg font-black text-gray-900 dark:text-white">
                        ₹{parseFloat(fee.base_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Deposit</span>
                      <span className="text-xs font-bold text-gray-700">
                        ₹{parseFloat(fee.security_deposit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Hover actions */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(fee)}
                    className="w-12 h-12 bg-white dark:bg-gray-800 text-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(fee.id)}
                    className="w-12 h-12 bg-white dark:bg-gray-800 text-error-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-error-600 hover:text-white transition-all transform hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Home}
              title="No Rent Plans"
              onAction={() => setIsModalOpen(true)}
            />
          )
        ) : messFeeStructures?.length > 0 ? (
          messFeeStructures.map((fee) => (
            <div
              key={fee.id}
              className="card bg-white dark:bg-gray-800 p-0 border border-transparent hover:border-success-500/20 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <div
                className={`h-2 w-full ${fee.mess_type === "veg" ? "bg-success-500" : "bg-red-500"}`}
              />
              <div className="p-8">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${fee.mess_type === "veg" ? "bg-success-50 text-success-700" : "bg-red-50 text-red-700"}`}
                >
                  {fee.mess_type}
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2 font-display">
                  {fee.name}
                </h3>
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Per Semester</span>
                    <span className="text-2xl font-black text-success-600">
                      ₹{parseFloat(fee.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {/* Hover actions */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(fee)}
                  className="w-12 h-12 bg-white dark:bg-gray-800 text-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(fee.id)}
                  className="w-12 h-12 bg-white dark:bg-gray-800 text-error-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-error-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Coins}
            title="No Mess Plans"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </div>

      {/* Unified Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/10">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white font-display">
                  {selectedItem ? "Modify" : "Setup"}{" "}
                  {activeTab === "rent" ? "Rent" : "Mess"} Plan
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-2xl"
                >
                  <Plus className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Plan Name
                  </label>
                  <input
                    required
                    type="text" // Added type="text"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold border-none"
                    value={
                      activeTab === "rent"
                        ? rentFormData.name
                        : messFormData.name
                    }
                    onChange={(e) =>
                      activeTab === "rent"
                        ? setRentFormData({
                            ...rentFormData,
                            name: e.target.value,
                          })
                        : setMessFormData({
                            ...messFormData,
                            name: e.target.value,
                          })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {activeTab === "rent" ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Room Type
                        </label>
                        <select
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold border-none"
                          value={rentFormData.room_type}
                          onChange={(e) =>
                            setRentFormData({
                              ...rentFormData,
                              room_type: e.target.value,
                            })
                          }
                        >
                          <option value="ac">AC</option>
                          <option value="non_ac">Non-AC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Semester Rent
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold border-none"
                          value={rentFormData.base_amount}
                          onChange={(e) =>
                            setRentFormData({
                              ...rentFormData,
                              base_amount: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        {" "}
                        {/* Added for security deposit */}
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Security Deposit
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold border-none"
                          value={rentFormData.security_deposit}
                          onChange={(e) =>
                            setRentFormData({
                              ...rentFormData,
                              security_deposit: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Dietary Type
                        </label>
                        <select
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold border-none"
                          value={messFormData.mess_type}
                          onChange={(e) =>
                            setMessFormData({
                              ...messFormData,
                              mess_type: e.target.value,
                            })
                          }
                        >
                          <option value="veg">Vegetarian</option>
                          <option value="non_veg">Non-Vegetarian</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Semester Charge
                        </label>
                        <input
                          type="number"
                          required // Added required
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold border-none"
                          value={messFormData.amount}
                          onChange={(e) =>
                            setMessFormData({
                              ...messFormData,
                              amount: parseInt(e.target.value) || 0, // Parse to int
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={operationStatus === "loading"}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all mt-4"
                >
                  {operationStatus === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : selectedItem ? (
                    "Confirm Modification"
                  ) : (
                    "Authorize Structure"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, onAction }) => (
  <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
    <button
      onClick={onAction}
      className="mt-6 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all"
    >
      Initialize first
    </button>
  </div>
);

export default HostelFeeManagement;
