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
  UserCircle,
  ChevronRight,
  ArrowRight,
  BadgeCheck
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
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl">
          <Clock className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!drive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative overflow-hidden my-auto border border-gray-100">
        {/* Modal Header */}
        <div className="p-10 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-blue-600 border border-gray-100 shadow-sm overflow-hidden group">
              {drive.job_posting?.company?.logo_url ? (
                <img
                  src={drive.job_posting.company.logo_url}
                  alt=""
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                drive.job_posting?.company?.name?.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-black leading-tight tracking-tight">
                {drive.drive_name}
              </h2>
              <p className="text-blue-600 font-bold text-lg mt-1">
                {drive.job_posting?.company?.name} •{" "}
                <span className="text-gray-400">{drive.job_posting?.job_role}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-black transition-all border border-gray-100 shadow-sm hover:shadow-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-10 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Job Info */}
            <div className="space-y-10">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Job Description
                </h3>
                <p className="text-gray-600 leading-relaxed font-medium text-sm">
                  {drive.job_description ||
                    drive.job_posting?.job_description ||
                    "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Package & Mode
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">
                      CTC (LPA)
                    </p>
                    <p className="text-2xl font-black text-emerald-700">
                      ₹{drive.job_posting?.ctc_lpa || "TBD"}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">
                      Mode
                    </p>
                    <p className="text-2xl font-black text-blue-700 capitalize">
                      {drive.mode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recruitment Rounds */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Selection Process
                </h3>
                <div className="space-y-3">
                  {drive.rounds
                    ?.sort((a, b) => a.round_number - b.round_number)
                    .map((round) => (
                      <div
                        key={round.id}
                        className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-blue-600 border border-blue-50 shadow-sm text-lg">
                          {round.round_number}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-black text-sm mb-0.5">
                            {round.round_name}
                          </p>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                            {round.round_type}
                          </p>
                        </div>
                        {round.round_date && (
                          <div className="text-right bg-white px-3 py-1 rounded-lg border border-gray-100">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">
                              {new Date(round.round_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  {(!drive.rounds || drive.rounds.length === 0) && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                        No rounds configured yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Eligibility & Registration */}
            <div className="space-y-8">
              <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100">
                <h3 className="text-xs font-black text-blue-900 flex items-center gap-3 mb-6 uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Eligibility Criteria
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                    <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em] mb-2">
                      Min CGPA
                    </p>
                    <p className="text-3xl font-black text-blue-600 tracking-tight">
                      {drive.eligibility?.min_cgpa || "0.0"}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                    <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em] mb-2">
                      Backlogs
                    </p>
                    <p className="text-3xl font-black text-amber-500 tracking-tight">
                      ≤ {drive.eligibility?.max_active_backlogs ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xs font-black text-black flex items-center gap-3 mb-6 uppercase tracking-[0.2em]">
                  <Calendar className="w-5 h-5 text-gray-400" /> Key Dates
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium pb-4 border-b border-gray-200/50 last:border-0 last:pb-0">
                    <span className="text-gray-500 font-bold">Drive Date</span>
                    <span className="text-black font-black">
                      {drive.drive_date || "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium pb-4 border-b border-gray-200/50 last:border-0 last:pb-0">
                    <span className="text-gray-500 font-bold">Reg. Deadline</span>
                    <span className="text-orange-600 font-black bg-orange-50 px-2 py-1 rounded-lg">
                      {drive.registration_end
                        ? new Date(drive.registration_end).toLocaleDateString()
                        : "No Deadline"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium pt-2">
                    <span className="text-gray-500 font-bold">Coordinator</span>
                    <span className="text-black font-black flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                        {drive.coordinator ? drive.coordinator.first_name.charAt(0) : "A"}
                      </div>
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
                  className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                >
                  <ExternalLink className="w-5 h-5" /> Visit Registration Link
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 flex justify-end bg-gray-50/30">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
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
      // Parallel fetch optimized
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
    },
    {
      name: "Placed Students",
      value: stats?.placedStudents || 0,
      icon: GraduationCap,
    },
    {
      name: "Placement Rate",
      value: `${stats?.placementPercentage || 0}%`,
      icon: BarChart3,
    },
    {
      name: "Applications",
      value: stats?.totalApplications || 0,
      icon: ArrowUpRight,
    },
  ];

  if (loading && !stats)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Accessing Department Data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  {isPC ? "Coordinator Access" : "Faculty View"}
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none">
                Dept. <span className="text-blue-600">Placement Hub.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                Welcome back,{" "}
                <span className="text-black font-bold underline decoration-blue-500/30 underline-offset-4">
                  {user?.first_name}
                </span>
                . Tracking recruitment progress for {user?.department?.name || "your department"}.
              </p>
            </div>

            {/* Tab/Action Switcher */}
            <div className="bg-gray-100/50 p-1.5 rounded-[1.5rem] flex items-center border border-gray-200/50">
              <button
                onClick={() => setActiveTab("drives")}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === "drives"
                  ? "bg-white text-blue-600 shadow-lg shadow-gray-200/50 scale-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                  }`}
              >
                <Calendar className="w-4 h-4" /> Drives
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === "students"
                  ? "bg-white text-blue-600 shadow-lg shadow-gray-200/50 scale-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                  }`}
              >
                <Users className="w-4 h-4" /> Students
              </button>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {statCards.map((stat, idx) => (
            <div
              key={stat.name}
              className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-blue-200 shadow-[0_2px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.08)] transition-all duration-500 ease-out overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                <stat.icon className="w-24 h-24 text-blue-600" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 mb-6">
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  {stat.name}
                </p>
                <span className="text-4xl font-black text-black tracking-tighter group-hover:text-blue-600 transition-colors duration-500">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeTab === "drives" ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    Active Recruitment Drives
                  </h2>
                  <p className="text-sm text-gray-400 font-medium pl-4">
                    Manage and track ongoing placement activities
                  </p>
                </div>
                <div className="hidden md:flex px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                  {drives.length} Active Rounds
                </div>
              </div>

              {drives.length === 0 ? (
                <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <div className="mx-auto w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                    <Briefcase className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="text-black font-black text-2xl tracking-tight">
                    No active drives found.
                  </h3>
                  <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium leading-relaxed">
                    Once recruitment drives are scheduled, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {drives.map((drive) => (
                    <div
                      key={drive.id}
                      className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-blue-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between relative z-10">
                        {/* Company Info */}
                        <div className="flex gap-6 items-start lg:items-center flex-1">
                          <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border border-gray-100 text-3xl font-black text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-500 overflow-hidden shadow-sm shrink-0">
                            {drive.job_posting?.company?.logo_url ? (
                              <img
                                src={drive.job_posting.company.logo_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-10 h-10" />
                            )}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-2xl font-black text-black group-hover:text-blue-600 transition-colors tracking-tight leading-none">
                                {drive.drive_name}
                              </h3>
                              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                {drive.job_posting?.company?.name} • {drive.job_posting?.job_role}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                                <Calendar className="w-3 h-3" />
                                {drive.drive_date || "TBD"}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                                <Clock className="w-3 h-3" />
                                {drive.mode}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats & Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                          {/* Mini Stats */}
                          <div className="flex gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                            <div className="px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 min-w-[100px] text-center">
                              <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Applied</p>
                              <p className="text-xl font-black text-emerald-700">{drive.stats?.appliedCount || 0}</p>
                            </div>
                            <div className="px-5 py-3 bg-amber-50 rounded-2xl border border-amber-100 min-w-[100px] text-center">
                              <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Pending</p>
                              <p className="text-xl font-black text-amber-700">{drive.stats?.pendingCount || 0}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => setSelectedDriveForModal(drive.id)}
                              className="px-6 py-3 bg-white border border-gray-200 text-black text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-colors w-full"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => toggleDriveExpansion(drive.id)}
                              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all w-full flex items-center justify-center gap-2 ${expandedDrive === drive.id
                                ? "bg-black text-white"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                                }`}
                            >
                              {expandedDrive === drive.id ? (
                                <>Hide Students <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>View Students <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Student Matrix */}
                      {expandedDrive === drive.id && (
                        <div className="mt-8 border-t-2 border-gray-50 pt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                            <h4 className="font-black text-gray-900 flex items-center gap-3 text-lg mb-6">
                              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                                <Users className="w-4 h-4" />
                              </div>
                              Student Participation
                              {loadingParticipation && (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin ml-2"></div>
                              )}
                            </h4>

                            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Candidate</th>
                                    <th className="px-8 py-5">Class</th>
                                    <th className="px-8 py-5">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {driveParticipation[drive.id]?.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="px-8 py-4">
                                        <div className="font-bold text-black text-sm">{student.name}</div>
                                        <div className="text-[10px] font-mono text-gray-400 uppercase">{student.id_number}</div>
                                      </td>
                                      <td className="px-8 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                          {student.batch} • {student.section}
                                        </span>
                                      </td>
                                      <td className="px-8 py-4">
                                        {student.status === "Applied" ? (
                                          <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Applied
                                          </span>
                                        ) : (
                                          <span className="text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Pending
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                  {(!driveParticipation[drive.id] || driveParticipation[drive.id].length === 0) && !loadingParticipation && (
                                    <tr>
                                      <td colSpan="3" className="px-8 py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        No data available
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
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Filters Section */}
              <div className="bg-white rounded-[2rem] p-2 border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col md:flex-row gap-4 md:items-center justify-between sticky top-4 z-20">
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-black leading-none">Student Registry</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {filteredStudents.length} Candidates Found
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-2">
                  {/* Batch Select */}
                  <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                    <select
                      className="pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors appearance-none min-w-[140px]"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                      <option value="">All Batches</option>
                      {batches.map((batch) => (
                        <option key={batch} value={batch}>Batch {batch}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Select */}
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                    <select
                      className="pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:bg-gray-100 transition-colors appearance-none min-w-[140px]"
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="">All Sections</option>
                      {sections.map((sec) => (
                        <option key={sec} value={sec}>Sec {sec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search */}
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="SEARCH BY NAME OR ID..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-wider text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Student Candidate</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">ID Number</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Batch Info</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Placement</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Package</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-8 py-24 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                              <UserCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No students match your criteria</p>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => {
                          const placement = student.placements?.[0];
                          return (
                            <tr key={student.id} className="group hover:bg-blue-50/20 transition-all duration-300">
                              <td className="px-8 py-5">
                                <div className="font-bold text-black text-sm group-hover:text-blue-600 transition-colors">
                                  {student.first_name} {student.last_name}
                                </div>
                                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-tight mt-0.5">
                                  {student.email}
                                </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className="font-mono text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {student.id_number}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                  Batch {student.batch_year || "N/A"}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <div className="flex justify-center">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${placement
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-gray-50 text-gray-500 border border-gray-100"
                                    }`}>
                                    {placement ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {placement ? "Placed" : "Open"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                {placement ? (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-xs font-bold text-gray-900">{placement.job_posting?.company?.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-300 font-bold text-xs">-</span>
                                )}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span className={`font-mono text-xs font-bold ${placement ? 'text-black' : 'text-gray-300'}`}>
                                  {placement?.job_posting?.ctc_lpa ? `₹${placement.job_posting.ctc_lpa} LPA` : "-"}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
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
