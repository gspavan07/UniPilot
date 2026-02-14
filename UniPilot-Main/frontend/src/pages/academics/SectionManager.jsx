import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Search,
  Filter,
  Layout,
  Loader2,
  ListChecks,
  Trash2,
  ShieldCheck,
  UserPlus,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import {
  fetchUsers,
  bulkUpdateSections,
  fetchBatchYears,
  fetchSectionIncharges,
  assignSectionIncharge,
  removeSectionIncharge,
} from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import toast from "react-hot-toast";

const SectionManager = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users, status, batchYears, sectionIncharges } = useSelector(
    (state) => state.users,
  );
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState(
    currentUser?.role === "hod" ? currentUser?.department_id : "",
  );
  const [progFilter, setProgFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetSection, setTargetSection] = useState("");

  // Faculty Incharge State
  const [activeTab, setActiveTab] = useState("students");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [inchargeSection, setInchargeSection] = useState("");
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBatchYears({ department_id: deptFilter }));
    if (deptFilter) {
      dispatch(fetchSectionIncharges({ department_id: deptFilter }));
    }
  }, [dispatch, deptFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchUsers({
          role: "student",
          department_id: deptFilter,
          program_id: progFilter,
          batch_year: batchFilter,
          search: searchTerm,
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, deptFilter, progFilter, batchFilter, searchTerm]);

  // Fetch Faculty when needed
  useEffect(() => {
    const loadFaculty = async () => {
      if (activeTab === "incharges" && deptFilter) {
        setLoadingFaculty(true);
        try {
          const response = await dispatch(
            fetchUsers({
              role: "faculty,hod",
              department_id: deptFilter,
            }),
          ).unwrap();
          setFacultyList(response);
        } catch (error) {
          toast.error("Failed to load faculty");
        } finally {
          setLoadingFaculty(false);
        }
      }
    };
    loadFaculty();
  }, [dispatch, activeTab, deptFilter]);

  // Get unique sections from current users list
  const uniqueSections = [
    ...new Set(users.map((u) => u.section).filter(Boolean)),
  ].sort();

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleApply = async () => {
    if (!targetSection) {
      toast.error("Please enter a section name");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      await dispatch(
        bulkUpdateSections({
          userIds: selectedIds,
          section: targetSection,
        }),
      ).unwrap();
      toast.success(
        `Successfully assigned ${selectedIds.length} students to Section ${targetSection}`,
      );
      setSelectedIds([]);
      setTargetSection("");
    } catch (error) {
      toast.error(error || "Failed to update sections");
    }
  };

  const handleAssignIncharge = async () => {
    if (
      !selectedFaculty ||
      !inchargeSection ||
      !progFilter ||
      !batchFilter ||
      !deptFilter
    ) {
      toast.error("Please fill all details and ensure filters are set");
      return;
    }

    try {
      await dispatch(
        assignSectionIncharge({
          faculty_id: selectedFaculty,
          department_id: deptFilter,
          program_id: progFilter,
          batch_year: batchFilter,
          section: inchargeSection,
          academic_year: `${batchFilter}-${parseInt(batchFilter) + 4}`,
        }),
      ).unwrap();
      toast.success("Section Incharge assigned successfully");
      setSelectedFaculty("");
      setInchargeSection("");
    } catch (error) {
      toast.error(error || "Failed to assign incharge");
    }
  };

  const handleRemoveIncharge = async (id) => {
    if (!window.confirm("Are you sure you want to remove this incharge?"))
      return;
    try {
      await dispatch(
        removeSectionIncharge({ id, department_id: deptFilter }),
      ).unwrap();
      toast.success("Incharge removed successfully");
    } catch (error) {
      toast.error(error || "Failed to remove incharge");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
        >
          <ArrowLeft
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            strokeWidth={2.5}
          />
          Back
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Layout className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Section Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organize students into sections and assign faculty incharges
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-6 space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-wide">
                  Filters
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Department
                  </label>
                  <select
                    className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white ${currentUser?.role === "hod" ? "opacity-50 cursor-not-allowed" : ""}`}
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    disabled={currentUser?.role === "hod"}
                  >
                    <option value="">All Departments</option>
                    {departments
                      .filter((d) => d.type === "academic")
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Program
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                    value={progFilter}
                    onChange={(e) => setProgFilter(e.target.value)}
                  >
                    <option value="">All Programs</option>
                    {programs
                      .filter(
                        (p) => !deptFilter || p.department_id === deptFilter,
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Batch Year
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                  >
                    <option value="">All Batches</option>
                    {batchYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
                    {activeTab === "students"
                      ? "Target Section"
                      : "Assign Incharge"}
                  </label>

                  {activeTab === "students" ? (
                    <>
                      <input
                        type="text"
                        placeholder="e.g. A, B, C"
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white font-semibold placeholder:font-normal mb-3"
                        value={targetSection}
                        onChange={(e) => setTargetSection(e.target.value)}
                      />
                      <button
                        onClick={handleApply}
                        disabled={selectedIds.length === 0 || !targetSection}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ListChecks className="w-4 h-4" />
                        Apply to {selectedIds.length} Students
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <select
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        disabled={loadingFaculty}
                      >
                        <option value="">Select Faculty</option>
                        {facultyList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.first_name} {f.last_name} ({f.employee_id})
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                        value={inchargeSection}
                        onChange={(e) => setInchargeSection(e.target.value)}
                      >
                        <option value="">Select Section</option>
                        {uniqueSections.map((s) => (
                          <option key={s} value={s}>
                            Section {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleAssignIncharge}
                        disabled={!selectedFaculty || !inchargeSection}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Incharge
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tab Switcher */}
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
              <button
                onClick={() => setActiveTab("students")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === "students" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"}`}
              >
                <Users className="w-4 h-4" />
                Assign Students
              </button>
              <button
                onClick={() => setActiveTab("incharges")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === "incharges" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"}`}
              >
                <ShieldCheck className="w-4 h-4" />
                Faculty Incharges
              </button>
            </div>

            {activeTab === "students" ? (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name, ID or email..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Students Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {status === "loading" && users.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600 dark:text-blue-400" />
                      <p className="font-medium">Fetching students...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                      <Users className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
                      <p className="font-semibold text-black dark:text-white mb-1">
                        No students found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or department selection
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-6 py-4 w-10">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                checked={
                                  selectedIds.length === users.length &&
                                  users.length > 0
                                }
                                onChange={toggleAll}
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                              Student
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                              Program & Batch
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                              Current Section
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {users.map((u) => (
                            <tr
                              key={u.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                  checked={selectedIds.includes(u.id)}
                                  onChange={() => toggleSelect(u.id)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-800/30 text-sm">
                                    {u.first_name[0]}
                                    {u.last_name[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-black dark:text-white">
                                      {u.first_name} {u.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {u.student_id || u.admission_number}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {u.program?.code || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Batch {u.batch_year || "N/A"}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                {u.section ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
                                    Section {u.section}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">
                                    Not Assigned
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Faculty Incharges Table */
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          Section Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          Faculty Incharge
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          Academic Year
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {sectionIncharges
                        .filter(
                          (idx) =>
                            (!progFilter || idx.program_id === progFilter) &&
                            (!batchFilter || idx.batch_year === batchFilter),
                        )
                        .map((idx) => (
                          <tr
                            key={idx.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-800/30">
                                  {idx.section}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-black dark:text-white">
                                    Section {idx.section}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {idx.program?.code} | Batch {idx.batch_year}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-semibold">
                                  {idx.faculty?.first_name?.[0]}
                                  {idx.faculty?.last_name?.[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {idx.faculty?.first_name}{" "}
                                    {idx.faculty?.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {idx.faculty?.employee_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {idx.academic_year}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRemoveIncharge(idx.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {sectionIncharges.filter(
                        (idx) =>
                          (!progFilter || idx.program_id === progFilter) &&
                          (!batchFilter || idx.batch_year === batchFilter),
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            No faculty incharges assigned for this criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionManager;
