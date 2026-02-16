import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  Users,
  GraduationCap,
  BarChart3,
  ArrowUpRight,
  Search,
  Filter,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MapPin,
  X,
  Briefcase,
  ShieldCheck,
  Globe,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

/**
 * Simplified Drive Detail Modal for Coordinators
 */
const DriveViewModal = ({ driveId, departmentId, onClose }) => {
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driveId && departmentId) {
      fetchDetail();
    }
  }, [driveId, departmentId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/placement/department/${departmentId}/drives/${driveId}`,
      );
      setDrive(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch drive details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl">
          <Clock className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="mt-4 text-gray-500 font-bold">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!drive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[40px] shadow-2xl relative overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex gap-5">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {drive.job_posting?.company?.logo_url ? (
                <img
                  src={drive.job_posting.company.logo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                drive.job_posting?.company?.name?.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {drive.drive_name}
              </h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                {drive.job_posting?.company?.name} •{" "}
                {drive.job_posting?.job_role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Job Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Job Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {drive.job_description ||
                    drive.job_posting?.job_description ||
                    "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Package & Mode
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">
                      CTC (LPA)
                    </p>
                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                      ₹{drive.job_posting?.ctc_lpa || "TBD"}
                    </p>
                  </div>
                  <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter">
                      Mode
                    </p>
                    <p className="text-xl font-black text-indigo-700 dark:text-indigo-300 capitalize">
                      {drive.mode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recruitment Rounds */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Selection Process
                </h3>
                <div className="space-y-3">
                  {drive.rounds
                    ?.sort((a, b) => a.round_number - b.round_number)
                    .map((round) => (
                      <div
                        key={round.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center font-black text-indigo-600 border border-indigo-50">
                          {round.round_number}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {round.round_name}
                          </p>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">
                            {round.round_type}
                          </p>
                        </div>
                        {round.round_date && (
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase">
                              {new Date(round.round_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  {(!drive.rounds || drive.rounds.length === 0) && (
                    <p className="text-gray-500 italic text-sm">
                      No rounds configured yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Eligibility & Registration */}
            <div className="space-y-8">
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[32px] border border-indigo-100 dark:border-indigo-800/50">
                <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-6 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5" /> Eligibility Criteria
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-indigo-50">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">
                      Min CGPA
                    </p>
                    <p className="text-2xl font-black text-indigo-600">
                      {drive.eligibility?.min_cgpa || "0.0"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-indigo-50">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">
                      Backlogs
                    </p>
                    <p className="text-2xl font-black text-amber-600">
                      ≤ {drive.eligibility?.max_active_backlogs ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6 uppercase tracking-wider">
                  <Calendar className="w-5 h-5 text-gray-400" /> Key Dates
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-500">Drive Date</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {drive.drive_date || "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-500">Reg. Deadline</span>
                    <span className="text-orange-600 font-black">
                      {drive.registration_end
                        ? new Date(drive.registration_end).toLocaleDateString()
                        : "No Deadline"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500">Internal Coordinator</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {drive.coordinator
                        ? `${drive.coordinator.first_name}`
                        : "Admin"}
                    </span>
                  </div>
                </div>
              </div>

              {drive.external_registration_url && (
                <a
                  href={drive.external_registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                >
                  <ExternalLink className="w-5 h-5" /> GO TO REGISTRATION LINK
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50/30 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const DepartmentPlacementDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [driveParticipation, setDriveParticipation] = useState({});
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  const [selectedDriveForModal, setSelectedDriveForModal] = useState(null);
  const [activeTab, setActiveTab] = useState("drives"); // 'drives' or 'students'

  const departmentId = user?.department_id;
  const isPC = user?.is_placement_coordinator;

  useEffect(() => {
    if (departmentId) {
      fetchMetadata();
    }
  }, [departmentId]);

  useEffect(() => {
    if (departmentId) {
      fetchData();
    }
  }, [departmentId, selectedBatch, selectedSection]);

  const fetchMetadata = async () => {
    try {
      const [batchesRes, sectionsRes] = await Promise.all([
        api.get("/users/batch-years", {
          params: { department_id: departmentId },
        }),
        api.get("/users/sections", { params: { department_id: departmentId } }),
      ]);
      setBatches(batchesRes.data.data);
      setSections(sectionsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch metadata");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        batch_year: selectedBatch || undefined,
        section: selectedSection || undefined,
      };

      const [statsRes, studentsRes, drivesRes] = await Promise.all([
        api.get(`/placement/department/${departmentId}/stats`, { params }),
        api.get(`/placement/department/${departmentId}/students`, { params }),
        api.get(`/placement/department/${departmentId}/drives`),
      ]);
      setStats(statsRes.data.data);
      setStudents(studentsRes.data.data);
      setDrives(drivesRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch department data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriveParticipation = async (driveId) => {
    try {
      setLoadingParticipation(true);
      const response = await api.get(
        `/placement/department/${departmentId}/drives/${driveId}/students`,
      );
      setDriveParticipation((prev) => ({
        ...prev,
        [driveId]: response.data.data,
      }));
    } catch (error) {
      toast.error("Failed to fetch drive participation");
    } finally {
      setLoadingParticipation(false);
    }
  };

  const toggleDriveExpansion = (driveId) => {
    if (expandedDrive === driveId) {
      setExpandedDrive(null);
    } else {
      setExpandedDrive(driveId);
      if (!driveParticipation[driveId]) {
        fetchDriveParticipation(driveId);
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.id_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statCards = [
    {
      name: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Placed Students",
      value: stats?.placedStudents || 0,
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Placement %",
      value: `${stats?.placementPercentage || 0}%`,
      icon: BarChart3,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      name: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: ArrowUpRight,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading && !stats)
    return (
      <div className="p-10 text-center animate-pulse">
        Loading department data...
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* <PlacementBreadcrumbs
        items={[{ label: isPC ? "My Department" : "Department Dashboard" }]}
      /> */}

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isPC
              ? "Department Placement Hub"
              : "Department Placement Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1 font-bold text-sm">
            {isPC
              ? "Welcome Coordinator! Track your department's recruitment progress here."
              : "Faculty Coordinator view for tracked recruitment progress"}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("drives")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "drives"
                ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Calendar className="w-4 h-4" /> Drives
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "students"
                ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Users className="w-4 h-4" /> Students
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
          >
            <div
              className={`p-3 rounded-2xl w-fit ${card.bg} ${card.color} mb-4 transition-transform group-hover:scale-110`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest text-[9px]">
              {card.name}
            </h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabbed Content */}
      <div className="min-h-[500px]">
        {activeTab === "drives" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                Available Recruitment Drives
              </h2>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full uppercase tracking-tighter shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                {drives.length} Drives Eligible
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {drives.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-16 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold text-lg">
                    No drives currently available for your department.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Check back later for new recruitment opportunities.
                  </p>
                </div>
              ) : (
                drives.map((drive) => (
                  <div
                    key={drive.id}
                    className="bg-white dark:bg-gray-800 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-start gap-6">
                          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-[32px] flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                            {drive.job_posting?.company?.logo_url ? (
                              <img
                                src={drive.job_posting.company.logo_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <div className="pt-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1">
                              {drive.drive_name}
                            </h3>
                            <p className="text-indigo-600 dark:text-indigo-400 font-black text-base">
                              {drive.job_posting?.company?.name} •{" "}
                              {drive.job_posting?.job_role}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                              <span className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-tight bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                {drive.drive_date || "Date TBD"}
                              </span>
                              <span className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-tight bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                {drive.mode} •{" "}
                                {drive.drive_type.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex gap-2 mr-6">
                            <div className="text-center px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                              <p className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">
                                Applied
                              </p>
                              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                                {drive.stats?.appliedCount || 0}
                              </p>
                            </div>
                            <div className="text-center px-5 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                              <p className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-1">
                                Pending
                              </p>
                              <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                                {drive.stats?.pendingCount || 0}
                              </p>
                            </div>
                            <div className="text-center px-5 py-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                              <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">
                                Eligible
                              </p>
                              <p className="text-xl font-black text-gray-700 dark:text-gray-300">
                                {drive.stats?.eligibleCount || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setSelectedDriveForModal(drive.id)}
                              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-sm active:scale-95"
                            >
                              <ExternalLink className="w-4 h-4" /> View Details
                            </button>

                            <button
                              onClick={() => toggleDriveExpansion(drive.id)}
                              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 ${expandedDrive === drive.id
                                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none"
                                }`}
                            >
                              {expandedDrive === drive.id ? (
                                <>
                                  <ChevronUp className="w-4 h-4" /> Hide
                                  Participation
                                </>
                              ) : (
                                <>
                                  <Search className="w-4 h-4" /> Student Matrix
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Student Matrix */}
                    {expandedDrive === drive.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/30">
                        <div className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-3 text-lg">
                              Eligible Student Participation
                              {loadingParticipation && (
                                <Clock className="w-5 h-5 animate-spin text-indigo-500" />
                              )}
                            </h4>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-700">
                                    Student Name
                                  </th>
                                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-700">
                                    Batch & Section
                                  </th>
                                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-700">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {driveParticipation[drive.id]?.map(
                                  (student) => (
                                    <tr
                                      key={student.id}
                                      className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors"
                                    >
                                      <td className="px-8 py-5">
                                        <div className="font-black text-gray-900 dark:text-white text-base">
                                          {student.name}
                                        </div>
                                        <div className="text-[11px] text-gray-400 font-black uppercase font-mono tracking-tighter">
                                          {student.id_number}
                                        </div>
                                      </td>
                                      <td className="px-8 py-5">
                                        <span className="text-gray-600 dark:text-gray-400 font-black bg-gray-100/50 dark:bg-gray-900 px-4 py-1.5 rounded-xl text-xs uppercase tracking-tight">
                                          Batch {student.batch} • Sec{" "}
                                          {student.section || "N/A"}
                                        </span>
                                      </td>
                                      <td className="px-8 py-5">
                                        {student.status === "Applied" ? (
                                          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[10px] tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-2xl w-fit border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                                            Applied
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black uppercase text-[10px] tracking-widest bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-2xl w-fit border border-amber-100 dark:border-amber-800/50 shadow-sm">
                                            <XCircle className="w-4 h-4 text-amber-500" />{" "}
                                            Pending
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ),
                                )}
                                {(!driveParticipation[drive.id] ||
                                  driveParticipation[drive.id].length === 0) &&
                                  !loadingParticipation && (
                                    <tr>
                                      <td
                                        colSpan="3"
                                        className="px-8 py-20 text-center text-gray-500 font-black italic text-lg opacity-40"
                                      >
                                        No eligible students found in this
                                        department for this drive.
                                      </td>
                                    </tr>
                                  )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/30 dark:bg-gray-900/10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  Overall Student Status
                </h2>
                <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest ml-12">
                  Tracking all candidates across department
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <div className="relative min-w-[160px]">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black uppercase tracking-tight appearance-none cursor-pointer shadow-sm"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    <option value="">All Batches</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        Batch {batch}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative min-w-[140px]">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black uppercase tracking-tight appearance-none cursor-pointer shadow-sm"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">All Sections</option>
                    {sections.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="SEARCH CANDIDATE..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black uppercase tracking-tight shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                      Student Candidate
                    </th>
                    <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                      Unique ID
                    </th>
                    <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                      Academic Batch
                    </th>
                    <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                      Status
                    </th>
                    <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                      Company Placement
                    </th>
                    <th className="px-10 py-6 border-b border-gray-100 dark:border-gray-700">
                      Annual CTC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-10 py-24 text-center text-gray-500 font-black italic text-xl opacity-40 bg-gray-50/10"
                      >
                        No candidates matching current criteria
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const placement = student.placements?.[0];
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-all duration-300 group"
                        >
                          <td className="px-10 py-6">
                            <div className="font-black text-gray-900 dark:text-white text-base group-hover:text-indigo-600 transition-colors">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-black uppercase font-mono tracking-tighter mt-0.5">
                              {student.email}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-xs font-black text-gray-600 dark:text-gray-400 uppercase font-mono tracking-[0.1em] bg-gray-50/30 dark:bg-gray-900/30 rounded-xl m-4 block text-center border border-gray-100 dark:border-gray-700">
                            {student.id_number}
                          </td>
                          <td className="px-10 py-6 text-sm font-black text-gray-500 tracking-widest text-center">
                            {student.batch_year || "N/A"}
                          </td>
                          <td className="px-10 py-6">
                            <span
                              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] w-fit flex items-center gap-2 shadow-sm ${placement
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50"
                                }`}
                            >
                              {placement ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4 animate-pulse" />
                              )}
                              {placement ? "Placed" : "Unplaced"}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                            {placement?.job_posting?.company?.name || "-"}
                          </td>
                          <td className="px-10 py-6 text-base font-black text-gray-900 dark:text-white text-right font-mono">
                            {placement?.job_posting?.ctc_lpa
                              ? `₹${placement.job_posting.ctc_lpa} LPA`
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Drive Detail Modal */}
      {selectedDriveForModal && (
        <DriveViewModal
          driveId={selectedDriveForModal}
          departmentId={departmentId}
          onClose={() => setSelectedDriveForModal(null)}
        />
      )}
    </div>
  );
};

export default DepartmentPlacementDashboard;
