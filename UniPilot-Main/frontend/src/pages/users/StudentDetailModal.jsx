import React, { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  Book,
  FileText,
  CreditCard,
  Users,
  Grid,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";
import api from "../../utils/api";

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [feeDetails, setFeeDetails] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    if (isOpen && student?.id) {
      if (activeTab === "documents") {
        fetchDocuments();
      } else if (activeTab === "fees") {
        fetchFees();
      } else if (activeTab === "performance") {
        fetchPerformance();
      }
    }
  }, [isOpen, activeTab, student]);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get(`/admission/documents/${student.id}`);
      setDocuments(res.data.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchFees = async () => {
    try {
      setLoadingFees(true);
      const res = await api.get(`/fees/summary/${student.id}`);
      setFeeDetails(res.data.data);
    } catch (err) {
      console.error("Failed to fetch fees", err);
    } finally {
      setLoadingFees(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      setLoadingPerformance(true);
      const res = await api.get(`/exam/results/${student.id}`);
      setPerformance(res.data.data);
    } catch (err) {
      console.error("Failed to fetch performance", err);
    } finally {
      setLoadingPerformance(false);
    }
  };

  if (!isOpen || !student) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: Grid },
    { id: "personal", label: "Personal & Family", icon: Users },
    { id: "academic", label: "Academic", icon: Book },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "fees", label: "Fee Details", icon: IndianRupee },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 mr-3 shadow-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const SectionTitle = ({ title }) => (
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
      <div className="w-1 h-4 bg-primary-500 rounded-full mr-2" />
      {title}
    </h3>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl h-[85vh] flex overflow-hidden shadow-2xl animate-scale-in">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={
                  student.profile_picture
                    ? student.profile_picture.startsWith("http")
                      ? student.profile_picture
                      : `${student.profile_picture}?token=${localStorage.getItem(
                        "accessToken",
                      )}`
                    : `https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=random&size=128`
                }
                className="w-24 h-24 rounded-2xl object-cover shadow-lg mb-4 mx-auto"
                alt="Profile"
              />
              <div
                className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${student.is_active ? "bg-success-500" : "bg-gray-400"
                  }`}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-sm text-gray-500">{student.student_id}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold">
              {student.role.toUpperCase()}
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-primary-600 shadow-sm font-bold"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-gray-500">Student Information</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <SectionTitle title="Identity" />
                    <div className="grid grid-cols-1 gap-4">
                      <InfoRow
                        icon={Mail}
                        label="Email Address"
                        value={student.email}
                      />
                      <InfoRow
                        icon={Phone}
                        label="Phone Number"
                        value={student.phone}
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Date of Birth"
                        value={student.date_of_birth}
                      />
                      <InfoRow
                        icon={User}
                        label="Gender"
                        value={student.gender}
                      />
                    </div>
                  </div>
                  <div>
                    <SectionTitle title="Admission Details" />
                    <div className="grid grid-cols-1 gap-4">
                      <InfoRow
                        icon={Calendar}
                        label="Admission Date"
                        value={student.admission_date}
                      />
                      <InfoRow
                        icon={CreditCard}
                        label="Admission Type"
                        value={student.admission_type}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <SectionTitle title="Identity Documents" />
                  <div className="grid grid-cols-1 md:grid-rows-3 gap-4">
                    <InfoRow
                      icon={CreditCard}
                      label="Aadhaar Number"
                      value={student.aadhaar_number}
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="PAN Number"
                      value={student.pan_number}
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="Passport Number"
                      value={student.passport_number}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-8">
                <div>
                  <SectionTitle title="Address" />
                  <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-700 dark:text-gray-300">
                      {student.address || "No address provided"}
                    </p>
                    <div className="mt-4 flex gap-4">
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700">
                        {student.city}
                      </span>
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700">
                        {student.state}
                      </span>
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700">
                        {student.zip_code}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Parent / Guardian Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      icon={User}
                      label="Father's Name"
                      value={student.parent_details?.father_name}
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Father's Occupation"
                      value={student.parent_details?.father_job}
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Mother's Occupation"
                      value={student.parent_details?.mother_job}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Father's Mobile"
                      value={student.parent_details?.father_mobile}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Mother's Mobile"
                      value={student.parent_details?.mother_mobile}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Father's Email"
                      value={student.parent_details?.father_email}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Mother's Email"
                      value={student.parent_details?.mother_email}
                    />
                  </div>
                </div>

                <div>
                  <SectionTitle title="Bank Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      icon={CreditCard}
                      label="Bank Name"
                      value={student.bank_details?.bank_name}
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="Account Number"
                      value={student.bank_details?.account_number}
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="IFSC Code"
                      value={student.bank_details?.ifsc_code}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academic" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase mb-1">
                      Program
                    </p>
                    <p className="font-bold text-purple-700 dark:text-purple-300 truncate">
                      {student.program?.name || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">
                      Batch Year
                    </p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">
                      {student.batch_year || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">
                      Regulation
                    </p>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300">
                      {student.regulation?.name || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">
                      Section
                    </p>
                    <p className="font-bold text-orange-700 dark:text-orange-300">
                      {student.section || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800">
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase mb-1">
                      Current Semester
                    </p>
                    <p className="font-bold text-teal-700 dark:text-teal-300">
                      {student.current_semester || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Previous Academics" />
                  {student.previous_academics?.length > 0 ? (
                    <div className="space-y-3">
                      {student.previous_academics.map((record, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {record.degree || record.class}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.institution}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-bold text-success-600">
                              {record.percentage}%
                            </span>
                            <span className="text-xs text-gray-400">
                              {record.year}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No previous academic records found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "fees" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">
                      Total Paid
                    </p>
                    <p className="font-bold text-green-700 dark:text-green-300 text-lg">
                      ₹{feeDetails?.grandTotals?.paid?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase mb-1">
                      Total Due
                    </p>
                    <p className="font-bold text-red-700 dark:text-red-300 text-lg">
                      ₹{feeDetails?.grandTotals?.due?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">
                      Total Payable
                    </p>
                    <p className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                      ₹
                      {feeDetails?.grandTotals?.payable?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>

                <div>
                  <SectionTitle title="Fee Breakdown by Semester" />
                  {loadingFees ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : !feeDetails ? (
                    <p className="text-gray-500 text-sm italic">
                      No fee details available.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(feeDetails.semesterWise).map(
                        ([sem, data]) => {
                          if (data.totals.payable === 0) return null; // Skip empty semesters
                          return (
                            <div
                              key={sem}
                              className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                            >
                              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                  Semester {sem}
                                </span>
                                <div className="flex gap-3 text-xs">
                                  <span className="text-gray-500">
                                    Payable: <b>₹{data.totals.payable}</b>
                                  </span>
                                  <span className="text-success-600">
                                    Paid: <b>₹{data.totals.paid}</b>
                                  </span>
                                  <span className="text-error-600">
                                    Due: <b>₹{data.totals.due}</b>
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 bg-white dark:bg-gray-900">
                                {data.fees.map((fee, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 text-sm"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-700 dark:text-gray-300">
                                        {fee.category}
                                      </p>
                                      {fee.receipts.length > 0 && (
                                        <p className="text-[10px] text-gray-400">
                                          {fee.receipts.length} payment(s)
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-gray-900 dark:text-white">
                                        ₹{fee.payable}
                                      </p>
                                      {fee.due > 0 && (
                                        <p className="text-[10px] text-error-500">
                                          Due: ₹{fee.due}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {data.fine.amount > 0 && (
                                  <div className="flex justify-between items-center py-2 text-sm text-error-600 bg-error-50 dark:bg-error-900/10 px-2 rounded mt-2">
                                    <span>Late Fine</span>
                                    <span>₹{data.fine.amount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-8 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mb-1">
                      CGPA
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                        {performance?.summary?.cgpa || "0.00"}
                      </p>
                      <span className="text-xs text-indigo-400">/ 10.0</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">
                      Credits Earned
                    </p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                      {performance?.summary?.earnedCredits || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest mb-1">
                      Total Semesters
                    </p>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
                      {performance?.summary?.totalSemesters || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800">
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest mb-1">
                      Backlogs
                    </p>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300">
                      {performance?.performance?.reduce(
                        (acc, sem) =>
                          acc +
                          sem.courses.filter((c) =>
                            Object.values(c.marks).some((m) => m.grade === "F"),
                          ).length,
                        0,
                      ) || 0}
                    </p>
                  </div>
                </div>

                {/* Semester Wise Performance */}
                <div className="space-y-6">
                  {loadingPerformance ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-500">
                        Compiling Academic History...
                      </p>
                    </div>
                  ) : !performance?.performance?.length ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold">
                        No academic performance records found.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Locked results will appear here once published.
                      </p>
                    </div>
                  ) : (
                    performance.performance.map((sem, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm"
                      >
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500 text-white rounded-lg">
                              <Layers className="w-4 h-4" />
                            </div>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                              Semester {sem.semester}
                            </h4>
                          </div>
                          <div className="flex gap-4">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">
                                SGPA
                              </p>
                              <p className="text-sm font-black text-primary-600">
                                {sem.sgpa || "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">
                                Credits
                              </p>
                              <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                                {sem.earned} / {sem.credits}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sem.courses.map((course, cIdx) => {
                            const mids = Object.entries(course.marks).filter(
                              ([k]) => k.includes("mid"),
                            );
                            const internals = Object.entries(
                              course.marks,
                            ).filter(([k]) => k.includes("internal"));
                            const labs = Object.entries(course.marks).filter(
                              ([k]) =>
                                k.includes("external") || k.includes("project"),
                            );
                            const endSem = course.marks["end_semester"];

                            return (
                              <div
                                key={cIdx}
                                className="p-5 rounded-3xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                                      {course.name}
                                    </h5>
                                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                                      {course.code} • {course.type}
                                    </p>
                                  </div>
                                  <div
                                    className={`px-3 py-1 rounded-xl text-xs font-black shadow-sm ${endSem?.grade === "F"
                                        ? "bg-rose-100 text-rose-600"
                                        : ["O", "A+", "A"].includes(
                                          endSem?.grade,
                                        )
                                          ? "bg-emerald-100 text-emerald-600"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                  >
                                    {endSem?.grade || "PND"}
                                  </div>
                                </div>

                                {/* Component Figures */}
                                <div className="grid grid-cols-3 gap-2">
                                  {/* Mid Terms / Internals */}
                                  <div className="p-2 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/30 dark:border-indigo-800/30 text-center">
                                    <p className="text-[8px] font-black text-indigo-400 uppercase leading-none mb-1.5">
                                      Mids
                                    </p>
                                    <div className="flex flex-col gap-1">
                                      {mids.length > 0 ? (
                                        mids.map(([k, m], i) => (
                                          <p
                                            key={i}
                                            className="text-xs font-black text-indigo-700 dark:text-indigo-300 leading-none"
                                          >
                                            {m.obtained}
                                          </p>
                                        ))
                                      ) : internals.length > 0 ? (
                                        internals.map(([k, m], i) => (
                                          <p
                                            key={i}
                                            className="text-xs font-black text-emerald-700 dark:text-emerald-300 leading-none"
                                          >
                                            {m.obtained}
                                          </p>
                                        ))
                                      ) : (
                                        <p className="text-xs font-black text-gray-300 leading-none">
                                          -
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Lab / Project */}
                                  <div className="p-2 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/30 dark:border-amber-800/30 text-center">
                                    <p className="text-[8px] font-black text-amber-400 uppercase leading-none mb-1.5">
                                      Labs
                                    </p>
                                    <div className="flex flex-col gap-1">
                                      {labs.length > 0 ? (
                                        labs.map(([k, m], i) => (
                                          <p
                                            key={i}
                                            className="text-xs font-black text-amber-700 dark:text-amber-300 leading-none"
                                          >
                                            {m.obtained}
                                          </p>
                                        ))
                                      ) : (
                                        <p className="text-xs font-black text-gray-300 leading-none">
                                          -
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* End Semester */}
                                  <div className="p-2 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/30 dark:border-primary-800/30 text-center">
                                    <p className="text-[8px] font-black text-primary-400 uppercase leading-none mb-1.5">
                                      Final
                                    </p>
                                    <p className="text-xs font-black text-primary-700 dark:text-primary-300 leading-none">
                                      {endSem?.obtained || "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === "documents" && (
              <div>
                <SectionTitle title="Uploaded Documents" />
                {loadingDocs ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No documents uploaded.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 mr-3">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              {doc.name}
                            </h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                              {doc.type}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${doc.status === "approved"
                                  ? "bg-success-50 text-success-700"
                                  : doc.status === "rejected"
                                    ? "bg-error-50 text-error-700"
                                    : "bg-warning-50 text-warning-700"
                                }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
