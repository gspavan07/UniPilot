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
  const [activeTab, setActiveTab] = useState("students"); // 'students' or 'incharges'
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
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <Layout className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Section Management</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Organize students into batches and assign faculty incharges
            </p>
          </div>
        </div>
      </header>

      {/* Filters & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
            <h3 className="font-bold mb-4 flex items-center text-sm uppercase tracking-wider text-gray-500">
              <Filter className="w-4 h-4 mr-2" />
              Smart Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Department
                </label>
                <select
                  className={`w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm ${currentUser?.role === "hod" ? "opacity-50" : ""}`}
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
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Program
                </label>
                <select
                  className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm"
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
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Batch Year
                </label>
                <select
                  className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm"
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

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">
                  {activeTab === "students"
                    ? "Target Section"
                    : "Assign Faculty Incharge"}
                </label>

                {activeTab === "students" ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter Section (e.g. A, B, C)"
                      className="w-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl text-sm font-bold placeholder:font-normal focus:ring-2 focus:ring-purple-500"
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                    />
                    <button
                      onClick={handleApply}
                      disabled={selectedIds.length === 0 || !targetSection}
                      className="w-full mt-3 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                      <ListChecks className="w-4 h-4" />
                      Apply to {selectedIds.length} Students
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <select
                      className="w-full bg-purple-50 dark:bg-purple-900/20 border-none rounded-xl text-sm"
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
                      className="w-full bg-purple-50 dark:bg-purple-900/20 border-none rounded-xl text-sm"
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
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
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

        <div className="lg:col-span-3 space-y-4">
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "students" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Users className="w-4 h-4" />
              Assign Students
            </button>
            <button
              onClick={() => setActiveTab("incharges")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "incharges" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Faculty Incharges
            </button>
          </div>

          {activeTab === "students" ? (
            <>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search students by name, ID or email..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-purple-500 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {status === "loading" && users.length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-purple-500" />
                    <p>Fetching students...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center text-gray-400 text-center">
                    <Users className="w-16 h-16 opacity-10 mb-4" />
                    <p className="font-bold text-gray-500">No students found</p>
                    <p className="text-sm">
                      Try adjusting your filters or department selection
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-4 w-10">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                              checked={
                                selectedIds.length === users.length &&
                                users.length > 0
                              }
                              onChange={toggleAll}
                            />
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                            Student Identity
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                            Program & Batch
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                            Current Section
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                                checked={selectedIds.includes(u.id)}
                                onChange={() => toggleSelect(u.id)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 font-bold border border-purple-100 dark:border-purple-800/30">
                                  {u.first_name[0]}
                                  {u.last_name[0]}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                    {u.first_name} {u.last_name}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {u.student_id || u.admission_number}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {u.program?.code || "N/A"}
                              </p>
                              <p className="text-xs text-gray-400">
                                Batch {u.batch_year || "N/A"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              {u.section ? (
                                <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Section Info
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Faculty Incharge
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Academic Year
                      </th>
                      <th className="px-6 py-4 text-right pr-10 text-xs font-bold uppercase tracking-wider text-gray-500">
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
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                                {idx.section}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                  Section {idx.section}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {idx.program?.code} | Batch {idx.batch_year}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-xs font-bold">
                                {idx.faculty?.first_name?.[0]}
                                {idx.faculty?.last_name?.[0]}
                              </div>
                              <div className="ml-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {idx.faculty?.first_name}{" "}
                                  {idx.faculty?.last_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {idx.faculty?.employee_id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-gray-500">
                              {idx.academic_year}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right pr-6">
                            <button
                              onClick={() => handleRemoveIncharge(idx.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                          className="px-6 py-10 text-center text-gray-400"
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
  );
};

export default SectionManager;
