import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserPlus,
  Search,
  Filter,
  Route as RouteIcon,
  MapPin,
  ChevronRight,
  Trash2,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  fetchAllocations,
  createAllocation,
  deleteAllocation,
  fetchRoutes,
  resetOperationStatus,
  syncSemesterFees,
} from "../../store/slices/transportSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchRoles } from "../../store/slices/roleSlice";
import { Link } from "react-router-dom";
import { RefreshCcw, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const StudentAllocation = () => {
  const dispatch = useDispatch();
  const { allocations, routes, status, operationStatus, operationError } =
    useSelector((state) => state.transport);
  const { users: students } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.departments);
  const { programs } = useSelector((state) => state.programs);
  const { roles } = useSelector((state) => state.roles);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    route_id: "",
    stop_id: "",
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncData, setSyncData] = useState({
    batch_year: new Date().getFullYear(),
    semester: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [activeSemesters, setActiveSemesters] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    department: "",
    program: "",
    batch: "",
  });

  // Tab state
  const [activeTab, setActiveTab] = useState("students"); // "students" or "employees"
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    dispatch(fetchAllocations());
    dispatch(fetchRoutes());
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    dispatch(fetchRoles());
  }, [dispatch]);

  // Fetch users based on active tab
  useEffect(() => {
    if (activeTab === "students") {
      dispatch(fetchUsers({ role: "student" }));
    } else if (activeTab === "employees" && roles && roles.length > 0) {
      // Fetch all staff roles (all non-student roles)
      const employeeRoles = roles
        .filter((r) => r.slug !== "student")
        .map((r) => r.slug)
        .join(",");

      if (employeeRoles) {
        dispatch(fetchUsers({ role: employeeRoles }));
      }
    }
  }, [activeTab, dispatch, roles]);

  // Extract unique batches from students
  useEffect(() => {
    if (students && students.length > 0) {
      const batches = [...new Set(students.map((s) => s.batch_year))]
        .filter(Boolean)
        .sort((a, b) => b - a); // Sort descending (newest first)
      setAvailableBatches(batches);
    }
  }, [students]);

  // Calculate active semesters for selected batch
  useEffect(() => {
    if (syncData.batch_year && students && Array.isArray(students)) {
      const batchStudents = students.filter(
        (s) => s.batch_year === parseInt(syncData.batch_year),
      );
      if (batchStudents.length > 0) {
        // Get the program duration (in years) from first student
        const programDuration = batchStudents[0]?.program?.duration || 4;
        const totalSemesters = programDuration * 2; // Convert years to semesters

        // Calculate which semester they should be in based on current date
        const currentYear = new Date().getFullYear();
        const yearsSinceBatch = currentYear - parseInt(syncData.batch_year);
        const currentSemester = Math.min(
          yearsSinceBatch * 2 + 1,
          totalSemesters,
        );

        // Show semesters from 1 to current semester
        const semesters = Array.from(
          { length: currentSemester },
          (_, i) => i + 1,
        );
        setActiveSemesters(semesters);
      } else {
        setActiveSemesters([]);
      }
    } else {
      setActiveSemesters([]);
    }
  }, [syncData.batch_year, students]);

  // Filter users (students or employees) based on search and filters
  useEffect(() => {
    if (students && Array.isArray(students) && students.length > 0) {
      const filtered = students.filter((s) => {
        // Search filter
        const matchesSearch =
          s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        // For students tab, apply additional filters
        if (activeTab === "students") {
          const matchesDept =
            !filters.department || s.department_id === filters.department;
          const matchesProgram =
            !filters.program || s.program_id === filters.program;
          const matchesBatch =
            !filters.batch || s.batch_year === parseInt(filters.batch);

          return matchesSearch && matchesDept && matchesProgram && matchesBatch;
        }

        // For employees tab, only search filter
        return matchesSearch;
      });
      setFilteredStudents(filtered);
    } else if (students && Array.isArray(students)) {
      setFilteredStudents([]);
    }
  }, [students, searchTerm, filters, activeTab]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      toast.success("Operation successful");
      setIsModalOpen(false);
      setIsSyncModalOpen(false);
      setSelectedStudent(null);
      setFormData({
        route_id: "",
        stop_id: "",
      });
      dispatch(fetchAllocations());
      dispatch(resetOperationStatus());
    } else if (operationStatus === "failed") {
      toast.error(operationError || "Operation failed");
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, operationError, dispatch]);

  const handleAllocateClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel this allocation?")) {
      dispatch(deleteAllocation(id));
    }
  };

  const selectedRoute = routes.find((r) => r.id === formData.route_id);

  const getAllocationForStudent = (studentId) => {
    return allocations?.find(
      (a) => a.student_id === studentId && a.status === "active",
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 font-display">
            <Link
              to="/transport"
              className="hover:text-primary-600 transition-colors"
            >
              Transport
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium whitespace-nowrap">
              Student Allocation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Route Allocations
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all font-display whitespace-nowrap"
          >
            <RefreshCcw className="-ml-1 mr-2 h-4 w-4" />
            Sync Fees
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("students")}
              className={`${activeTab === "students"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`${activeTab === "employees"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Employees
            </button>
          </nav>
        </div>
      </div>

      {/* Filters & Search - Students */}
      {activeTab === "students" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.department}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
              >
                <option value="">All Departments</option>
                {departments
                  ?.filter((d) => d.type === "academic")
                  .map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Program Filter */}
            <div>
              <select
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.program}
                onChange={(e) =>
                  setFilters({ ...filters, program: e.target.value })
                }
              >
                <option value="">All Programs</option>
                {programs?.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <select
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={filters.batch}
                onChange={(e) =>
                  setFilters({ ...filters, batch: e.target.value })
                }
              >
                <option value="">All Batches</option>
                {availableBatches.map((year) => (
                  <option key={year} value={year}>
                    {year} Batch
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search for Employees */}
      {activeTab === "employees" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Search employees by name, ID or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Students Table */}
      {activeTab === "students" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Academic Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Transport Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => {
                  const allocation = getAllocationForStudent(student.id);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                            {student.first_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {student.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {student.department?.name || "No Dept"}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {student.program?.name || "No Program"} • Batch:{" "}
                            {student.batch_year}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {allocation ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Active: {allocation.route?.name}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {allocation.stop?.stop_name} • ₹
                              {parseFloat(
                                allocation.stop?.zone_fee || 0,
                              ).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase border border-gray-200 px-2 py-0.5 rounded-full">
                            Not Allocated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {allocation ? (
                          <button
                            onClick={() => handleDelete(allocation.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all uppercase"
                          >
                            Cancel Service
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAllocateClick(student)}
                            className="inline-flex items-center px-3 py-1.5 border border-primary-200 text-primary-600 text-xs font-bold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all uppercase"
                          >
                            Allocate Route
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No students found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employees Table */}
      {activeTab === "employees" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Employee Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Department & Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Transport Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((employee) => {
                  const allocation = getAllocationForStudent(employee.id);
                  return (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                            {employee.first_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {employee.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {employee.department?.name || "No Dept"}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {employee.designation || "No Designation"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {allocation ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Active: {allocation.route?.name}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {allocation.stop?.stop_name} • ₹
                              {parseFloat(
                                allocation.stop?.zone_fee || 0,
                              ).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase border border-gray-200 px-2 py-0.5 rounded-full">
                            Not Allocated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {allocation ? (
                          <button
                            onClick={() => handleDelete(allocation.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all uppercase"
                          >
                            Cancel Service
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAllocateClick(employee)}
                            className="inline-flex items-center px-3 py-1.5 border border-primary-200 text-primary-600 text-xs font-bold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all uppercase"
                          >
                            Allocate Route
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No employees found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for New Allocation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                      Allocate Transport Route
                    </h3>
                    <p className="text-sm text-gray-500">
                      For {selectedStudent?.first_name}{" "}
                      {selectedStudent?.last_name}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    dispatch(
                      createAllocation({
                        ...formData,
                        student_id: selectedStudent.id,
                      }),
                    );
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Route
                        </label>
                        <select
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={formData.route_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              route_id: e.target.value,
                              stop_id: "",
                            })
                          }
                        >
                          <option value="">Choose a route...</option>
                          {routes?.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.route_code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Stop
                        </label>
                        <select
                          required
                          disabled={!formData.route_id}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                          value={formData.stop_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stop_id: e.target.value,
                            })
                          }
                        >
                          <option value="">
                            {formData.route_id
                              ? "Choose a stop..."
                              : "Select route first"}
                          </option>
                          {selectedRoute?.stops?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.stop_name} (₹
                              {parseFloat(s.zone_fee).toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.stop_id && (
                      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="text-xs font-bold text-primary-600 uppercase">
                              Transport Fee
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹
                              {parseFloat(
                                selectedRoute?.stops?.find(
                                  (s) => s.id === formData.stop_id,
                                )?.zone_fee || 0,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        operationStatus === "loading" || !formData.stop_id
                      }
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-display"
                    >
                      {operationStatus === "loading"
                        ? "Saving..."
                        : "Save Allocation"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Sync Fees */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                    Sync Semester Fees
                  </h3>
                  <button
                    onClick={() => setIsSyncModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                      <strong>What happens when you sync?</strong>
                      <br />
                      This will automatically generate or update transport fees
                      for all <strong>Active</strong> students in the selected
                      Batch. It uses the latest prices from Route Management.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    dispatch(syncSemesterFees(syncData));
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Batch
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={syncData.batch_year}
                        onChange={(e) =>
                          setSyncData({
                            ...syncData,
                            batch_year: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a batch...</option>
                        {availableBatches.map((year) => (
                          <option key={year} value={year}>
                            {year} Batch
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Semester
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={syncData.semester}
                        disabled={
                          !syncData.batch_year || activeSemesters.length === 0
                        }
                        onChange={(e) =>
                          setSyncData({ ...syncData, semester: e.target.value })
                        }
                      >
                        {!syncData.batch_year ? (
                          <option value="">Select batch first...</option>
                        ) : activeSemesters.length === 0 ? (
                          <option value="">No active semesters</option>
                        ) : (
                          activeSemesters.map((n) => (
                            <option key={n} value={n}>
                              Semester {n}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSyncModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={operationStatus === "loading"}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-display"
                    >
                      {operationStatus === "loading"
                        ? "Syncing..."
                        : "Start Sync"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAllocation;
