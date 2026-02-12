import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Filter,
  Edit2,
  Trash2,
  GraduationCap,
  Loader2,
  MoreVertical,
  Building2,
  Layers,
  Calendar,
  ChevronRight,
} from "lucide-react";

const ProgramList = () => {
  const dispatch = useDispatch();
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
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            Academic Programs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage degree programs, curriculum structure, and enrollment
            statuses.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="btn btn-primary flex items-center shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Program
        </button>
      </div>

      {/* Stats Quick View */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 border-none">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                Total Programs
              </p>
              <h3 className="text-3xl font-black mt-1 font-display">
                {programs.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Active Enrollment
              </p>
              <h3 className="text-2xl font-bold mt-1 dark:text-white font-display">
                {programs.filter((p) => p.is_active).length}{" "}
                <span className="text-xs text-success-500 font-normal ml-1">
                  Live
                </span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-success-50 dark:bg-success-900/20 rounded-2xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
        <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Avg. Duration
              </p>
              <h3 className="text-2xl font-bold mt-1 dark:text-white font-display">
                3.8{" "}
                <span className="text-xs text-gray-400 font-normal ml-1">
                  Years
                </span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div> */}

      {/* Table/List Section */}
      <div className="card overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, code or department..."
              className="input pl-10 w-full focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <div className="flex gap-2">
            <button className="btn bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters
            </button>
          </div> */}
        </div>

        {programStatus === "loading" && programs.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">
              Crunching academic data...
            </p>
          </div>
        ) : programError ? (
          <div className="py-24 text-center">
            <p className="text-error-500 font-bold mb-2">
              Failed to load programs
            </p>
            <p className="text-gray-500 text-sm mb-6">{programError}</p>
            <button
              onClick={() => dispatch(fetchPrograms())}
              className="btn btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-bold mb-1">
              No programs found
            </p>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Ready to expand the curriculum? Create your first academic
              program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Program Details
                    <span className="font-black mt-1 font-display">
                      ({programs.length})
                    </span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Department
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Structure
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPrograms.map((prog) => (
                  <tr
                    key={prog.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            {prog.degree_type?.substring(0, 1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {prog.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-0.5">
                            {prog.code} • {prog.degree_type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {prog.department?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {prog.duration_years} Years
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {prog.total_semesters} Semesters
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          prog.is_active
                            ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                        }`}
                      >
                        {prog.is_active ? "Enrollment Open" : "Discontinued"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-10 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => openEditForm(prog)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prog.id)}
                          className="p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
