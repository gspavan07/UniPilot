import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "faculty") {
      navigate("/faculty/exams", { replace: true });
    }
  }, [user, navigate]);

  const stats = [
    {
      title: "Total Exam Cycles",
      value: "12",
      icon: Calendar,
      color: "bg-blue-500",
      trend: "+2 this month",
    },
    {
      title: "Active Exams",
      value: "3",
      icon: Clock,
      color: "bg-green-500",
      trend: "Ongoing",
    },
    {
      title: "Completed",
      value: "8",
      icon: CheckCircle,
      color: "bg-purple-500",
      trend: "95% success rate",
    },
    {
      title: "Pending Tasks",
      value: "5",
      icon: AlertCircle,
      color: "bg-amber-500",
      trend: "Needs attention",
    },
  ];

  const quickActions = [
    {
      title: "Create Exam Cycle",
      description: "Set up a new examination cycle",
      icon: Plus,
      color: "bg-indigo-600",
      action: () => navigate("/exam-cycles/create"),
    },
    {
      title: "View All Cycles",
      description: "Manage existing exam cycles",
      icon: Calendar,
      color: "bg-purple-600",
      action: () => navigate("/exam-cycles"),
    },
    {
      title: "Generate Hall Tickets",
      description: "Create hall tickets for students",
      icon: FileText,
      color: "bg-blue-600",
      action: () => navigate("/hall-tickets"),
    },
    {
      title: "Manage Students",
      description: "View and manage student data",
      icon: Users,
      color: "bg-green-600",
      action: () => navigate("/students"),
    },
  ];

  const recentActivities = [
    {
      action: "Created exam cycle",
      detail: "B.Tech R20 VI Semester Examination Feb-2026",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-blue-600 bg-blue-50",
    },
    {
      action: "Generated timetable",
      detail: "Auto-generated for CSE Department",
      time: "5 hours ago",
      icon: Clock,
      color: "text-green-600 bg-green-50",
    },
    {
      action: "Updated fee configuration",
      detail: "Added late fee slabs",
      time: "1 day ago",
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your exam management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-600 hover:shadow-md transition-all group text-left"
            >
              <div
                className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
            >
              <div
                className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}
              >
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600 truncate">
                  {activity.detail}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
