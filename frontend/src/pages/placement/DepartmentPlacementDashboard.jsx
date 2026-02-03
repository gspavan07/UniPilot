import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/api";
import {
  Users,
  GraduationCap,
  BarChart3,
  ArrowUpRight,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const DepartmentPlacementDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.department_id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.get(`/placement/department/${user.department_id}/stats`),
        api.get(`/placement/department/${user.department_id}/students`),
      ]);
      setStats(statsRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch department data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Placed Students",
      value: stats?.placedStudents || 0,
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Placement %",
      value: `${stats?.placementPercentage || 0}%`,
      icon: BarChart3,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      name: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: ArrowUpRight,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading)
    return <div className="p-10 text-center">Loading department data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs items={[{ label: "Department Dashboard" }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Department Placement Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Faculty Coordinator view for tracked recruitment progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div
              className={`p-3 rounded-xl w-fit ${card.bg} ${card.color} mb-4`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {card.name}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Student List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Student Placement Status
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student..."
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">ID Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Package (LPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {students.map((student) => {
                const placement = student.placements?.[0];
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {student.id_number}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          placement
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {placement ? "Placed" : "Unplaced"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                      {placement?.job_posting?.company?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {placement?.job_posting?.ctc_lpa
                        ? `₹${placement.job_posting.ctc_lpa}`
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPlacementDashboard;
