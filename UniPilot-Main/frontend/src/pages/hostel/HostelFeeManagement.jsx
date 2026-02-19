import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  XCircle,
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
  const navigate = useNavigate();
  const {
    feeStructures,
    messFeeStructures,
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
    dispatch(fetchMessFeeStructures());
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
      dispatch(fetchMessFeeStructures());
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
                <Wallet className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Fee Management
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium pl-14">
              Configure independent rent and mess charges per semester.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {activeTab === "rent" ? "Rent" : "Mess"} Plan
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white p-1 rounded-lg w-fit border border-gray-200 shadow-sm">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === "rent"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <Home className="w-3.5 h-3.5 inline mr-2" />
              Rent Plans
            </button>
            <button
              onClick={() => setActiveTab("mess")}
              className={`px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === "mess"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <Coins className="w-3.5 h-3.5 inline mr-2" />
              Mess Plans
            </button>
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {status === "loading" ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 h-64 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : activeTab === "rent" ? (
            feeStructures?.length > 0 ? (
              feeStructures.map((fee) => (
                <div
                  key={fee.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Top Accent Bar */}
                  <div
                    className={`h-1 ${fee.room_type === "ac" ? "bg-blue-600" : "bg-indigo-600"} group-hover:h-2 transition-all`}
                  ></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${fee.room_type === "ac"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                            }`}
                        >
                          {fee.room_type.replace("_", " ")}
                        </span>
                        <h3 className="text-xl font-black text-gray-900 mt-3 group-hover:text-blue-700 transition-colors">
                          {fee.name}
                        </h3>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="space-y-3 py-4 border-t border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Rent / Sem</span>
                        <span className="text-2xl font-black text-gray-900">
                          ₹{parseFloat(fee.base_amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Deposit</span>
                        <span className="text-sm font-bold text-gray-600">
                          ₹{parseFloat(fee.security_deposit).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(fee)}
                        className="flex-1 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDelete(fee.id)}
                        className="flex-1 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Home}
                title="No Rent Plans"
                description="Create your first rent structure to start managing hostel fees."
                onAction={() => setIsModalOpen(true)}
              />
            )
          ) : messFeeStructures?.length > 0 ? (
            messFeeStructures.map((fee) => (
              <div
                key={fee.id}
                className="group bg-white rounded-xl border border-gray-200 hover:border-green-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Top Accent Bar */}
                <div
                  className={`h-1 ${fee.mess_type === "veg" ? "bg-green-600" : "bg-red-600"} group-hover:h-2 transition-all`}
                ></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${fee.mess_type === "veg"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-red-50 text-red-700 border-red-100"
                          }`}
                      >
                        {fee.mess_type}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 mt-3 group-hover:text-green-700 transition-colors">
                        {fee.name}
                      </h3>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="py-4 border-t border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Per Semester</span>
                      <span className={`text-2xl font-black ${fee.mess_type === "veg" ? "text-green-600" : "text-red-600"}`}>
                        ₹{parseFloat(fee.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(fee)}
                      className="flex-1 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(fee.id)}
                      className="flex-1 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Coins}
              title="No Mess Plans"
              description="Create your first mess fee structure to manage dining charges."
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {selectedItem ? "Edit" : "Create"} {activeTab === "rent" ? "Rent" : "Mess"} Plan
                  </h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
                    Fee Structure Configuration
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
                    Plan Name *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={activeTab === "rent" ? "e.g. Standard AC Room" : "e.g. Premium Veg Meal"}
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
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                          Room Type
                        </label>
                        <select
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                          Semester Rent *
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
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
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                          Security Deposit *
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
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
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                          Dietary Type
                        </label>
                        <select
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                          Semester Charge *
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                          value={messFormData.amount}
                          onChange={(e) =>
                            setMessFormData({
                              ...messFormData,
                              amount: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
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
                    ) : selectedItem ? (
                      "Save Changes"
                    ) : (
                      "Create Plan"
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

const EmptyState = ({ icon: Icon, title, description, onAction }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
    <div className="p-4 bg-gray-50 rounded-full mb-4 border border-gray-100">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm text-center">
      {description}
    </p>
    <button
      onClick={onAction}
      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
    >
      Create First Plan
    </button>
  </div>
);

export default HostelFeeManagement;
