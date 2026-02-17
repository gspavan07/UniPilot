import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Copy,
  Filter,
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
  Search,
  User,
  X,
  Banknote,
  CheckCircle2,
  Upload,
  Mail,
  MessageSquare,
  Download,
  Wallet,
  ShieldCheck,
  History,
  Globe,
  Settings2,
  Trash,
  PauseCircle,
  PlayCircle,
  Award,
  StopCircle,
  Pencil,
  PieChartIcon,
} from "lucide-react";
import {
  fetchFeeStructures,
  fetchFeeCategories,
  createFeeCategory,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  cloneFeeStructure,
  fetchSemesterConfigs,
  updateSemesterConfig,
  fetchCollectionStats,
  fetchTransactions,
  fetchBatches,
  fetchStudentFeeStatus,
  createFeePayment,
  deleteStudentFine,
  fetchWaivers,
  applyWaiver,
  approveWaiver,
  updateWaiver,
  deleteWaiver,
  validateScholarshipImport,
  finalizeScholarshipImport,
  fetchDefaulters,
  sendReminders,
  fetchSections,
  imposeFine,
  fetchDailyCollection,
} from "../../store/slices/feeSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { printReceipt } from "../../utils/receiptGenerator";

const FeeManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    structures,
    categories,
    semesterConfigs,
    stats,
    transactions,
    transactionMeta,
    status,
    totalDues,
    batches,
    studentStatus,
    waivers,
    importPreview,
    defaulters,
    defaultersMeta,
    sections,
  } = useSelector((state) => state.fee);
  const { programs } = useSelector((state) => state.programs);
  const { departments } = useSelector((state) => state.departments);
  const { users: searchResults } = useSelector((state) => state.users);

  // Admin State
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [activeTab, setActiveTab] = useState(
    user?.role_data?.slug === "admin" || user?.role === "admin"
      ? "overview"
      : "counter",
  );
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [cloneTargetBatch, setCloneTargetBatch] = useState(
    new Date().getFullYear() + 1,
  );
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [selectedSemForDeadline, setSelectedSemForDeadline] = useState(null);
  const [deadlineForm, setDeadlineForm] = useState({
    due_date: "",
    fine_type: "none",
    fine_amount: "",
  });

  // Counter Payment State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCounterFees, setSelectedCounterFees] = useState(new Set());
  const [counterPaymentMethod, setCounterPaymentMethod] = useState("cash");
  const [counterReference, setCounterReference] = useState("");
  const getLocalISOString = () => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
  };

  const [counterPaymentDate, setCounterPaymentDate] =
    useState(getLocalISOString());
  const [counterRemarks, setCounterRemarks] = useState("");
  const [counterCustomAmounts, setCounterCustomAmounts] = useState({});
  const [activeCounterSemester, setActiveCounterSemester] = useState(null);

  // Form States
  const [categoryName, setCategoryName] = useState("");
  const [structureForm, setStructureForm] = useState({
    category_id: "",
    amount: "",
    semester: 1,
    applies_to: "all",
    is_optional: false,
    apply_to_all_semesters: false,
  });

  // Scholarship State
  const [scholarshipForm, setScholarshipForm] = useState({
    student_id: "",
    fee_category_id: "",
    waiver_type: "Scholarship",
    amount: "",
    is_approved: true,
    applies_to: "one_time",
    semester: "",
    value_type: "fixed",
    percentage: "",
  });
  const [scholarshipView, setScholarshipView] = useState("assigned"); // 'assigned' or 'new'
  const [editingWaiver, setEditingWaiver] = useState(null);

  // Fine State
  const [fineForm, setFineForm] = useState({
    category_id: "",
    amount: "",
    semester: "",
    remarks: "",
  });
  const [bulkScholarshipConfig, setBulkScholarshipConfig] = useState({
    fee_category_id: "",
    applies_to: "one_time",
    value_type: "fixed",
    amount: "",
    percentage: "",
  });

  // Reports / Insights State
  const [insightFilters, setInsightFilters] = useState({
    startDate: "",
    endDate: "",
    department_id: "",
    program_id: "",
    batch_year: "",
    payment_type: "all",
  });
  const [dailyReport, setDailyReport] = useState(null);

  const [localPreview, setLocalPreview] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Defaulter State
  const [defaulterFilters, setDefaulterFilters] = useState({
    min_due: 0,
    days_overdue: 0,
    program_id: "",
    department_id: "",
    semester: "",
    section: "",
  });
  const [selectedDefaulters, setSelectedDefaulters] = useState(new Set());
  const [reminderMode, setReminderMode] = useState("email");

  // Student Search State for Scholarship Form
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [searchedStudents, setSearchedStudents] = useState([]);

  // PERMISSIONS & ROLES
  const userRole = user?.role_data?.slug || user?.role;
  const permissions = user?.permissions || [];
  const hasPermission = (p) =>
    permissions.includes(p) ||
    userRole === "admin" ||
    userRole === "super_admin";

  const canViewOversight = hasPermission("finance:fees:oversight");
  const canAdminFees = hasPermission("finance:fees:admin");
  const canManageFees = hasPermission("finance:fees:manage");
  const isSuperAdmin = userRole === "admin" || userRole === "super_admin";

  useEffect(() => {
    dispatch(fetchFeeCategories());
    dispatch(fetchPrograms());
    dispatch(fetchCollectionStats());
    dispatch(fetchTransactions());
    dispatch(fetchBatches());
    dispatch(fetchDepartments());
    dispatch(
      fetchSections({
        batch_year: selectedBatch,
        program_id: selectedProgram,
        semester: defaulterFilters.semester,
      }),
    );
  }, [dispatch, selectedBatch, selectedProgram, defaulterFilters.semester]);

  useEffect(() => {
    if (activeTab === "scholarships") {
      dispatch(fetchWaivers());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (activeTab === "defaulters") {
      dispatch(
        fetchDefaulters({
          batch_year: selectedBatch,
          program_id: selectedProgram,
          ...defaulterFilters,
        }),
      );
    }
  }, [dispatch, activeTab, selectedBatch, selectedProgram, defaulterFilters]);

  useEffect(() => {
    if (activeTab === "insights") {
      dispatch(fetchDailyCollection(insightFilters)).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setDailyReport(res.payload);
        }
      });
    }
  }, [activeTab, insightFilters, dispatch]);

  // Sync import preview
  useEffect(() => {
    setLocalPreview(importPreview);
  }, [importPreview]);

  useEffect(() => {
    if (selectedProgram) {
      dispatch(
        fetchFeeStructures({
          batch_year: selectedBatch,
          program_id: selectedProgram,
        }),
      );
      dispatch(
        fetchSemesterConfigs({
          batch_year: selectedBatch,
          program_id: selectedProgram,
        }),
      );
    }
  }, [dispatch, selectedBatch, selectedProgram]);

  useEffect(() => {
    if (batches.length > 0 && !batches.includes(selectedBatch)) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, selectedBatch]);

  useEffect(() => {
    if (
      studentStatus?.semesterWise &&
      !activeCounterSemester &&
      selectedStudent
    ) {
      const semesters = Object.keys(studentStatus.semesterWise);
      if (semesters.length > 0) {
        setActiveCounterSemester(semesters[0]);
      }
    }
  }, [studentStatus, activeCounterSemester, selectedStudent]);

  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0].id);
    }
  }, [programs, selectedProgram]);

  // Trigger search for scholarship form
  useEffect(() => {
    if (studentSearch.length >= 3) {
      dispatch(fetchUsers({ role: "student", search: studentSearch }));
    }
  }, [studentSearch, dispatch]);
  // Sync search results to the scholarship dropdown
  useEffect(() => {
    setSearchedStudents(searchResults);
  }, [searchResults]);
  const handleClone = async () => {
    if (!selectedProgram) return;
    try {
      await dispatch(
        cloneFeeStructure({
          fromBatch: selectedBatch,
          toBatch: cloneTargetBatch,
          program_id: selectedProgram,
        }),
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

    // Use existing record values if editing, otherwise use current filters
    const data = {
      ...structureForm,
      batch_year: editingStructure?.batch_year || selectedBatch,
      program_id: editingStructure?.program_id || selectedProgram,
      amount: parseFloat(structureForm.amount),
    };
    if (!data.batch_year || !data.program_id) {
      alert("Please select a specific Batch and Program first.");
      return;
    }

    try {
      if (editingStructure) {
        await dispatch(
          updateFeeStructure({ id: editingStructure.id, data }),
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
        }),
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
        }),
      ).unwrap();
      dispatch(fetchCollectionStats());
      dispatch(fetchTransactions());
      setShowDeadlineModal(false);
    } catch (err) {
      console.error("Failed to save deadline", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    dispatch(fetchTransactions({ search: query }));
  };

  const handleStudentSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 3) {
      dispatch(fetchUsers({ role: "student", search: query }));
    }
  };

  const selectStudentForPayment = (student) => {
    setSelectedStudent(student);
    setSearchQuery("");
    dispatch(fetchStudentFeeStatus(student.id));
    setSelectedCounterFees(new Set());
    setCounterCustomAmounts({});
    setActiveCounterSemester(null);
  };

  const handleApplyScholarship = async (e) => {
    e.preventDefault();
    if (!scholarshipForm.student_id || !scholarshipForm.fee_category_id) return;
    try {
      await dispatch(applyWaiver(scholarshipForm)).unwrap();
      setScholarshipForm({
        ...scholarshipForm,
        amount: "",
        percentage: "",
        semester: "",
      });
      dispatch(fetchWaivers()); // Refresh list
      dispatch(fetchCollectionStats());
    } catch (err) {
      console.error("Failed to apply scholarship", err);
    }
  };

  const handleDeleteWaiver = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this scholarship? This will recalculate the student's dues immediately.",
      )
    )
      return;
    try {
      await dispatch(deleteWaiver(id)).unwrap();
      dispatch(fetchCollectionStats());
    } catch (err) {
      console.error("Failed to delete scholarship", err);
    }
  };

  const handleToggleWaiverStatus = async (waiver) => {
    try {
      await dispatch(
        updateWaiver({
          id: waiver.id,
          data: { is_active: !waiver.is_active },
        }),
      ).unwrap();
      dispatch(fetchCollectionStats());
    } catch (err) {
      console.error("Failed to toggle scholarship status", err);
    }
  };

  const handleSaveWaiverEdit = async (id, data) => {
    try {
      await dispatch(updateWaiver({ id, data })).unwrap();
      setEditingWaiver(null);
      dispatch(fetchCollectionStats());
    } catch (err) {
      console.error("Failed to update scholarship", err);
    }
  };

  const handleFastTrackJVD = async (student) => {
    const tuitionCat = categories.find((c) =>
      c.name.toLowerCase().includes("tuition"),
    );
    if (!tuitionCat) {
      alert("Tuition Fee category not found.");
      return;
    }

    // Fetch status to get total tuition
    const status = await dispatch(fetchStudentFeeStatus(student.id)).unwrap();

    let totalTuition = 0;
    Object.values(status.semesterWise).forEach((sem) => {
      sem.fees.forEach((f) => {
        if (f.category_id === tuitionCat.id) totalTuition += f.payable;
      });
    });

    if (totalTuition === 0) {
      alert("No tuition fee structure found.");
      return;
    }

    try {
      await dispatch(
        applyWaiver({
          student_id: student.id,
          fee_category_id: tuitionCat.id,
          waiver_type: "JVD Scholarship",
          amount: 0, // Not used for percentage-based
          is_approved: true,
          applies_to: "all_semesters",
          value_type: "percentage",
          percentage: 100,
        }),
      ).unwrap();
      dispatch(fetchCollectionStats());
      dispatch(fetchWaivers());
    } catch (err) {
      console.error("Failed to apply JVD", err);
    }
  };

  const toggleCounterFeeSelection = (feeId, fullDue) => {
    const next = new Set(selectedCounterFees);
    if (next.has(feeId)) {
      next.delete(feeId);
      const newAmounts = { ...counterCustomAmounts };
      delete newAmounts[feeId];
      setCounterCustomAmounts(newAmounts);
    } else {
      next.add(feeId);
      setCounterCustomAmounts((prev) => ({ ...prev, [feeId]: fullDue }));
    }
    setSelectedCounterFees(next);
  };

  const handleCounterAmountChange = (feeId, val, maxLimit) => {
    const amount = parseFloat(val) || 0;
    if (amount < 0) return;
    if (amount > maxLimit) return;
    setCounterCustomAmounts((prev) => ({ ...prev, [feeId]: amount }));
  };

  const calculateCounterSelectedTotal = () => {
    let total = 0;
    selectedCounterFees.forEach((feeId) => {
      total += counterCustomAmounts[feeId] || 0;
    });
    return total;
  };

  const handleImposeFine = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !fineForm.category_id || !fineForm.amount) return;

    try {
      await dispatch(
        imposeFine({
          student_id: selectedStudent.id,
          ...fineForm,
        }),
      ).unwrap();
      alert("Fine/Charge imposed successfully!");
      setFineForm({ category_id: "", amount: "", semester: "", remarks: "" });
      dispatch(fetchStudentFeeStatus(selectedStudent.id)); // Refresh ledger
    } catch (err) {
      alert("Failed to impose fine: " + err);
    }
  };

  const handleDeleteFine = async (fineId) => {
    if (window.confirm("Are you sure you want to remove this fine?")) {
      try {
        await dispatch(deleteStudentFine(fineId)).unwrap();
        // Refresh student status to reflect removal
        if (selectedStudent) {
          dispatch(fetchStudentFeeStatus(selectedStudent.id));
        }
        // Remove from selection if present
        if (selectedCounterFees.has(fineId)) {
          const newSet = new Set(selectedCounterFees);
          newSet.delete(fineId);
          setSelectedCounterFees(newSet);
        }
      } catch (err) {
        alert("Failed to delete fine: " + err);
      }
    }
  };

  const handleRecordCounterPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || selectedCounterFees.size === 0) return;

    try {
      const paymentBatch = [];
      Object.entries(studentStatus.semesterWise).forEach(([sem, data]) => {
        data.fees.forEach((f) => {
          if (selectedCounterFees.has(f.id)) {
            paymentBatch.push({
              type: f.is_charge ? "charge" : "structure",
              structure_id: f.id,
              amount: counterCustomAmounts[f.id] || f.due,
              semester: parseInt(sem),
            });
          }
        });
        if (selectedCounterFees.has(`fine:${sem}`)) {
          paymentBatch.push({
            type: "fine",
            semester: parseInt(sem),
            amount: counterCustomAmounts[`fine:${sem}`] || data.fine.due,
          });
        }
      });

      const result = await dispatch(
        createFeePayment({
          student_id: selectedStudent.id,
          payments: paymentBatch,
          payment_method: counterPaymentMethod,
          transaction_id: counterReference || `CTR-${Date.now()}`,
          remarks: counterRemarks || "Direct Counter Payment",
          payment_date: counterPaymentDate,
        }),
      ).unwrap();

      // Configure success modal data
      // Flatten the hierarchical response (Parents -> Children)
      let allItems = [];
      let totalPaid = 0;

      result.forEach((parent) => {
        totalPaid += parseFloat(parent.amount_paid);
        allItems = [...allItems, ...flattenTransactionItems(parent)];
      });

      setPaymentSuccess({
        transaction_id: result[0]?.transaction_id || counterReference,
        student: selectedStudent,
        amount_paid: totalPaid,
        payment_date: counterPaymentDate,
        payment_method: counterPaymentMethod,
        // For simple display, just pick the first category name
        fee_structure:
          allItems.length > 0
            ? allItems[0].fee_structure
            : { category: { name: "Fee Payment" } },
        semester: result.length === 1 ? result[0].semester : "Multi",
        remarks: counterRemarks,
        items: allItems, // Pass flattened items
      });

      dispatch(fetchCollectionStats());
      dispatch(fetchTransactions());
    } catch (err) {
      alert("Failed to record payment: " + err);
    }
  };

  const resetCounterForm = () => {
    setSelectedStudent(null);
    setSelectedCounterFees(new Set());
    setCounterCustomAmounts({});
    setActiveCounterSemester(null);
    setCounterReference("");
    setCounterRemarks("");
    setCounterPaymentDate(getLocalISOString());
    dispatch(fetchStudentFeeStatus(null)); // Clear status
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await dispatch(validateScholarshipImport(file)).unwrap();
    } catch (err) {
      alert("Failed to validate file: " + err);
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleEditPreviewRow = (index, field, value) => {
    const updated = [...localPreview];
    updated[index] = { ...updated[index], [field]: value };

    // Re-check status if amount or category is changed
    if (
      field === "amount" ||
      field === "fee_category_id" ||
      field === "student_id"
    ) {
      const errors = [];
      if (!updated[index].student_id) errors.push("Student missing");
      if (!updated[index].fee_category_id) errors.push("Category missing");
      if (!updated[index].amount || isNaN(updated[index].amount))
        errors.push("Invalid amount");
      updated[index].status = errors.length > 0 ? "error" : "valid";
      updated[index].errors = errors;
    }

    setLocalPreview(updated);
  };

  const handleBulkApplyToPreview = () => {
    if (!bulkScholarshipConfig.fee_category_id) {
      alert("Please select a category first.");
      return;
    }

    const updated = localPreview.map((row) => {
      const newRow = {
        ...row,
        fee_category_id: bulkScholarshipConfig.fee_category_id,
        applies_to: bulkScholarshipConfig.applies_to,
        value_type: bulkScholarshipConfig.value_type,
        amount:
          bulkScholarshipConfig.value_type === "fixed"
            ? bulkScholarshipConfig.amount
            : 0,
        percentage:
          bulkScholarshipConfig.value_type === "percentage"
            ? bulkScholarshipConfig.percentage
            : null,
      };

      const errors = [];
      if (!newRow.student_id) errors.push("Student missing");
      if (!newRow.fee_category_id) errors.push("Category missing");

      newRow.status = errors.length > 0 ? "error" : "valid";
      newRow.errors = errors;
      return newRow;
    });

    setLocalPreview(updated);
  };

  const handleFinalImport = async () => {
    const validRecords = localPreview.filter(
      (r) => r.status === "valid" && r.fee_category_id,
    );
    if (validRecords.length === 0) {
      alert(
        "No valid records to import. Make sure you have assigned categories to the students (use the Bulk Apply tool or edit individual rows).",
      );
      return;
    }

    try {
      await dispatch(finalizeScholarshipImport(validRecords)).unwrap();
      alert(`Successfully imported ${validRecords.length} scholarships!`);
      dispatch(fetchWaivers());
      dispatch(fetchCollectionStats());
      setLocalPreview([]);
    } catch (err) {
      alert("Import failed: " + err);
    }
  };

  const handleSendBulkReminders = async () => {
    if (selectedDefaulters.size === 0) return;
    try {
      await dispatch(
        sendReminders({
          student_ids: Array.from(selectedDefaulters),
          mode: reminderMode,
        }),
      ).unwrap();
      alert(
        `${reminderMode.toUpperCase()} reminders sent to ${selectedDefaulters.size} students.`,
      );
      setSelectedDefaulters(new Set());
    } catch (err) {
      alert("Failed to send reminders: " + err);
    }
  };

  const handleExportDefaulters = () => {
    const params = new URLSearchParams({
      ...defaulterFilters,
      batch_year: selectedBatch,
      program_id: selectedProgram,
    });
    // Direct download via window.open using the authenticated session (assuming cookie/token)
    // Since this is an SPA with potential token headers, window.open might not carry headers if not cookies.
    // However, for simplicity let's assume standard session or we use fetch+blob.
    // Let's use the fetch+blob approach for safety with headers.

    const download = async () => {
      try {
        const response = await api.get("/fees/defaulters/export", {
          params: {
            ...defaulterFilters,
            batch_year: selectedBatch,
            program_id: selectedProgram,
          },
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `defaulters_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (err) {
        console.error(err);
        alert("Export failed");
      }
    };
    download();
  };

  const handleDownloadTemplate = (type = "full") => {
    let headers, samples;
    if (type === "minimal") {
      headers = "RegNo,StudentName\n";
      samples = "24001,John Doe\n24002,Jane Smith\n24003,Bob Wilson\n";
    } else {
      headers =
        "RegNo,StudentName,FeeCategory,ScholarshipType,Amount,AppliesTo,Semester,ValueType,Percentage\n";
      headers =
        "RegNo,StudentName,FeeCategory,ScholarshipType,Amount,AppliesTo,Semester,ValueType,Percentage\n";
      samples = [
        "24001,John Doe,Tuition Fee,JVD Scholarship,0,all_semesters,,percentage,100",
        "24002,Jane Smith,Tuition Fee,Academic Excellence,10000,one_time,,,",
        "24003,Bob Wilson,Library Fee,Term Waiver,1000,specific_semester,2,,",
      ].join("\n");
    }
    const blob = new Blob([headers + samples], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scholarship_import_template.csv";
    a.click();
  };

  const openAddStructure = (semNum) => {
    setEditingStructure(null);
    setStructureForm({
      category_id: categories[0]?.id || "",
      amount: "",
      semester: semNum || 1,
      applies_to: "all",
      is_optional: false,
      apply_to_all_semesters: false,
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

  const getPaymentDetails = (t) => {
    let category = "AD-HOC PAYMENT";
    let semester = "N/A";

    if (t.academic_fee_payments?.length > 0) {
      const firstItem = t.academic_fee_payments[0];
      category = firstItem.fee_structure?.category?.name || "Academic Fee";
      semester =
        firstItem.semester || firstItem.fee_structure?.semester || "N/A";
      if (t.academic_fee_payments.length > 1) {
        category += ` (+${t.academic_fee_payments.length - 1} more)`;
      }
    } else if (t.student_charge_payments?.length > 0) {
      const firstItem = t.student_charge_payments[0];
      category = firstItem.fee_charge?.category?.name || "Fine/Charge";
      semester = firstItem.semester || "Charge";
      if (t.student_charge_payments.length > 1) {
        category += ` (+${t.student_charge_payments.length - 1} more)`;
      }
    } else if (t.fee_structure?.category?.name) {
      category = t.fee_structure.category.name;
      semester = t.fee_structure.semester;
    } else if (t.student_fee_charge?.category?.name) {
      category = t.student_fee_charge.category.name;
      semester = "Charge";
    } else if (t.exam_payment) {
      if (t.exam_payment.category === "reverification") {
        category = "Exam Reverification Fee";
      } else if (t.exam_payment.category === "registration") {
        category = "Exam Registration Fee";
      } else {
        category = "Exam Fee";
      }
      semester = t.exam_payment.cycle?.name || "Cycle";
    } else if (t.semester && !t.fee_structure_id) {
      category = "LATE PAYMENT FINE";
      semester = t.semester;
    }

    return { category, semester };
  };

  const flattenTransactionItems = (t) => {
    let items = [];
    // 1. Academic Fee Payments
    if (t.academic_fee_payments?.length > 0) {
      t.academic_fee_payments.forEach((child) => {
        items.push({
          ...child,
          amount_paid: child.amount,
          payment_date: t.payment_date,
          transaction_id: t.transaction_id,
          payment_method: t.payment_method,
          fee_structure: child.structure,
          semester: child.structure?.semester || t.semester,
          student: t.student || selectedStudent,
          remarks: t.remarks,
        });
      });
    }

    // 2. Student Charge Payments
    if (t.student_charge_payments?.length > 0) {
      t.student_charge_payments.forEach((child) => {
        items.push({
          ...child,
          amount_paid: child.amount,
          payment_date: t.payment_date,
          transaction_id: t.transaction_id,
          payment_method: t.payment_method,
          fee_structure: {
            category: child.charge?.category || { name: "Charge/Fine" },
          },
          semester: child.charge?.semester || t.semester,
          student: t.student || selectedStudent,
          remarks: t.remarks,
        });
      });
    }

    // 3. Handle gaps/adhoc
    const childTotal = items.reduce(
      (sum, i) => sum + parseFloat(i.amount_paid || 0),
      0,
    );
    const gap = parseFloat(t.amount_paid) - childTotal;
    if (gap > 0.01) {
      items.push({
        id: `adhoc-${t.id}`,
        amount_paid: gap,
        payment_date: t.payment_date,
        transaction_id: t.transaction_id,
        payment_method: t.payment_method,
        fee_structure: {
          category: {
            name: t.remarks?.includes("Fine") ? "Late Fine" : "Ad-hoc Payment",
          },
        },
        semester: t.semester || "N/A",
        student: t.student || selectedStudent,
        remarks: t.remarks,
      });
    }

    // Fallback if no children (single structure legacy record)
    if (items.length === 0) {
      items.push({
        ...t,
        fee_structure: t.fee_structure || {
          category: { name: "Fee Payment" },
        },
        student: t.student || selectedStudent,
      });
    }

    return items;
  };

  // ADMIN VIEW HELPER FUNCTIONS
  const renderOverviewTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Quick Actions & Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Collection",
            value: formatCurrency(stats?.totalCollected || 0),
            icon: CircleDollarSign,
            color: "from-blue-500 to-indigo-600",
            sub: "Lifetime",
          },
          {
            label: "Collected Today",
            value: formatCurrency(stats?.todayCollected || 0),
            icon: RefreshCw,
            color: "from-emerald-500 to-teal-600",
            sub: "Daily",
          },
          {
            label: "Active Programs",
            value: programs.length,
            icon: LayoutGrid,
            color: "from-purple-500 to-violet-600",
            sub: "Academic",
          },
          {
            label: "Pending Dues",
            value: formatCurrency(totalDues || 0),
            icon: AlertCircle,
            color: "from-amber-500 to-orange-600",
            sub: "Outstanding",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {stat.sub}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-bold text-black dark:text-white truncate">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Quick Management Shortcuts */}
      {canAdminFees && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab("structure")}
            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Fee Structure
                </p>
                <p className="text-xs text-gray-500">Create fee structure</p>
              </div>
            </div>
          </button>

          {/* <button
            onClick={() => setShowCategoryModal(true)}
            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-pink-500 transition-all"
            >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  New Category
                </p>
                <p className="text-xs text-gray-500">Define fee type</p>
              </div>
            </div>
          </button> */}

          <button
            onClick={() => setActiveTab("defaulters")}
            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-500 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Check Defaulters
                </p>
                <p className="text-xs text-gray-500">View pending dues</p>
              </div>
            </div>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Program-wise chart */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Collection by Program
              </h3>
              <p className="text-xs text-gray-500">
                Revenue distribution across academic programs
              </p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.programWise || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="program_name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Method-wise chart */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Modes
              </h3>
              <p className="text-xs text-gray-500">Transaction methods</p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(stats?.methodWise || []).map((m) => ({
                    ...m,
                    total: parseFloat(m.total),
                  }))}
                  dataKey="total"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {(stats?.methodWise || []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#4f46e5",
                          "#10b981",
                          "#f59e0b",
                          "#ec4899",
                          "#6366f1",
                        ][index % 5]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {(stats?.methodWise || []).map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: [
                        "#4f46e5",
                        "#10b981",
                        "#f59e0b",
                        "#ec4899",
                        "#6366f1",
                      ][idx % 5],
                    }}
                  />
                  <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {entry.payment_method}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(entry.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCounterPaymentTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Search & Selection Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Step 1: Find Student
          </h4>
          <div className="relative mb-4">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleStudentSearch}
              placeholder="Reg No or Name..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {searchQuery.length >= 3 && searchResults.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectStudentForPayment(s)}
                  className="w-full text-left p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 group"
                >
                  <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600">
                    {s.first_name} {s.last_name}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase">
                    {s.student_id || s.registration_no} • {s.program?.code}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-indigo-200 shadow-sm">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </div>
                    <div className="text-[10px] font-black text-indigo-500 uppercase">
                      {selectedStudent.student_id ||
                        selectedStudent.registration_no}
                    </div>
                  </div>
                </div>

                {studentStatus?.grandTotals?.excessBalance > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] font-black text-amber-600 uppercase">
                        Credit Balance
                      </span>
                    </div>
                    <span className="text-xs font-black text-amber-700">
                      ₹{" "}
                      {studentStatus.grandTotals.excessBalance.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-[10px] font-black text-red-500 uppercase hover:underline w-full text-center mt-4"
                >
                  Clear Selection
                </button>
              </>
            </div>
          )}
        </div>
      </div>

      {/* Dues & Payment Form Section */}
      <div className="lg:col-span-2 space-y-6">
        {selectedStudent ? (
          <>
            {/* Dues Selection Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Step 2: Selection & Partial Amounts
                </h4>
                <div className="text-[10px] font-black text-indigo-600 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 rounded-full shadow-sm">
                  {selectedCounterFees.size} Items • Total: ₹
                  {calculateCounterSelectedTotal().toLocaleString("en-IN")}
                </div>
              </div>

              {/* Semester Tabs for Counter */}
              <div className="flex overflow-x-auto gap-2 p-4 bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700 scrollbar-hide">
                {studentStatus?.semesterWise &&
                  Object.keys(studentStatus.semesterWise).map((sem) => {
                    const isActive = activeCounterSemester === sem;
                    return (
                      <button
                        key={sem}
                        onClick={() => setActiveCounterSemester(sem)}
                        className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border ${isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-indigo-200"
                          }`}
                      >
                        Semester {sem}
                      </button>
                    );
                  })}
              </div>

              <div className="p-6">
                {activeCounterSemester &&
                  studentStatus?.semesterWise?.[activeCounterSemester] ? (
                  <div className="space-y-4">
                    {/* Fees List */}
                    <div className="space-y-3">
                      {studentStatus.semesterWise[activeCounterSemester].fees
                        // .filter((f) => f.due === 0)
                        .map((fee) => (
                          <div
                            key={fee.id}
                            className={`p-4 rounded-2xl border transition-all ${selectedCounterFees.has(fee.id)
                              ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-900/30 shadow-sm"
                              : "bg-gray-50/50 border-gray-100 dark:bg-gray-900/20 dark:border-gray-700"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCounterFees.has(fee.id)}
                                  disabled={fee.due === 0}
                                  onChange={() =>
                                    toggleCounterFeeSelection(fee.id, fee.due)
                                  }
                                  className={`w-5 h-4 rounded border-indigo-600 text-indigo-600 focus:ring-indigo-500 ${fee.due === 0 ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}`}
                                />
                                <div>
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {fee.category}
                                  </div>

                                  <div className="text-[10px] font-black text-gray-400 uppercase">
                                    Balance Due: ₹
                                    {fee.due.toLocaleString("en-IN")}
                                  </div>
                                </div>
                                {fee.due === 0 && (
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    Paid
                                  </span>
                                )}
                              </div>

                              {selectedCounterFees.has(fee.id) && (
                                <div className="relative animate-in zoom-in-95">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    value={counterCustomAmounts[fee.id] ?? ""}
                                    onChange={(e) =>
                                      handleCounterAmountChange(
                                        fee.id,
                                        e.target.value,
                                        fee.due,
                                      )
                                    }
                                    placeholder="0.00"
                                    className="w-32 pl-7 pr-3 py-2 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-xl text-sm font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                  />
                                </div>
                              )}

                              {fee.is_charge && (
                                <button
                                  onClick={() => handleDeleteFine(fee.id)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove Fine"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                      {/* Fines */}
                      {studentStatus.semesterWise[activeCounterSemester].fine
                        .due > 0 && (
                          <div
                            className={`p-4 rounded-2xl border transition-all ${selectedCounterFees.has(
                              `fine:${activeCounterSemester}`,
                            )
                              ? "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30 shadow-sm"
                              : "bg-red-50/20 border-red-100 dark:bg-red-900/5 dark:border-red-900/20"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedCounterFees.has(
                                    `fine:${activeCounterSemester}`,
                                  )}
                                  onChange={() =>
                                    toggleCounterFeeSelection(
                                      `fine:${activeCounterSemester}`,
                                      studentStatus.semesterWise[
                                        activeCounterSemester
                                      ].fine.due,
                                    )
                                  }
                                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                                <div>
                                  <div className="text-sm font-bold text-red-600 dark:text-red-400">
                                    Late Payment Fine
                                  </div>
                                  <div className="text-[10px] font-black text-red-400/70 uppercase">
                                    Balance Due: ₹
                                    {studentStatus.semesterWise[
                                      activeCounterSemester
                                    ].fine.due.toLocaleString("en-IN")}
                                  </div>
                                </div>
                              </div>
                              {selectedCounterFees.has(
                                `fine:${activeCounterSemester}`,
                              ) && (
                                  <div className="relative animate-in zoom-in-95">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-400">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      value={
                                        counterCustomAmounts[
                                        `fine:${activeCounterSemester}`
                                        ] ?? ""
                                      }
                                      onChange={(e) =>
                                        handleCounterAmountChange(
                                          `fine:${activeCounterSemester}`,
                                          e.target.value,
                                          studentStatus.semesterWise[
                                            activeCounterSemester
                                          ].fine.due,
                                        )
                                      }
                                      placeholder="0.00"
                                      className="w-32 pl-7 pr-3 py-2 bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-900/50 rounded-xl text-sm font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                    </div>

                    {!studentStatus.semesterWise[
                      activeCounterSemester
                    ].fees.some((f) => f.due > 0) &&
                      studentStatus.semesterWise[activeCounterSemester].fine
                        .due <= 0 && (
                        <div className="py-12 text-center text-gray-400 italic text-sm">
                          All dues for this semester are cleared.
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">
                      Select a semester above to view pending dues.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details Form */}
            {selectedCounterFees.size > 0 && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Step 3: Recording Details
                </h4>

                <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="flex gap-8">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                          Gross Selection
                        </div>
                        <div className="text-lg font-black text-gray-900 dark:text-white">
                          ₹
                          {calculateCounterSelectedTotal().toLocaleString(
                            "en-IN",
                          )}
                        </div>
                      </div>

                      {studentStatus.grandTotals.excessBalance > 0 && (
                        <div>
                          <div className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-1">
                            Wallet Credit
                          </div>
                          <div className="text-lg font-black text-amber-600">
                            - ₹
                            {Math.min(
                              calculateCounterSelectedTotal(),
                              studentStatus.grandTotals.excessBalance,
                            ).toLocaleString("en-IN")}
                          </div>
                        </div>
                      )}

                      <div className="border-l border-indigo-100 dark:border-indigo-900/40 h-10 hidden md:block"></div>

                      <div>
                        <div className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mb-1">
                          Net Collection
                        </div>
                        <div className="text-lg font-black text-indigo-600">
                          ₹
                          {Math.max(
                            0,
                            calculateCounterSelectedTotal() -
                            studentStatus.grandTotals.excessBalance,
                          ).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {calculateCounterSelectedTotal() >
                      studentStatus.grandTotals.excessBalance && (
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                          Collect Cash/Transfer for the rest
                        </div>
                      )}
                  </div>
                </div>

                <form
                  onSubmit={handleRecordCounterPayment}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["cash"].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setCounterPaymentMethod(method)}
                          className={`p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${counterPaymentMethod === method
                            ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                            : "border-gray-100 text-gray-400 hover:border-indigo-200"
                            }`}
                        >
                          {method.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                        Reference / Cheque No
                      </label>
                      <input
                        type="text"
                        value={counterReference}
                        onChange={(e) => setCounterReference(e.target.value)}
                        placeholder={
                          counterPaymentMethod === "cash"
                            ? "Optional"
                            : "Required"
                        }
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                        Collection Date
                      </label>
                      <input
                        type="datetime-local"
                        value={counterPaymentDate}
                        onChange={(e) => setCounterPaymentDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={counterRemarks}
                      onChange={(e) => setCounterRemarks(e.target.value)}
                      rows="2"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold resize-none shadow-inner"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 text-sm"
                    >
                      {status === "loading" ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Banknote className="w-5 h-5" />
                      )}
                      Finalize Payment Recording
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/5 p-12 rounded-xl border-2 border-dashed border-indigo-100 dark:border-indigo-900/20 text-center">
            <User className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-indigo-300">
              Select a student to start recording payments
            </h3>
            <p className="text-sm text-indigo-200 mt-2">
              The counter terminal allows manual fee collection for cash, bank
              transfers, and cheques.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderScholarshipImportPreview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            Import Preview
          </h3>
          <p className="text-sm text-gray-500">
            Review and edit records before final confirmation.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setLocalPreview([])}
            className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalImport}
            className="px-6 py-2 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
          >
            Confirm & Import{" "}
            {localPreview.filter((r) => r.status === "valid").length} Records
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Bulk Apply Settings to All Rows
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
              Category
            </label>
            <select
              value={bulkScholarshipConfig.fee_category_id}
              onChange={(e) =>
                setBulkScholarshipConfig({
                  ...bulkScholarshipConfig,
                  fee_category_id: e.target.value,
                })
              }
              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs font-bold"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
              Scope
            </label>
            <select
              value={bulkScholarshipConfig.applies_to}
              onChange={(e) =>
                setBulkScholarshipConfig({
                  ...bulkScholarshipConfig,
                  applies_to: e.target.value,
                })
              }
              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs font-bold"
            >
              <option value="one_time">One Time</option>
              <option value="all_semesters">All Semesters</option>
              <option value="specific_semester">Specific Sem</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
              Value Type
            </label>
            <select
              value={bulkScholarshipConfig.value_type}
              onChange={(e) =>
                setBulkScholarshipConfig({
                  ...bulkScholarshipConfig,
                  value_type: e.target.value,
                })
              }
              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs font-bold"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
              Amount / %
            </label>
            <input
              type="number"
              value={
                bulkScholarshipConfig.value_type === "fixed"
                  ? bulkScholarshipConfig.amount
                  : bulkScholarshipConfig.percentage
              }
              onChange={(e) =>
                setBulkScholarshipConfig({
                  ...bulkScholarshipConfig,
                  [bulkScholarshipConfig.value_type === "fixed"
                    ? "amount"
                    : "percentage"]: e.target.value,
                })
              }
              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs font-bold"
            />
          </div>
          <button
            onClick={handleBulkApplyToPreview}
            className="py-2 bg-indigo-100 text-indigo-600 font-black uppercase text-[10px] rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Apply to All
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reg No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4 text-right">Value Type</th>
                <th className="px-6 py-4 text-right">Amount / %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {localPreview.map((row, idx) => (
                <tr
                  key={idx}
                  className={row.status === "error" ? "bg-red-50/30" : ""}
                >
                  <td className="px-6 py-4">
                    {row.status === "valid" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase">
                        <AlertCircle className="w-4 h-4" />{" "}
                        {row.errors?.[0] || "Error"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={row.student_id || row.regNo}
                      onChange={(e) =>
                        handleEditPreviewRow(idx, "student_id", e.target.value)
                      }
                      className="bg-transparent border-none text-sm font-bold w-32 focus:ring-0"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">
                    {row.studentName || row.student_name}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={row.fee_category_id}
                      onChange={(e) =>
                        handleEditPreviewRow(
                          idx,
                          "fee_category_id",
                          e.target.value,
                        )
                      }
                      className="bg-transparent border-none text-sm font-bold focus:ring-0"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black uppercase">
                    {row.applies_to}
                  </td>
                  <td className="px-6 py-4 text-right text-[10px] font-black uppercase">
                    {row.value_type}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600">
                    {row.value_type === "fixed"
                      ? `₹${row.amount}`
                      : `${row.percentage}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGrantScholarshipForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
            Grant New Scholarship
          </h4>
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                Find Student
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Student ID or Name..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold shadow-inner"
                />
              </div>

              {showStudentDropdown &&
                studentSearch.length >= 3 &&
                searchedStudents.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto">
                    {searchedStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => {
                          setScholarshipForm({
                            ...scholarshipForm,
                            student_id: student.id,
                          });
                          setStudentSearch(
                            `${student.first_name} ${student.last_name}`,
                          );
                          setShowStudentDropdown(false);
                        }}
                        className="p-4 hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 transition-colors"
                      >
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase">
                          {student.student_id} • {student.program?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {scholarshipForm.student_id && (
              <form
                onSubmit={handleApplyScholarship}
                className="space-y-6 pt-4 border-t border-gray-50 dark:border-gray-700"
              >
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                    Fee Category
                  </label>
                  <select
                    value={scholarshipForm.fee_category_id}
                    onChange={(e) =>
                      setScholarshipForm({
                        ...scholarshipForm,
                        fee_category_id: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold shadow-inner"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                      Value Type
                    </label>
                    <select
                      value={scholarshipForm.value_type}
                      onChange={(e) =>
                        setScholarshipForm({
                          ...scholarshipForm,
                          value_type: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold shadow-inner"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                      {scholarshipForm.value_type === "fixed"
                        ? "Amount (₹)"
                        : "Percent (%)"}
                    </label>
                    <input
                      type="number"
                      value={
                        scholarshipForm.value_type === "fixed"
                          ? scholarshipForm.amount
                          : scholarshipForm.percentage
                      }
                      onChange={(e) =>
                        setScholarshipForm({
                          ...scholarshipForm,
                          [scholarshipForm.value_type === "fixed"
                            ? "amount"
                            : "percentage"]: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold shadow-inner"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-700 transition-all text-[10px]"
                >
                  Grant Scholarship
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700 border-dashed relative group overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            accept=".csv, .xlsx, .xls"
          />
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-indigo-500" />
            </div>
            <h5 className="text-base font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">
              Bulk Import
            </h5>
            <p className="text-xs text-gray-400 mt-2 font-bold px-4">
              Drop Excel or CSV here
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssignedScholarships = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
        <div>
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
            Institutional Scholarship Board
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Manage, Edit, or Discontinue assigned scholarships
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(fetchWaivers())}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${status === "loading" ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50/20 dark:bg-gray-900/20">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {waivers.map((w) => (
              <tr
                key={w.id}
                className={`group hover:bg-indigo-50/30 dark:hover:bg-gray-700/30 transition-colors ${!w.is_active ? "opacity-60" : ""}`}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-black text-gray-900 dark:text-white capitalize">
                    {w.student?.first_name} {w.student?.last_name}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase">
                    {w.student?.student_id}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-500">
                  {w.category?.name}
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {w.waiver_type}
                </td>
                <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">
                  {w.value_type === "percentage"
                    ? `${w.percentage}%`
                    : `₹${parseFloat(w.amount).toLocaleString("en-IN")}`}
                </td>
                <td className="px-6 py-4 text-center">
                  {w.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase">
                      <StopCircle className="w-3 h-3" /> Stopped
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleWaiverStatus(w)}
                      className={`p-2 rounded-xl transition-all ${w.is_active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                    >
                      {w.is_active ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteWaiver(w.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {waivers.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-[10px]"
                >
                  No active scholarships found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderScholarshipsTab = () => {
    if (localPreview.length > 0) return renderScholarshipImportPreview();

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Navigation / Mode Switcher */}
        <div className="flex bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 w-fit">
          <button
            onClick={() => setScholarshipView("assigned")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${scholarshipView === "assigned"
              ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-700"
              : "text-gray-400 hover:text-indigo-600"
              }`}
          >
            <History className="w-4 h-4" />
            Assigned Board
          </button>
          <button
            onClick={() => setScholarshipView("new")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${scholarshipView === "new"
              ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-700"
              : "text-gray-400 hover:text-indigo-600"
              }`}
          >
            <Plus className="w-4 h-4" />
            Grant New
          </button>
        </div>

        {scholarshipView === "assigned"
          ? renderAssignedScholarships()
          : renderGrantScholarshipForm()}
      </div>
    );
  };

  const renderInsightsTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 relative min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onChange={handleSearch}
                placeholder="Search Ledger (Global)..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  dispatch(fetchTransactions());
                  dispatch(fetchDailyCollection(insightFilters));
                }}
                className="p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-400 ${status === "loading" ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => {
                  setInsightFilters({
                    startDate: "",
                    endDate: "",
                    department_id: "",
                    program_id: "",
                    batch_year: "",
                    payment_type: "all", // Reset payment_type as well
                  });
                  dispatch(fetchTransactions());
                }}
                className="p-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 rounded-2xl transition-all text-red-500"
                title="Clear All Filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Start Date */}
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={insightFilters.startDate}
                onChange={(e) =>
                  setInsightFilters({
                    ...insightFilters,
                    startDate: e.target.value,
                  })
                }
                className="bg-transparent border-none text-xs font-black w-full focus:ring-0"
              />
            </div>
            {/* End Date */}
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={insightFilters.endDate}
                onChange={(e) =>
                  setInsightFilters({
                    ...insightFilters,
                    endDate: e.target.value,
                  })
                }
                className="bg-transparent border-none text-xs font-black w-full focus:ring-0"
              />
            </div>
            {/* Dept */}
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">
                Department
              </label>
              <select
                value={insightFilters.department_id}
                onChange={(e) =>
                  setInsightFilters({
                    ...insightFilters,
                    department_id: e.target.value,
                  })
                }
                className="bg-transparent border-none text-xs font-black w-full focus:ring-0 appearance-none"
              >
                <option value="">All Depts</option>
                {departments
                  .filter((d) => d.type === "academic")
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>
            {/* Program */}
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">
                Program
              </label>
              <select
                value={insightFilters.program_id}
                onChange={(e) =>
                  setInsightFilters({
                    ...insightFilters,
                    program_id: e.target.value,
                  })
                }
                className="bg-transparent border-none text-xs font-black w-full focus:ring-0 appearance-none"
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Batch */}
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">
                Batch
              </label>
              <select
                value={insightFilters.batch_year}
                onChange={(e) =>
                  setInsightFilters({
                    ...insightFilters,
                    batch_year: e.target.value,
                  })
                }
                className="bg-transparent border-none text-xs font-black w-full focus:ring-0 appearance-none"
              >
                <option value="">All Batches</option>
                {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audit / Reconciliation Toggle */}
          <div className="flex items-center gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                Audit / Reconciliation Mode
              </span>
            </div>
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              {[
                { id: "all", label: "Global Ledger", icon: LayoutGrid },
                { id: "external", label: "Bank/Cash Only", icon: Banknote },
                { id: "internal", label: "Adjustments Only", icon: History },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setInsightFilters({ ...insightFilters, payment_type: t.id })
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${insightFilters.payment_type === t.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                    : "text-gray-400 hover:text-indigo-600"
                    }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic hidden md:block">
              * Switch to "Bank/Cash Only" to reconcile with your physical
              deposits and bank statements.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {dailyReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-6 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none text-white overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <BarChart className="w-32 h-32" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Total Collected
              </div>
              <div className="text-2xl font-black mt-2">
                {formatCurrency(dailyReport.summary.total_collected)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 overflow-hidden relative group">
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                Cash Collection
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(dailyReport.summary.cash)}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-fit">
                <Banknote className="w-3 h-3" /> VERIFIED CASH
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden relative group">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                Online Collection
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(dailyReport.summary.online)}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded w-fit">
                <ArrowRight className="w-3 h-3" /> DIGITAL PAYMENTS
              </div>
            </div>
          </div>
        )}

        {/* Unified Transaction Ledger */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {Object.values(insightFilters).some((v) => v !== "")
                ? "Filtered Insights Ledger"
                : "Global Transaction Ledger"}
            </h4>
            <button
              onClick={() => {
                // Check if ANY filter is active (except the default 'all' payment type)
                const isFiltered = Object.entries(insightFilters).some(
                  ([key, value]) => {
                    if (key === "payment_type") return value !== "all";
                    return value !== "";
                  },
                );

                const csvData = isFiltered
                  ? dailyReport?.transactions
                  : transactions;
                if (!csvData) return;
                const csv = [
                  [
                    "Date",
                    "Time",
                    "Ref Number",
                    "Student ID",
                    "Name",
                    "Mode",
                    "Category",
                    "Semester",
                    "Amount",
                  ],
                  ...csvData.map((t) => {
                    const { category, semester } = getPaymentDetails(t);
                    return [
                      t.payment_date.split("T")[0],
                      new Date(t.payment_date).toLocaleTimeString(),
                      t.transaction_id,
                      t.student?.student_id || t.student?.admission_number,
                      `${t.student?.first_name} ${t.student?.last_name}`,
                      t.payment_method,
                      category,
                      semester,
                      t.amount_paid,
                    ];
                  }),
                ]
                  .map((e) => e.join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = isFiltered
                  ? "filtered_financial_ledger.csv"
                  : "global_financial_ledger.csv";
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-100 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export View
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4">Ref Number</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Payment Mode</th>
                  <th className="px-6 py-4 text-right">Amount (₹)</th>
                  <th className="px-6 py-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {(Object.values(insightFilters).some((v) => v !== "")
                  ? dailyReport?.transactions
                  : transactions
                )?.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-gray-400 mb-0.5">
                        #{t.transaction_id}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(t.payment_date).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-900 dark:text-white">
                        {t.student?.first_name} {t.student?.last_name}
                      </div>
                      <div className="text-[10px] font-black text-indigo-500 uppercase">
                        {t.student?.student_id || t.student?.admission_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                      {(() => {
                        const { category, semester } = getPaymentDetails(t);
                        return (
                          <>
                            {category}
                            <div className="text-[10px] opacity-60">
                              SEM {t?.semester || "N/A"}
                            </div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.payment_method === "cash"
                          ? "bg-emerald-50 text-emerald-600"
                          : t.payment_method === "WALLET"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                          }`}
                      >
                        {t.payment_method === "WALLET"
                          ? "Internal Wallet"
                          : t.payment_method.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-gray-900 dark:text-white">
                      {formatCurrency(t.amount_paid)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          const items = flattenTransactionItems(t);
                          printReceipt(null, items);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(Object.values(insightFilters).some((v) => v !== "") &&
                  dailyReport
                  ? dailyReport.transactions
                  : transactions
                ).length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-gray-400 font-bold"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderFinesTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in">
        {/* Left: Find & Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
              Target Student
            </label>
            <div className="relative mb-4">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleStudentSearch}
                placeholder="Search Reg No or Name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {searchQuery.length >= 3 && searchResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto space-y-2 mb-4">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectStudentForPayment(s)}
                    className="w-full text-left p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 group"
                  >
                    <div
                      className={`text-sm font-bold ${s.id === selectedStudent?.id ? "text-indigo-600" : "text-gray-900 dark:text-white"}`}
                    >
                      {s.first_name} {s.last_name}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">
                      {s.student_id} • {s.program?.code}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedStudent && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-indigo-200">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </div>
                    <div className="text-[10px] font-black text-indigo-500">
                      SEM {selectedStudent.current_semester} •{" "}
                      {selectedStudent.student_id}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                Impose New Penalty
              </h4>
              <form onSubmit={handleImposeFine} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">
                    Category
                  </label>
                  <select
                    required
                    value={fineForm.category_id}
                    onChange={(e) =>
                      setFineForm({ ...fineForm, category_id: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">
                      Amount (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={fineForm.amount}
                      onChange={(e) =>
                        setFineForm({ ...fineForm, amount: e.target.value })
                      }
                      placeholder="e.g. 500"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">
                      Semester
                    </label>
                    <select
                      required
                      value={fineForm.semester}
                      onChange={(e) =>
                        setFineForm({
                          ...fineForm,
                          semester: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          SEM {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">
                    Remarks
                  </label>
                  <textarea
                    value={fineForm.remarks}
                    onChange={(e) =>
                      setFineForm({ ...fineForm, remarks: e.target.value })
                    }
                    rows="2"
                    placeholder="Reason for fine..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  IMPOSE CHARGE
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Active Fines for Student */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">
                Select a student to manage their fines and ad-hoc charges
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Current Owed Personal Charges
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Semester</th>
                      <th className="px-6 py-4 text-right">Amount Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {studentStatus &&
                      studentStatus.semesterWise &&
                      Object.entries(studentStatus.semesterWise).map(
                        ([sem, data]) =>
                          data.fees
                            .filter((f) => f.is_personal)
                            .map((fee) => (
                              <tr
                                key={fee.id}
                                className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-red-600">
                                    {fee.category}
                                  </div>
                                  {fee.remarks && (
                                    <div className="text-[10px] text-gray-400 font-bold">
                                      {fee.remarks}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                  SEM {sem}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">
                                  {formatCurrency(fee.due)}
                                </td>
                              </tr>
                            )),
                      )}
                    {(!studentStatus ||
                      !Object.values(studentStatus.semesterWise).some((d) =>
                        d.fees.some((f) => f.is_personal),
                      )) && (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-12 text-center text-gray-400 font-bold"
                          >
                            No personal fines or ad-hoc charges recorded for this
                            student.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStructureTab = () => {
    const semesterWiseAdmin = {};
    for (let i = 1; i <= 8; i++) semesterWiseAdmin[i] = [];
    structures.forEach((s) => {
      if (s && semesterWiseAdmin[s.semester])
        semesterWiseAdmin[s.semester].push(s);
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Local Tab-Specific Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
          <div className="flex-1 flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-3 border-r border-gray-200 dark:border-gray-700 pr-3">
              Configure For:
            </span>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="bg-transparent border-none text-xs font-black py-2 pl-4 pr-10 focus:ring-0"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(parseInt(e.target.value))}
              className="bg-transparent border-none text-xs font-black py-2 pl-4 pr-10 focus:ring-0"
            >
              {batches.map((year) => (
                <option key={year} value={year}>
                  Batch {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() =>
              dispatch(
                fetchFeeStructures({
                  program_id: selectedProgram,
                  batch_year: selectedBatch,
                }),
              )
            }
            className="p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
            title="Refresh Structures"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-400 ${status === "loading" ? "animate-spin" : ""}`}
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
                  className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center"
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
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
                            (c) => c.semester === parseInt(semNum),
                          ),
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
                              {s.applies_to === "all"
                                ? "All Students"
                                : s.applies_to.charAt(0).toUpperCase() +
                                s.applies_to.slice(1)}
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
      </div>
    );
  };

  const renderDefaultersTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
          <div className="flex-1 flex items-center gap-4">
            {/* 0. Batch selection */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(parseInt(e.target.value))}
                className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Batches</option>
                {batches.map((year) => (
                  <option key={year} value={year}>
                    Batch {year}
                  </option>
                ))}
              </select>
            </div>
            {/* 1. Department */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Department
              </label>
              <select
                value={defaulterFilters.department_id}
                onChange={(e) =>
                  setDefaulterFilters({
                    ...defaulterFilters,
                    department_id: e.target.value,
                  })
                }
                className="w-40 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Depts</option>
                {departments
                  .filter((d) => d.type === "academic")
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 2. Program */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Program
              </label>
              <select
                value={defaulterFilters.program_id}
                onChange={(e) =>
                  setDefaulterFilters({
                    ...defaulterFilters,
                    program_id: e.target.value,
                  })
                }
                className="w-40 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Programs</option>
                {programs
                  .filter(
                    (p) =>
                      !defaulterFilters.department_id ||
                      p.department_id === defaulterFilters.department_id,
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 4. Semester */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Semester
              </label>
              <select
                value={defaulterFilters.semester}
                onChange={(e) =>
                  setDefaulterFilters({
                    ...defaulterFilters,
                    semester: e.target.value,
                  })
                }
                className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sems</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Section (Dynamic) */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Section
              </label>
              <select
                value={defaulterFilters.section}
                onChange={(e) =>
                  setDefaulterFilters({
                    ...defaulterFilters,
                    section: e.target.value,
                  })
                }
                className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Min Due */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Min Due
              </label>
              <input
                type="number"
                value={defaulterFilters.min_due}
                onChange={(e) =>
                  setDefaulterFilters({
                    ...defaulterFilters,
                    min_due: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Min Due"
                className="w-28 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 6. Days Overdue */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Days Overdue
              </label>
              <input
                type="number"
                value={defaulterFilters.days_overdue}
                onChange={(e) =>
                  setDefaulterFilters({
                    ...defaulterFilters,
                    days_overdue: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Overdue"
                className="w-28 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={handleExportDefaulters}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-indigo-600"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              dispatch(
                fetchDefaulters({
                  batch_year: selectedBatch,
                  program_id: selectedProgram,
                  ...defaulterFilters,
                }),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Defaulters List ({defaultersMeta?.total || 0})
            </h4>
            {selectedDefaulters.size > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={reminderMode}
                  onChange={(e) => setReminderMode(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs font-bold py-2 focus:ring-0"
                >
                  <option value="email">via Email</option>
                  <option value="sms">via SMS</option>
                </select>
                <button
                  onClick={handleSendBulkReminders}
                  className="px-4 py-2 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 text-xs"
                >
                  {reminderMode === "email" ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  Send to {selectedDefaulters.size}
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50/50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDefaulters(
                            new Set(defaulters.map((d) => d.student_id)),
                          );
                        } else {
                          setSelectedDefaulters(new Set());
                        }
                      }}
                      checked={
                        selectedDefaulters.size === defaulters.length &&
                        defaulters.length > 0
                      }
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4 text-right">Total Due (₹)</th>
                  <th className="px-6 py-4 text-right">Days Overdue</th>
                  <th className="px-6 py-4 text-center">Last Reminder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {defaulters.map((d) => (
                  <tr
                    key={d.student_id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDefaulters.has(d.student_id)}
                        onChange={() => {
                          const next = new Set(selectedDefaulters);
                          if (next.has(d.student_id)) {
                            next.delete(d.student_id);
                          } else {
                            next.add(d.student_id);
                          }
                          setSelectedDefaulters(next);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {d.name}
                      </div>
                      <div className="text-[10px] font-black text-gray-400">
                        {d.student_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">
                      {d.program}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-red-600">
                      {formatCurrency(d.total_due)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-amber-600">
                      {d.days_overdue}
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-500">
                      {d.last_reminder_sent
                        ? formatDate(d.last_reminder_sent)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
                {defaulters.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-400 font-bold"
                    >
                      No defaulters found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Banknote className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Fee Management
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Financial controls, collections, and student payment records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                dispatch(fetchCollectionStats());
                dispatch(fetchTransactions());
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
              title="Refresh Stats"
            >
              <RefreshCw
                className={`w-5 h-5 ${status === "loading" ? "animate-spin" : ""}`}
              />
            </button>
            {/* Dynamic Filter Controls (if needed per tab) */}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-8 border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: LayoutGrid,
              visible: canViewOversight,
            },
            {
              id: "counter",
              label: "Counter Payment",
              icon: Banknote,
              visible: canManageFees,
            },
            {
              id: "fines",
              label: "Fines & Charges",
              icon: CircleDollarSign,
              visible: canManageFees,
            },
            {
              id: "scholarships",
              label: "Scholarships",
              icon: Percent,
              visible: canAdminFees,
            },
            {
              id: "defaulters",
              label: "Dues Monitoring",
              icon: AlertCircle,
              visible: canViewOversight,
            },
            {
              id: "structure",
              label: "Fee Structures",
              icon: FileText,
              visible: canAdminFees,
            },
            {
              id: "insights",
              label: "Reports",
              icon: BarChart,
              visible: canViewOversight,
            },
          ]
            .filter((tab) => tab.visible)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "counter" && renderCounterPaymentTab()}
          {activeTab === "fines" && renderFinesTab()}
          {activeTab === "scholarships" && renderScholarshipsTab()}
          {activeTab === "defaulters" && renderDefaultersTab()}
          {activeTab === "structure" && renderStructureTab()}
          {activeTab === "insights" && renderInsightsTab()}
        </div>
      </div>


      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-8 shadow-2xl">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-8 shadow-2xl">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-8 shadow-2xl">
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
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setShowCategoryModal(true);
                        return;
                      }
                      setStructureForm({
                        ...structureForm,
                        category_id: e.target.value,
                      });
                    }}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option
                      value="new"
                      className="font-black text-indigo-600 bg-indigo-50"
                    >
                      + Create New Category...
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 block mb-2">
                    Semester
                  </label>
                  <select
                    disabled={structureForm.apply_to_all_semesters}
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
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={structureForm.apply_to_all_semesters}
                      onChange={(e) =>
                        setStructureForm({
                          ...structureForm,
                          apply_to_all_semesters: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-xs font-bold text-gray-500">
                      Apply to 1-8 Semesters
                    </span>
                  </label>
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
                    <option value="convener">Convener</option>
                    <option value="management">Management</option>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-8 shadow-2xl">
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

      {paymentSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
              Payment Successful!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Transaction ID:{" "}
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                {paymentSuccess.transaction_id}
              </span>
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 text-left max-h-60 overflow-y-auto">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Summary
              </h3>
              <div className="space-y-2">
                {paymentSuccess.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        {item.fee_structure?.category?.name || "Fee Item"}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-400">
                        {item.remarks && item.remarks.includes("Fine") ? (
                          <span className="text-red-500">Fine/Charge</span>
                        ) : (
                          <span>Sem {item.semester || "N/A"}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-black text-gray-700 dark:text-gray-300">
                      ₹{parseFloat(item.amount_paid).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 mt-2 border-t border-dashed border-gray-200 dark:border-gray-600">
                <div className="text-xs font-black text-gray-500 uppercase">
                  Total Paid
                </div>
                <div className="text-sm font-black text-emerald-600">
                  ₹
                  {parseFloat(paymentSuccess.amount_paid).toLocaleString(
                    "en-IN",
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => printReceipt(null, paymentSuccess.items || [])}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  resetCounterForm();
                }}
                className="w-full py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Close & Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
