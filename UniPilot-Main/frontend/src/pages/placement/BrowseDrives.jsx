import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEligibleDrives } from "../../store/slices/placementSlice";
import {
  Search,
  Filter,
  Briefcase,
  ChevronRight,
  Globe,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const BrowseDrives = () => {
  const dispatch = useDispatch();
  const { eligibleDrives, loading } = useSelector((state) => state.placement);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    dispatch(fetchEligibleDrives());
  }, [dispatch]);

  const filteredDrives = eligibleDrives.filter((drive) => {
    const matchesSearch =
      drive.drive_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.job_posting?.company?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterMode === "all" ||
      drive.mode.toLowerCase() === filterMode.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <PlacementBreadcrumbs
          items={[
            { label: "Dashboard", href: "/placement/student/dashboard" },
            { label: "Active Drives" },
          ]}
        />

        <header className="mt-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  Opportunity Hub
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {filteredDrives.length} Active Positions
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Recruitment <span className="text-blue-600">Drives.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                Explore high-impact career opportunities and specialized roles
                curated for your professional growth.
              </p>
            </div>

            {/* Modern Search/Filter Interface */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100 backdrop-blur-sm shadow-xl shadow-gray-200/20">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search company or role..."
                  className="w-full sm:w-64 pl-12 pr-6 py-4 bg-white border border-transparent rounded-[1.5rem] text-sm font-bold text-black focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all placeholder:text-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-[1.5rem] border border-gray-100">
                {["all", "Online", "In-Person"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === mode
                        ? "bg-gray-950 text-white shadow-lg shadow-black/10"
                        : "text-gray-400 hover:text-black hover:bg-gray-50"
                      }`}
                  >
                    {mode === "all" ? "All Modes" : mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[400px] bg-gray-50 rounded-[2.5rem] border border-gray-100"
              ></div>
            ))}
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
            <div className="mx-auto w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-gray-200/50 mb-8">
              <Filter className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-3xl font-black text-black tracking-tight mb-3">
              No matching drives.
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
              We couldn't find any recruitment drives matching your current
              filters. Try adjusting your search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredDrives.map((drive) => (
              <div
                key={drive.id}
                className="group relative bg-white rounded-[2.5rem] border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(59,130,246,0.08)] overflow-hidden flex flex-col"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors pointer-events-none"></div>

                <div className="p-10 flex-1">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-[1.2rem] flex items-center justify-center border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all duration-500 overflow-hidden shadow-sm">
                      {drive.job_posting?.company?.logo_url ? (
                        <img
                          src={drive.job_posting.company.logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-gray-300 group-hover:text-blue-600 transition-colors">
                          {drive.job_posting?.company?.name?.charAt(0) || "C"}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${drive.job_posting?.tier === "Super Dream"
                          ? "bg-purple-600 text-white shadow-purple-200"
                          : drive.job_posting?.tier === "Dream"
                            ? "bg-indigo-600 text-white shadow-indigo-200"
                            : "bg-gray-950 text-white shadow-gray-200"
                        }`}
                    >
                      {drive.job_posting?.tier || "Regular"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-2xl font-black text-black tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                      {drive.drive_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400">
                        {drive.job_posting?.company?.name}
                      </span>
                      <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                      <span className="text-sm font-black text-black tracking-tight">
                        ₹{drive.job_posting?.ctc_lpa} LPA
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-50 space-y-1">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-300 leading-none">
                        Location
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {drive.job_posting?.location || "Remote"}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-50 space-y-1">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-300 leading-none">
                        Mode
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        {drive.mode === "Virtual" ? (
                          <Globe className="w-3 h-3 text-purple-500" />
                        ) : (
                          <MapPin className="w-3 h-3 text-emerald-500" />
                        )}
                        {drive.mode}
                      </div>
                    </div>
                  </div>

                  {/* Deadline Indicator */}
                  <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-2xl mb-8">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                        Apply By
                      </p>
                      <p className="text-xs font-black text-black">
                        {new Date(drive.registration_end).toLocaleDateString(
                          undefined,
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                    {new Date(drive.registration_end) <
                      new Date(Date.now() + 86400000 * 2) && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                      )}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-6 pt-0 mt-auto">
                  {drive.hasApplied ? (
                    <Link
                      to="/placement/my-applications"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-gray-100 text-gray-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all border border-transparent shadow-sm"
                    >
                      Track Application
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : !drive.isEligible ? (
                    <div className="relative group/ineligible">
                      <div className="flex items-center justify-center gap-3 w-full py-5 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] border border-red-100/50 cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Ineligible to Apply
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-5 bg-gray-950 text-white rounded-[1.5rem] text-[10px] leading-relaxed opacity-0 group-hover/ineligible:opacity-100 transition-opacity pointer-events-none shadow-2xl z-20">
                        <span className="block font-black uppercase tracking-[0.2em] mb-2 text-red-400 border-b border-white/10 pb-2">
                          Why am I ineligible?
                        </span>
                        {drive.ineligible_reason ||
                          "You do not meet the minimum criteria defined by the recruiter for this specific drive."}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/placement/drives/${drive.id}/apply`}
                      className="group flex items-center justify-center gap-3 w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40"
                    >
                      Review & Apply
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseDrives;
