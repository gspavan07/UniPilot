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
} from "lucide-react";

const RegulationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { regulations, status } = useSelector((state) => state.regulations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            Academic Regulations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage curriculum versions (e.g., R18, R23) and grading rules.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-5 h-5" />
          Create Regulation
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regulations.map((reg) => (
          <div
            key={reg.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary-500/20 transition-all relative overflow-hidden"
          >
            {/* Active Badge */}
            <div
              className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${reg.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500"}`}
            >
              {reg.is_active ? "ACTIVE" : "INACTIVE"}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl">
                  {reg.name.substring(0, 4)}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(reg)}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
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

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 min-h-[2.5rem]">
                {reg.description || "No description provided."}
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{reg.academic_year}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 capitalize">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>{reg.type} System</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span>{reg.grading_system}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Book className="w-4 h-4 text-gray-400" />
                  <span>{reg.courses?.length || 0} Courses Linked</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate(`/regulations/${reg.id}/curriculum`)}
                  className="w-full py-2.5 rounded-xl border border-primary-100 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-sm bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  View Courses
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {regulations.length === 0 && status === "succeeded" && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No Regulations Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mt-1">
              Create your first academic regulation (e.g., R23) to start
              managing curriculum versions.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-6 text-primary-600 font-medium hover:text-primary-700"
            >
              + Create New Regulation
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="semester">Semester</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="CBCS">CBCS (Choice Based)</option>
                    <option value="CGPA">CGPA 10.0</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Brief description of the regulation..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium transition-colors shadow-lg shadow-primary-600/20"
                >
                  {editingId ? "Save Changes" : "Create Regulation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationList;
