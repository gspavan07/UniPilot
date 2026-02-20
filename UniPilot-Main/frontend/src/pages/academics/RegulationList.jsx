import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchRegulations,
  createRegulation,
  updateRegulation,
  deleteRegulation,
} from "../../store/slices/regulationSlice";
import {
  BookOpen,
  Plus,
  MoreVertical,
  Calendar,
  Award,
  Book,
  Trash2,
  Edit2,
  X,
  FileText,
  Settings,
  ArrowLeft,
} from "lucide-react";

const RegulationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { regulations, status } = useSelector((state) => state.regulations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const user = useSelector((state) => state.auth.user);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    academic_year: "",
    type: "semester",
    grading_system: "CBCS",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchRegulations());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      academic_year: "",
      type: "semester",
      grading_system: "CBCS",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (reg) => {
    setEditingId(reg.id);
    setFormData({
      name: reg.name,
      academic_year: reg.academic_year,
      type: reg.type,
      grading_system: reg.grading_system,
      description: reg.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this regulation?")) {
      await dispatch(deleteRegulation(id));
      dispatch(fetchRegulations()); // Refresh
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await dispatch(updateRegulation({ id: editingId, data: formData }));
    } else {
      await dispatch(createRegulation(formData));
    }
    setIsModalOpen(false);
    dispatch(fetchRegulations());
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {user.role !== "hod" && (
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
        )}
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <BookOpen className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
                  Academic Regulations
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage curriculum versions and exam structures (e.g., R18,
                  R23)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Regulation
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regulations.map((reg) => {
            // Determine if this is the latest regulation
            const isLatest =
              regulations.reduce((latest, current) => {
                // Compare by academic year first (e.g., "2023-2024" > "2022-2023")
                if (current.academic_year > latest.academic_year)
                  return current;
                if (current.academic_year < latest.academic_year) return latest;

                // If academic years are equal, compare by regulation name (e.g., R23 > R18)
                // Extract numbers from regulation names for comparison
                const currentNum =
                  parseInt(current.name.replace(/\D/g, "")) || 0;
                const latestNum = parseInt(latest.name.replace(/\D/g, "")) || 0;

                return currentNum > latestNum ? current : latest;
              }, reg).id === reg.id;

            return (
              <div
                key={reg.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow relative"
              >
                {/* Active Badge - Only show for latest regulation */}
                {isLatest && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    ACTIVE
                  </div>
                )}

                <div className="flex items-start justify-between mb-4 pr-20">
                  <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                    {reg.name.substring(0, 4)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {reg.description || "No description provided."}
                </p>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{reg.academic_year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 capitalize">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="font-medium">{reg.type} System</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Award className="w-3.5 h-3.5" />
                    <span className="font-medium">{reg.grading_system}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Book className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {(() => {
                        // Calculate total unique courses from courses_list
                        if (
                          !reg.courses_list ||
                          typeof reg.courses_list !== "object"
                        )
                          return 0;

                        const uniqueCourses = new Set();

                        // Iterate through all programs
                        Object.values(reg.courses_list).forEach(
                          (programSemesters) => {
                            if (typeof programSemesters === "object") {
                              // Iterate through all semesters in each program
                              Object.values(programSemesters).forEach(
                                (courseArray) => {
                                  if (Array.isArray(courseArray)) {
                                    courseArray.forEach((courseId) =>
                                      uniqueCourses.add(courseId),
                                    );
                                  }
                                },
                              );
                            }
                          },
                        );

                        return uniqueCourses.size;
                      })()}{" "}
                      Courses
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/regulations/${reg.id}/curriculum`)
                    }
                    className="flex-1 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    View Courses
                  </button>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/academics/regulations/${reg.id}/configuration`,
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    <button
                      onClick={() => handleEdit(reg)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(reg.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {regulations.length === 0 && status === "succeeded" && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
                No Regulations Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
                Create your first academic regulation (e.g., R23) to start
                managing curriculum versions
              </p>
              <button
                onClick={handleOpenCreate}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Create New Regulation
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {editingId ? "Edit Regulation" : "New Regulation"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                      Regulation Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. R23"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                      Academic Year *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 2023-2024"
                      value={formData.academic_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_year: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="semester">Semester</option>
                      <option value="year">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                      Grading System
                    </label>
                    <select
                      value={formData.grading_system}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          grading_system: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CBCS">CBCS (Choice Based)</option>
                      <option value="CGPA">CGPA 10.0</option>
                      <option value="Percentage">Percentage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of the regulation..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    {editingId ? "Save Changes" : "Create Regulation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulationList;
