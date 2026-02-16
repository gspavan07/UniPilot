import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Users,
  ChevronRight,
  GraduationCap,
  Calendar,
  Layout,
  Loader2,
  SearchX,
  BookOpen,
  Filter,
  User,
  Layers,
  Building2
} from "lucide-react";
import api from "../../utils/api";

const MySections = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [batchFilter, setBatchFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const params = {};

        // Role-based logic
        const roleSlug = user?.role_data?.slug || user?.role;
        if (roleSlug === "hod") {
          params.department_id = user.department_id;
        } else {
          params.faculty_id = user.id;
        }

        const response = await api.get("/section-incharges", { params });

        if (response.data.success) {
          setSections(response.data.data);
        } else {
          setError("Failed to fetch sections");
        }
      } catch (err) {
        console.error("Error fetching sections:", err);
        setError("An error occurred while loading sections. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSections();
    }
  }, [user?.id, user?.department_id, user?.role, user?.role_data]);

  const uniqueBatches = [...new Set(sections.map((s) => s.batch_year))].sort(
    (a, b) => b - a,
  );
  const uniqueSectionNames = [
    ...new Set(sections.map((s) => s.section)),
  ].sort();

  const filteredSections = sections.filter((s) => {
    return (
      (batchFilter === "" || s.batch_year === batchFilter) &&
      (sectionFilter === "" || s.section === sectionFilter)
    );
  });

  const uniquePrograms = [...new Set(sections.map(s => s.program?.code))].length;

  const roleSlug = user?.role_data?.slug || user?.role;
  const isHOD = roleSlug === "hod";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
          Organizing academic data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-12">

        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                {isHOD ? "Department Overview" : "Faculty Management"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                {isHOD ? "Department" : "My"} <span className="text-blue-600">Students.</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-lg">
                {isHOD
                  ? `Overview of all sections and students within the ${user.department?.name || "Department"}.`
                  : "Access and manage student records across your assigned sections."}
              </p>
            </div>

            {/* Context Stats / Filters */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-gray-300 shadow-sm">
                <Filter className="w-4 h-4 text-gray-400" />
                <div className="flex flex-col">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Batch Year
                </label>
                {/* Wrap in a relative container */}
                <div className="relative inline-block">
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="appearance-none bg-transparent font-black text-sm text-blue-600 border-none outline-none focus:outline-none focus:ring-0 cursor-pointer pr-5 leading-none"
                  >
                    <option value="">All Years</option>
                    {uniqueBatches.map((b) => (
                      <option key={b} value={b}>
                        {b} Batch
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              </div>

              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-gray-300 shadow-sm">
                <Layout className="w-4 h-4 text-gray-400" />
                <div className="flex flex-col">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Section
                  </label>
                  <div className="relative inline-block">
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="appearance-none bg-transparent font-black text-sm text-blue-600 border-none outline-none focus:outline-none focus:ring-0 cursor-pointer pr-8 leading-none"
                  >
                    <option value="">All Sections</option>
                    {uniqueSectionNames.map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              label: "Total Sections",
              value: sections.length,
              icon: Layers,
              bg: "bg-blue-50",
              color: "text-blue-600"
            },
            {
              label: "Active Batches",
              value: uniqueBatches.length,
              icon: Calendar,
              bg: "bg-purple-50",
              color: "text-purple-600"
            },
            {
              label: "Programs",
              value: uniquePrograms,
              icon: BookOpen,
              bg: "bg-emerald-50",
              color: "text-emerald-600"
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-8 rounded-[2rem] border border-blue-100 bg-white transition-all duration-500 shadow-md shadow-black/[0.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-300"
            >
              <stat.icon
                className={`w-8 h-8 mb-6 ${stat.color}`}
              />
              <p className="text-4xl font-black text-black mb-1">
                {stat.value}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div> */}

        {error ? (
          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
              <SearchX className="w-8 h-8" />
            </div>
            <p className="text-red-900 font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="bg-gray-50/50 rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
              <SearchX className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-black mb-2">
              No Sections Found
            </h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto text-sm">
              Try adjusting your filters or contact administration if you believe this is an error.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSections.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  navigate(
                    `/my-students/view/${item.program_id}/${item.batch_year}/${item.section}`,
                  )
                }
                className="p-8 rounded-[2.5rem] bg-white border border-gray-200 shadow-lg shadow-gray-200/20 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 group text-left relative overflow-hidden"
              >
                {/* Decorative Background Blob */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                    Section {item.section}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                <h4 className="text-xl font-black text-black mb-1 leading-tight group-hover:text-blue-600 transition-colors relative z-10 line-clamp-2">
                  {item.program?.name || "Academic Program"}
                </h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-8 relative z-10">
                  {item.program?.code}
                </p>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Batch</p>
                    <p className="text-sm font-black text-gray-900">{item.batch_year}</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Type</p>
                    <p className="text-sm font-black text-gray-900">Regular</p>
                  </div>
                </div>

                {isHOD && (
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-6 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Incharge</p>
                      <p className="text-xs font-bold text-gray-900">{item.faculty?.first_name} {item.faculty?.last_name}</p>
                    </div>
                  </div>
                )}

                {!isHOD && (
                  <div className="flex items-center gap-2 mt-auto pt-6 border-t border-gray-100 text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                    <Users className="w-4 h-4" />
                    <span>Manage Students</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySections;
