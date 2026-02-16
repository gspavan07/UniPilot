import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchPrograms,
  deleteProgram,
  createProgram,
  updateProgram,
} from "../../store/slices/programSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import ProgramForm from "./ProgramForm";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  Loader2,
  MoreVertical,
  Building2,
  Clock,
  ArrowLeft,
} from "lucide-react";

const ProgramList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    programs,
    status: programStatus,
    error: programError,
  } = useSelector((state) => state.programs);
  const { departments } = useSelector((state) => state.departments);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    dispatch(fetchPrograms());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      await dispatch(deleteProgram(id));
    }
  };

  const handleSave = async (formData) => {
    if (selectedProgram) {
      await dispatch(
        updateProgram({ id: selectedProgram.id, data: formData }),
      ).unwrap();
    } else {
      await dispatch(createProgram(formData)).unwrap();
    }
  };

  const openAddForm = () => {
    setSelectedProgram(null);
    setIsFormOpen(true);
  };

  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const filteredPrograms = programs.filter(
    (prog) =>
      prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.department?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/academics")}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
        >
          <ArrowLeft
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            strokeWidth={2.5}
          />
          Back to Academic Management
        </button>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <GraduationCap
                  className="w-7 h-7 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
                  Academic Programs
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {filteredPrograms.length} programs • Curriculum Management
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddForm}
            className="group px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Plus
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
              strokeWidth={3}
            />
            Add Program
          </button>
        </div>

        {/* Search Row */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            strokeWidth={2.5}
          />
          <input
            type="text"
            placeholder="Search by program name, code, or department..."
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-black dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Content Area */}
        {programStatus === "loading" && programs.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
              Loading programs...
            </p>
          </div>
        ) : programError ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              Failed to Load Programs
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {programError}
            </p>
            <button
              onClick={() => dispatch(fetchPrograms())}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              No Programs Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Ready to expand the curriculum? Create your first academic program"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPrograms.map((prog, idx) => (
              <div
                key={prog.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${idx * 50}ms forwards`,
                  opacity: 0,
                }}
              >
                {/* Top Accent Bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 group-hover:h-2 transition-all duration-300" />

                <div className="p-6">
                  {/* Degree Type Badge & Status */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                      <span className="text-blue-700 dark:text-blue-400 font-black text-sm tracking-wider uppercase">
                        {prog.degree_type || "N/A"}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${prog.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                        }`}
                    >
                      {prog.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Program Name */}
                  <h3 className="text-xl font-black text-black dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                    {prog.name}
                  </h3>

                  {/* Program Code */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg font-mono">
                      {prog.code}
                    </span>
                  </div>

                  {/* Program Details */}
                  <div className="space-y-3 pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                    {/* Department */}
                    <div className="flex items-start gap-2">
                      <Building2
                        className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                        strokeWidth={2}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                          Department
                        </p>
                        <p className="text-sm font-bold text-black dark:text-white truncate">
                          {prog.department?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-2">
                      <Clock
                        className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                        strokeWidth={2}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                          Duration
                        </p>
                        <p className="text-sm font-bold text-black dark:text-white">
                          {prog.duration_years} Years • {prog.total_semesters}{" "}
                          Semesters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-6 pt-5 border-t-2 border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => openEditForm(prog)}
                      className="flex-1 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2 group/btn"
                      title="Edit Program"
                    >
                      <Edit2
                        className="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
                        strokeWidth={2.5}
                      />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prog.id)}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                      title="Delete Program"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                      <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {/* Form Slide-over */}
      <ProgramForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        program={selectedProgram}
        departmentList={departments}
      />
    </div>
  );
};

export default ProgramList;
