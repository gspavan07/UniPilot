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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium font-display">
          Organizing academic data...
        </p>
      </div>
    );
  }

  const roleSlug = user?.role_data?.slug || user?.role;
  const isHOD = roleSlug === "hod";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">
            {isHOD ? "Department Students" : "My Students"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isHOD
              ? `Managing all sections for the ${user.department?.name || "Department"}.`
              : "Access and manage students across your assigned sections."}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 dark:text-gray-300 py-0 cursor-pointer"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Layout className="w-4 h-4 text-gray-400" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 dark:text-gray-300 py-0 cursor-pointer"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
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

      {error ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 p-6 rounded-3xl text-center">
          <p className="text-rose-600 dark:text-rose-400 font-bold mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Matching Sections
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {sections.length === 0
              ? "You currently haven't been assigned to any sections."
              : "Try adjusting your filters to find the right section."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                navigate(
                  `/my-students/view/${item.program_id}/${item.batch_year}/${item.section}`,
                )
              }
              className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 text-left overflow-hidden"
            >
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                  <Layout className="w-8 h-8" />
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  Section {item.section}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
                    {item.program?.name || "Academic Program"}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>{item.program?.code || "N/A"}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <Calendar className="w-4 h-4 ml-1" />
                    <span>Batch {item.batch_year}</span>
                  </div>
                </div>

                {/* Faculty Info for HOD */}
                {isHOD && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    <span>
                      Incharge: {item.faculty?.first_name}{" "}
                      {item.faculty?.last_name}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      View Student List
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Strategic UI Touch */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Scalability Notice for South Indian Universities */}
      <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
          <GraduationCap className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Scale-Focused Academic Management
          </h4>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
            "We understand that South Indian universities manage massive student
            intakes. Our system is optimized to load thousands of records
            instantly, ensuring you can focus on mentorship rather than
            searching for data."
          </p>
          <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            UniPilot Engineering, Kakinada, AP
          </p>
        </div>
      </div>
    </div>
  );
};

export default MySections;
