import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building,
  Home,
  Users,
  Wrench,
  ChevronRight,
  AlertCircle,
  Loader2,
  Wallet,
  DollarSign,
  FileText,
  ClipboardCheck,
  UserCheck,
  Shield,
  BarChart3,
  Calendar,
  Bell,
  TrendingUp,
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchComplaints,
  fetchFines,
  fetchRoomBills,
} from "../../store/slices/hostelSlice";

const HostelDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboardStats, complaints, fines, roomBills, status, error } =
    useSelector((state) => state.hostel);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchComplaints({ status: "pending" }));
    dispatch(fetchFines({ status: "pending" }));
    dispatch(fetchRoomBills({ status: "pending" }));
  }, [dispatch]);

  // Navigation cards configuration
  const navigationCards = [
    {
      title: "Buildings",
      description: "Manage hostel buildings and infrastructure",
      icon: Building,
      color: "from-blue-500 to-blue-600",
      path: "/hostel/buildings",
      stat: dashboardStats?.total_buildings || 0,
      statLabel: "Buildings",
    },
    {
      title: "Rooms",
      description: "View and manage hostel rooms",
      icon: Home,
      color: "from-purple-500 to-purple-600",
      path: "/hostel/rooms",
      stat: dashboardStats?.total_rooms || 0,
      statLabel: "Rooms",
    },
    {
      title: "Student Allocations",
      description: "Allocate students to rooms and beds",
      icon: Users,
      color: "from-green-500 to-green-600",
      path: "/hostel/allocations",
      stat: dashboardStats?.current_occupancy || 0,
      statLabel: "Allocated",
    },
    {
      title: "Hostel Fees",
      description: "Manage hostel and mess fee structures",
      icon: Wallet,
      color: "from-yellow-500 to-yellow-600",
      path: "/hostel/fees",
      stat: "₹",
      statLabel: "Fees",
    },
    {
      title: "Fines",
      description: "Issue and track student fines",
      icon: DollarSign,
      color: "from-red-500 to-red-600",
      path: "/hostel/fines",
      stat: fines?.filter((f) => f.status === "pending").length || 0,
      statLabel: "Pending",
      // badge:fines?.filter((f) => f.status === "pending").length > 0 ? "New" : null,
    },
    {
      title: "Room Bills",
      description: "Create and distribute utility bills",
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      path: "/hostel/room-bills",
      // stat: roomBills?.filter((b) => b.status === "pending").length || 0,
      statLabel: "Bill",
    },
    {
      title: "Complaints",
      description: "Track and resolve student complaints",
      icon: Wrench,
      color: "from-orange-500 to-orange-600",
      path: "/hostel/complaints",
      // stat: dashboardStats?.pending_complaints || 0,
      statLabel: "Solve",
      badge: dashboardStats?.pending_complaints || 0,
    },
    {
      title: "Attendance",
      description: "Mark and view hostel attendance",
      icon: ClipboardCheck,
      color: "from-teal-500 to-teal-600",
      path: "/hostel/attendance",
      // stat: "📋",
      statLabel: "Track",
    },
    {
      title: "Gate Pass",
      description: "Manage student gate pass requests",
      icon: Shield,
      color: "from-cyan-500 to-cyan-600",
      path: "/hostel/gate-pass",
      // stat: "🎫",
      statLabel: "Access",
    },
    {
      title: "Reports",
      description: "View occupancy and analytics reports",
      icon: BarChart3,
      color: "from-pink-500 to-pink-600",
      path: "/hostel/reports",
      // stat: "📊",
      statLabel: "Insights",
    },
  ];

  // Quick stats for hero section
  const quickStats = [
    {
      label: "Total Capacity",
      value: dashboardStats?.total_capacity || "0",
      icon: Home,
      trend: null,
    },
    {
      label: "Current Occupancy",
      value: `${dashboardStats?.occupancy_percentage || 0}%`,
      icon: Users,
      trend: null,
    },
    {
      label: "Pending Issues",
      value:
        (dashboardStats?.pending_complaints || 0) +
        (fines?.filter((f) => f.status === "pending").length || 0),
      icon: AlertCircle,
      trend: null,
    },
    {
      label: "Active Students",
      value: dashboardStats?.current_occupancy || "0",
      icon: UserCheck,
      trend: null,
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h3 className="text-xl font-bold text-red-900">Failed to Load</h3>
        <p className="text-red-600 text-sm mt-2 max-w-xs mx-auto">
          {error || "Could not load dashboard. Please try again."}
        </p>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hostel Management Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Centralized control for all hostel operations
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Important Alerts */}
      {((dashboardStats?.pending_complaints || 0) > 0 ||
        (fines?.filter((f) => f.status === "pending").length || 0) > 0 ||
        (roomBills?.filter((b) => b.status === "pending").length || 0) > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                Action Required
              </h3>
              <div className="mt-2 space-y-1 text-sm text-yellow-700">
                {(dashboardStats?.pending_complaints || 0) > 0 && (
                  <p>
                    • {dashboardStats.pending_complaints} pending complaints
                    need attention
                  </p>
                )}
                {(fines?.filter((f) => f.status === "pending").length || 0) >
                  0 && (
                  <p>
                    • {fines.filter((f) => f.status === "pending").length} fines
                    awaiting payment
                  </p>
                )}
                {(roomBills?.filter((b) => b.status === "pending").length ||
                  0) > 0 && (
                  <p>
                    • {roomBills.filter((b) => b.status === "pending").length}{" "}
                    room bills ready for distribution
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {navigationCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(card.path)}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 text-left overflow-hidden"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}
                />

                {/* Badge */}
                {card.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                  {card.description}
                </p>

                {/* Stat */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.stat}
                    </p>
                    <p className="text-xs text-gray-500">{card.statLabel}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <button
            onClick={() => navigate("/hostel/reports")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {complaints?.slice(0, 3).map((complaint, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Wrench className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {complaint.issue_type?.replace(/_/g, " ").toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>
              <span className="flex-shrink-0 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                Pending
              </span>
            </div>
          ))}

          {(!complaints || complaints.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default HostelDashboard;
