import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchExamConfig,
  updateCourseType,
  deleteCourseType,
} from "../../store/slices/examConfigSlice";
import { ArrowLeft, Settings2, Plus, Save, AlertCircle } from "lucide-react";
import CourseTypeSelector from "../../components/exam-config/CourseTypeSelector";
import ExamComponentNode from "../../components/exam-config/ExamComponentNode";
import ComponentForm from "../../components/exam-config/ComponentForm";

const ExamConfigurationManager = ({ embedded = false }) => {
  const { regulationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentConfig, status } = useSelector((state) => state.examConfig);
  const [selectedCourseType, setSelectedCourseType] = useState(null);
  const [isComponentFormOpen, setIsComponentFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [parentPath, setParentPath] = useState([]);

  useEffect(() => {
    if (regulationId) {
      dispatch(fetchExamConfig(regulationId));
    }
  }, [dispatch, regulationId]);

  useEffect(() => {
    // Auto-select first course type when config loads
    if (currentConfig?.course_types?.length > 0 && !selectedCourseType) {
      setSelectedCourseType(currentConfig.course_types[0]);
    }
  }, [currentConfig, selectedCourseType]);

  // Sync selectedCourseType with Redux state when it updates
  useEffect(() => {
    if (selectedCourseType && currentConfig?.course_types) {
      const updated = currentConfig.course_types.find(
        (ct) => ct.id === selectedCourseType.id,
      );
      if (updated) {
        setSelectedCourseType(updated);
      }
    }
  }, [currentConfig]);

  const handleAddComponent = (parent = null, path = []) => {
    setEditingComponent(null);
    setParentPath(path);
    setIsComponentFormOpen(true);
  };

  const handleEditComponent = (component, path) => {
    setEditingComponent(component);
    setParentPath(path);
    setIsComponentFormOpen(true);
  };

  // Deep clone function to avoid mutating frozen Redux state
  const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  const handleSaveComponent = (componentData) => {
    if (!selectedCourseType) return;

    // Deep clone to avoid mutating frozen Redux state
    const updatedCourseType = deepClone(selectedCourseType);

    if (editingComponent) {
      // Edit existing component
      updateComponentInTree(
        updatedCourseType.structure,
        parentPath,
        componentData,
      );
    } else {
      // Add new component
      addComponentToTree(
        updatedCourseType.structure,
        parentPath,
        componentData,
      );
    }

    dispatch(
      updateCourseType({
        regulationId,
        courseTypeId: selectedCourseType.id,
        courseType: updatedCourseType,
      }),
    );

    setIsComponentFormOpen(false);
  };

  const handleDeleteComponent = (path) => {
    if (
      !selectedCourseType ||
      !window.confirm("Are you sure you want to delete this component?")
    ) {
      return;
    }

    // Deep clone to avoid mutating frozen Redux state
    const updatedCourseType = deepClone(selectedCourseType);
    deleteComponentFromTree(updatedCourseType.structure, path);

    dispatch(
      updateCourseType({
        regulationId,
        courseTypeId: selectedCourseType.id,
        courseType: updatedCourseType,
      }),
    );
  };

  const updateComponentInTree = (node, path, newData) => {
    if (path.length === 0) {
      Object.assign(node, newData);
      return;
    }

    if (path.length === 1) {
      // Find and update the child component directly
      const childIndex = node.components?.findIndex((c) => c.id === path[0]);
      if (childIndex !== -1) {
        Object.assign(node.components[childIndex], newData);
      }
      return;
    }

    const [currentId, ...restPath] = path;
    const childIndex = node.components?.findIndex((c) => c.id === currentId);

    if (childIndex !== -1) {
      updateComponentInTree(node.components[childIndex], restPath, newData);
    }
  };

  const addComponentToTree = (node, path, newComponent) => {
    if (path.length === 0) {
      if (!node.components) {
        node.components = [];
      }
      node.components.push(newComponent);
      return;
    }

    const [currentId, ...restPath] = path;
    const childIndex = node.components?.findIndex((c) => c.id === currentId);

    if (childIndex !== -1) {
      addComponentToTree(node.components[childIndex], restPath, newComponent);
    }
  };

  const deleteComponentFromTree = (node, path) => {
    if (path.length === 1) {
      node.components = node.components?.filter((c) => c.id !== path[0]);
      return;
    }

    const [currentId, ...restPath] = path;
    const childIndex = node.components?.findIndex((c) => c.id === currentId);

    if (childIndex !== -1) {
      deleteComponentFromTree(node.components[childIndex], restPath);
    }
  };

  const handleToggleExam = (path, isExam) => {
    if (!selectedCourseType) return;

    // Deep clone to avoid mutating frozen Redux state
    const updatedCourseType = deepClone(selectedCourseType);
    toggleExamInTree(updatedCourseType.structure, path, isExam);

    dispatch(
      updateCourseType({
        regulationId,
        courseTypeId: selectedCourseType.id,
        courseType: updatedCourseType,
      }),
    );
  };

  const toggleExamInTree = (node, path, isExam) => {
    if (path.length === 0) {
      node.isExam = isExam;
      return;
    }

    if (path.length === 1) {
      const childIndex = node.components?.findIndex((c) => c.id === path[0]);
      if (childIndex !== -1) {
        node.components[childIndex].isExam = isExam;
      }
      return;
    }

    const [currentId, ...restPath] = path;
    const childIndex = node.components?.findIndex((c) => c.id === currentId);

    if (childIndex !== -1) {
      toggleExamInTree(node.components[childIndex], restPath, isExam);
    }
  };

  return (
    <div
      className={`min-h-screen bg-white dark:bg-gray-900 ${embedded ? "" : "p-6 lg:p-10"}`}
    >
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header - hidden when embedded */}
        {!embedded && (
          <div className="flex flex-col gap-6">
            <button
              onClick={() => navigate("/regulations")}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold w-fit"
            >
              <ArrowLeft
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
              Back to Regulations
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Settings2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">
                    Exam Configuration
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Design flexible exam structures with unlimited hierarchical
                    components
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Course Type Selector */}
          <div className="lg:col-span-3">
            <CourseTypeSelector
              regulationId={regulationId}
              courseTypes={currentConfig?.course_types || []}
              selectedCourseType={selectedCourseType}
              onSelectCourseType={setSelectedCourseType}
            />
          </div>

          {/* Main Area - Component Tree */}
          <div className="lg:col-span-9">
            {selectedCourseType ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      {selectedCourseType.name} Structure
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Build hierarchical exam components with custom relations
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddComponent(null, [])}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Component
                  </button>
                </div>

                {/* Root Component */}
                {selectedCourseType.structure && (
                  <ExamComponentNode
                    component={selectedCourseType.structure}
                    path={[]}
                    onEdit={handleEditComponent}
                    onDelete={handleDeleteComponent}
                    onAddChild={handleAddComponent}
                    onToggleExam={handleToggleExam}
                    isRoot={true}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
                  No Course Type Selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Select or create a course type from the sidebar to start
                  configuring exam structure
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Component Form Modal */}
        {isComponentFormOpen && (
          <ComponentForm
            component={editingComponent}
            onSave={handleSaveComponent}
            onClose={() => setIsComponentFormOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ExamConfigurationManager;
