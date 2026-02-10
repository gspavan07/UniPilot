import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Building2,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const CoordinatorManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [search, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments", {
        params: { type: "academic" },
      });
      setDepartments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch departments");
    }
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users", {
        params: {
          role: "faculty",
          search: search,
          department_id: selectedDept || undefined,
        },
      });
      setFaculty(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch faculty list");
    } finally {
      setLoading(false);
    }
  };

  const toggleCoordinatorStatus = async (user) => {
    try {
      setProcessing(user.id);
      const newStatus = !user.is_placement_coordinator;

      await api.put(`/users/${user.id}`, {
        is_placement_coordinator: newStatus,
      });

      setFaculty((prev) =>
        prev.map((f) =>
          f.id === user.id ? { ...f, is_placement_coordinator: newStatus } : f,
        ),
      );

      toast.success(
        `${user.first_name} is ${newStatus ? "now" : "no longer"} a Placement Coordinator`,
      );
    } catch (error) {
      toast.error("Failed to update coordinator status");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PlacementBreadcrumbs items={[{ label: "Manage Coordinators" }]} />

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Placement Coordinators
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Designate faculty members to manage department-level placement
            activities
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 dark:text-gray-300"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-5">Faculty Member</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Role Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading && faculty.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-12 text-center text-gray-500 font-medium"
                  >
                    Loading faculty records...
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-12 text-center text-gray-500 font-medium"
                  >
                    No faculty found matching your search
                  </td>
                </tr>
              ) : (
                faculty.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {user.department?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {user.is_placement_coordinator ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black uppercase tracking-tight">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Coordinator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-tight">
                          Faculty
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => toggleCoordinatorStatus(user)}
                        disabled={processing === user.id}
                        className={`inline-flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          user.is_placement_coordinator
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95"
                        }`}
                      >
                        {processing === user.id ? (
                          "Processing..."
                        ) : user.is_placement_coordinator ? (
                          <>
                            <X className="w-4 h-4" />
                            Revoke Access
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Make Coordinator
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorManagement;
