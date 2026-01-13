import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard,
  Download,
  Plus,
  Copy,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  RefreshCw,
  LayoutGrid,
  Calendar,
  Percent,
  CircleDollarSign,
} from "lucide-react";
import {
  fetchMyFeeStatus,
  fetchFeeStructures,
  fetchFeeCategories,
  createFeeCategory,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  cloneFeeStructure,
  fetchSemesterConfigs,
  updateSemesterConfig,
  createFeePayment,
} from "../../store/slices/feeSlice";
import { fetchPrograms } from "../../store/slices/programSlice";

const FeeManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myStatus, structures, categories, semesterConfigs, status } =
    useSelector((state) => state.fee);
  const { programs } = useSelector((state) => state.programs);

  // Admin State
  const [selectedBatch, setSelectedBatch] = useState(2023);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [cloneTargetBatch, setCloneTargetBatch] = useState(2024);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [selectedSemForDeadline, setSelectedSemForDeadline] = useState(null);
  const [deadlineForm, setDeadlineForm] = useState({
    due_date: "",
    fine_type: "none",
    fine_amount: "",
  });

  // Student State
  const [selectedFees, setSelectedFees] = useState(new Set());

  // Form States
  const [categoryName, setCategoryName] = useState("");
  const [structureForm, setStructureForm] = useState({
    category_id: "",
    amount: "",
    semester: 1,
    applies_to: "all",
    is_optional: false,
  });

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchFeeCategories());
      dispatch(fetchPrograms());
    } else {
      dispatch(fetchMyFeeStatus());
      setSelectedFees(new Set()); // Reset selection on role switch or refresh
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isAdmin && selectedProgram) {
      dispatch(
        fetchFeeStructures({
          batch_year: selectedBatch,
          program_id: selectedProgram,
        })
      );
      dispatch(
        fetchSemesterConfigs({
          batch_year: selectedBatch,
          program_id: selectedProgram,
        })
      );
    }
  }, [dispatch, isAdmin, selectedBatch, selectedProgram]);

  useEffect(() => {
    if (isAdmin && programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0].id);
    }
  }, [programs, isAdmin, selectedProgram]);

  const toggleFeeSelection = (feeId) => {
    const next = new Set(selectedFees);
    if (next.has(feeId)) {
      next.delete(feeId);
    } else {
      next.add(feeId);
    }
    setSelectedFees(next);
  };

  const calculateSelectedTotal = () => {
    let total = 0;
    if (!myStatus?.semesterWise) return 0;

    Object.entries(myStatus.semesterWise).forEach(([sem, data]) => {
      data.fees.forEach((f) => {
        if (selectedFees.has(f.id)) total += f.due;
      });
      if (selectedFees.has(`fine:${sem}`)) {
        total += data.fine.due;
      }
    });
    return total;
  };

  const handleBulkPayment = async () => {
    const total = calculateSelectedTotal();
    if (total <= 0) return;

    if (!window.confirm(`Deduct ${total} from wallet?`)) return;

    try {
      const paymentBatch = [];
      Object.entries(myStatus.semesterWise).forEach(([sem, data]) => {
        data.fees.forEach((f) => {
          if (selectedFees.has(f.id)) {
            paymentBatch.push({ structure_id: f.id, amount: f.due });
          }
        });
        if (selectedFees.has(`fine:${sem}`)) {
          paymentBatch.push({
            type: "fine",
            semester: parseInt(sem),
            amount: data.fine.due,
          });
        }
      });

      await dispatch(
        createFeePayment({
          student_id: user.id || user.userId,
          payments: paymentBatch,
          payment_method: "online",
          transaction_id: `OTX-${Date.now()}`,
          remarks: "Online Selective Payment",
        })
      ).unwrap();

      setSelectedFees(new Set());
      dispatch(fetchMyFeeStatus());
      alert("Payment Successful!");
    } catch (err) {
      alert("Payment failed: " + err);
    }
  };

  const handleClone = async () => {
    if (!selectedProgram) return;
    try {
      await dispatch(
        cloneFeeStructure({
          fromBatch: selectedBatch,
          toBatch: cloneTargetBatch,
          program_id: selectedProgram,
        })
      ).unwrap();
      setShowCloneModal(false);
      setSelectedBatch(cloneTargetBatch);
    } catch (err) {
      console.error("Clone failed", err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createFeeCategory({ name: categoryName })).unwrap();
      setCategoryName("");
      setShowCategoryModal(false);
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    const data = {
      ...structureForm,
      batch_year: selectedBatch,
      program_id: selectedProgram,
      amount: parseFloat(structureForm.amount),
    };

    try {
      if (editingStructure) {
        await dispatch(
          updateFeeStructure({ id: editingStructure.id, data })
        ).unwrap();
      } else {
        await dispatch(createFeeStructure(data)).unwrap();
      }
      setShowStructureModal(false);
      setEditingStructure(null);
      // Refetch to get populated category names
      dispatch(
        fetchFeeStructures({
          batch_year: selectedBatch,
          program_id: selectedProgram,
        })
      );
    } catch (err) {
      console.error("Failed to save structure", err);
    }
  };

  const handleDeleteStructure = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee structure?")) {
      try {
        await dispatch(deleteFeeStructure(id)).unwrap();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const openEditStructure = (s) => {
    setEditingStructure(s);
    setStructureForm({
      category_id: s.category_id,
      amount: s.amount,
      semester: s.semester,
      applies_to: s.applies_to,
      is_optional: s.is_optional,
    });
    setShowStructureModal(true);
  };

  const openDeadlineModal = (sem, config) => {
    setSelectedSemForDeadline(sem);
    setDeadlineForm({
      due_date: config?.due_date || "",
      fine_type: config?.fine_type || "none",
      fine_amount: config?.fine_amount || "",
    });
    setShowDeadlineModal(true);
  };

  const handleSaveDeadline = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateSemesterConfig({
          program_id: selectedProgram,
          batch_year: selectedBatch,
          semester: selectedSemForDeadline,
          ...deadlineForm,
          fine_amount: parseFloat(deadlineForm.fine_amount) || 0,
        })
      ).unwrap();
      setShowDeadlineModal(false);
    } catch (err) {
      console.error("Failed to save deadline", err);
    }
  };

  const openAddStructure = (semNum) => {
    setEditingStructure(null);
    setStructureForm({
      category_id: categories[0]?.id || "",
      amount: "",
      semester: semNum || 1,
      applies_to: "all",
      is_optional: false,
    });
    setShowStructureModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("₹", "₹ ");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  if (!isAdmin) {
    // STUDENT VIEW (SAME AS BEFORE)
    const {
      semesterWise = {},
      grandTotals = {},
      studentInfo = {},
    } = myStatus || {};
    const selectedTotal = calculateSelectedTotal();

    return (
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        {/* Student Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              My Fee Ledger
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Batch {studentInfo?.batch_year || "2023"} •{" "}
              {studentInfo?.is_hosteller ? "Hosteller" : "Day Scholar"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedFees.size > 0 && (
              <button
                onClick={handleBulkPayment}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg animate-in fade-in slide-in-from-right-4"
              >
                Pay Selected ({formatCurrency(selectedTotal)})
              </button>
            )}
            <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                Total Payable
              </span>
              <FileText className="w-5 h-5 text-indigo-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {formatCurrency(grandTotals?.payable || 0)}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                Paid to Date
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <h3 className="text-2xl font-black text-emerald-600">
              {formatCurrency(grandTotals?.paid || 0)}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                Outstanding Due
              </span>
              <AlertCircle className="w-5 h-5 text-red-200" />
            </div>
            <h3 className="text-2xl font-black text-red-600">
              {formatCurrency(grandTotals?.due || 0)}
            </h3>
          </div>
        </div>

        {/* Semester Deadlines Tracker (Clutter-free) */}
        {Object.values(semesterWise).some((d) => d.fine.deadline) && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Payment Deadlines Timeline
            </h4>
            <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
              {Object.entries(semesterWise)
                .filter(([_, d]) => d.fine.deadline)
                .map(([sem, d]) => {
                  const label = [
                    "I",
                    "II",
                    "III",
                    "IV",
                    "V",
                    "VI",
                    "VII",
                    "VIII",
                  ][parseInt(sem) - 1];
                  const isPaid = d.totals.due <= 0;
                  return (
                    <div
                      key={sem}
                      className={`min-w-[180px] p-3 rounded-xl border-l-4 transition-all ${
                        isPaid
                          ? "bg-emerald-50/30 border-emerald-500"
                          : d.fine.isOverdue
                            ? "bg-red-50/30 border-red-500"
                            : "bg-amber-50/30 border-amber-500"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-black text-gray-500">
                          {label} SEM
                        </span>
                        {isPaid && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatDate(d.fine.deadline)}
                      </div>
                      <div
                        className={`text-[10px] font-black mt-1 uppercase ${
                          isPaid
                            ? "text-emerald-600"
                            : d.fine.isOverdue
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                      >
                        {isPaid
                          ? "Cleared"
                          : d.fine.isOverdue
                            ? "Overdue"
                            : "Pending"}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    Select
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    Fee Category
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Payable (₹)
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Paid (₹)
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    Due Info
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Due (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(semesterWise).map((semNum) => {
                  const data = semesterWise[semNum];
                  if (!data.fees.length) return null;
                  const getSemesterLabel = (num) =>
                    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][
                      num - 1
                    ] + " Semester";

                  return (
                    <React.Fragment key={semNum}>
                      <tr className="bg-indigo-50/30 dark:bg-indigo-900/10">
                        <td
                          colSpan="6"
                          className="px-6 py-3 font-black text-indigo-800 dark:text-indigo-300 text-xs uppercase tracking-widest"
                        >
                          {getSemesterLabel(semNum)}
                        </td>
                      </tr>
                      {data.fees.map((fee, idx) => (
                        <tr
                          key={fee.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedFees.has(fee.id) ? "bg-indigo-50/20 dark:bg-indigo-900/10" : ""}`}
                        >
                          <td className="px-6 py-4">
                            {fee.due > 0 && (
                              <input
                                type="checkbox"
                                checked={selectedFees.has(fee.id)}
                                onChange={() => toggleFeeSelection(fee.id)}
                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {fee.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                            {fee.payable.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                            {fee.paid > 0
                              ? fee.paid.toLocaleString("en-IN")
                              : "-"}
                          </td>
                          <td className="px-6 py-4">
                            {fee.receipts.length > 0 && (
                              <div className="text-[10px] font-mono text-indigo-500">
                                Rec:{" "}
                                {fee.receipts.map((r) => r.number).join(", ")}
                              </div>
                            )}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm text-right font-black ${fee.due > 0 ? "text-red-600" : "text-emerald-600/50"}`}
                          >
                            {fee.due.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                      {/* Semester Fine Row */}
                      {data.fine.amount > 0 && (
                        <tr className="bg-red-50/30 dark:bg-red-900/10">
                          <td className="px-6 py-4">
                            {data.fine.due > 0 && (
                              <input
                                type="checkbox"
                                checked={selectedFees.has(`fine:${semNum}`)}
                                onChange={() =>
                                  toggleFeeSelection(`fine:${semNum}`)
                                }
                                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Late Payment
                              Fine
                            </div>
                            <div className="text-[10px] font-medium text-red-500/70 uppercase">
                              Deadline: {formatDate(data.fine.deadline)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                            {data.fine.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                            {data.fine.paid > 0
                              ? data.fine.paid.toLocaleString("en-IN")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-xs italic text-gray-400">
                            Automatically applied
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-black text-red-600">
                            {data.fine.due.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW (MANAGEMENT)
  const semesterWiseAdmin = {};
  for (let i = 1; i <= 8; i++) semesterWiseAdmin[i] = [];
  structures.forEach((s) => {
    if (semesterWiseAdmin[s.semester]) semesterWiseAdmin[s.semester].push(s);
  });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Admin Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-indigo-600" />
            Fee Management Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Define and clone fee structures across admission batches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCloneModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-200"
          >
            <Copy className="w-4 h-4" /> Clone Batch
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Category
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-500 uppercase">
            Filters:
          </span>
        </div>

        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-2 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(parseInt(e.target.value))}
          className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-2 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
        >
          <option value={2023}>Admission Batch 2023</option>
          <option value={2024}>Admission Batch 2024</option>
          <option value={2025}>Admission Batch 2025</option>
        </select>

        <button
          onClick={() =>
            dispatch(
              fetchFeeStructures({
                batch_year: selectedBatch,
                program_id: selectedProgram,
              })
            )
          }
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-400 ${status === "loading" ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Admin Management Grid */}
      <div className="grid grid-cols-1 gap-8">
        {Object.keys(semesterWiseAdmin).map((semNum) => {
          const sems = semesterWiseAdmin[semNum];
          if (sems.length === 0)
            return (
              <div
                key={semNum}
                className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-center"
              >
                <p className="text-gray-400 font-bold">
                  Semester {semNum} - No structures defined
                </p>
                <button
                  onClick={() => openAddStructure(parseInt(semNum))}
                  className="mt-2 text-indigo-600 text-sm font-black hover:underline"
                >
                  + ADD FEES
                </button>
              </div>
            );

          return (
            <div
              key={semNum}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">
                  Semester {semNum} Overview
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500">
                    {sems.length} Categories
                  </span>
                  <button
                    onClick={() =>
                      openDeadlineModal(
                        parseInt(semNum),
                        semesterConfigs.find(
                          (c) => c.semester === parseInt(semNum)
                        )
                      )
                    }
                    className="p-1 px-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black"
                  >
                    <Calendar className="w-3 h-3" /> DEADLINE
                  </button>
                  <button
                    onClick={() => openAddStructure(parseInt(semNum))}
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Fee Category</th>
                      <th className="px-6 py-4 text-right">Amount (₹)</th>
                      <th className="px-6 py-4">Applies To</th>
                      <th className="px-6 py-4 text-center">Optional</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {sems.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                          {s.category?.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-black text-indigo-600">
                          {parseFloat(s.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${s.applies_to === "all" ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}
                          >
                            {s.applies_to}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-bold text-gray-500">
                          {s.is_optional ? "Yes" : "No"}
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button
                            onClick={() => openEditStructure(s)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStructure(s.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Clone Fee Structure</h2>
            <p className="text-gray-500 text-sm mb-6">
              Copy all 8 semesters from batch {selectedBatch} to a new admission
              year.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                  From Batch
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl font-bold text-gray-500">
                  {selectedBatch}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                  To Batch (Destination)
                </label>
                <input
                  type="number"
                  value={cloneTargetBatch}
                  onChange={(e) =>
                    setCloneTargetBatch(parseInt(e.target.value))
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCloneModal(false)}
                className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}{" "}
                Clone Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add Fee Category</h2>
            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                  Category Name
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Lab Fees"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-xl font-bold transition-all"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editingStructure ? "Edit Fee" : "Add Fee"} Structure
            </h2>
            <form onSubmit={handleSaveStructure} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={structureForm.category_id}
                    onChange={(e) =>
                      setStructureForm({
                        ...structureForm,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Semester
                  </label>
                  <select
                    value={structureForm.semester}
                    onChange={(e) =>
                      setStructureForm({
                        ...structureForm,
                        semester: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        Semester {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Amount (₹)
                  </label>
                  <input
                    required
                    type="number"
                    value={structureForm.amount}
                    onChange={(e) =>
                      setStructureForm({
                        ...structureForm,
                        amount: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Applies To
                  </label>
                  <select
                    value={structureForm.applies_to}
                    onChange={(e) =>
                      setStructureForm({
                        ...structureForm,
                        applies_to: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                  >
                    <option value="all">All Students</option>
                    <option value="hostellers">Hostellers</option>
                    <option value="day_scholars">Day Scholars</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={structureForm.is_optional}
                      onChange={(e) =>
                        setStructureForm({
                          ...structureForm,
                          is_optional: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Optional Fee</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                >
                  {editingStructure ? "Save Changes" : "Create Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Deadline Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">
              Semester {selectedSemForDeadline} Deadlines
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Set the payment deadline and late fine for all dues in this
              semester.
            </p>

            <form onSubmit={handleSaveDeadline} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    required
                    type="date"
                    value={deadlineForm.due_date}
                    onChange={(e) =>
                      setDeadlineForm({
                        ...deadlineForm,
                        due_date: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Fine Type
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={deadlineForm.fine_type}
                      onChange={(e) =>
                        setDeadlineForm({
                          ...deadlineForm,
                          fine_type: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                    >
                      <option value="none">No Fine</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    {deadlineForm.fine_type === "percentage"
                      ? "Fine Percent (%)"
                      : "Fine Amount (₹)"}
                  </label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      disabled={deadlineForm.fine_type === "none"}
                      required={deadlineForm.fine_type !== "none"}
                      type="number"
                      value={deadlineForm.fine_amount}
                      onChange={(e) =>
                        setDeadlineForm({
                          ...deadlineForm,
                          fine_amount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeadlineModal(false)}
                  className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
