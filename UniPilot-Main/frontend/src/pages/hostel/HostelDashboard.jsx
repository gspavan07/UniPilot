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
  Bell,
  ArrowUpRight,
  LayoutGrid
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
      path: "/hostel/buildings",
      stat: dashboardStats?.total_buildings || 0,
      statLabel: "Buildings",
    },
    {
      title: "Rooms",
      description: "View and manage hostel rooms",
      icon: Home,
      path: "/hostel/rooms",
      stat: dashboardStats?.total_rooms || 0,
      statLabel: "Rooms",
    },
    {
      title: "Allocations",
      description: "Allocate students to rooms and beds",
      icon: Users,
      path: "/hostel/allocations",
      stat: dashboardStats?.current_occupancy || 0,
      statLabel: "Allocated",
    },
    {
      title: "Fees Structure",
      description: "Manage hostel and mess fee structures",
      icon: Wallet,
      path: "/hostel/fees",
      stat: "₹",
      statLabel: "Configure",
    },
    {
      title: "Student Fines",
      description: "Issue and track student fines",
      icon: DollarSign,
      path: "/hostel/fines",
      stat: fines?.filter((f) => f.status === "pending").length || 0,
      statLabel: "Pending",
    },
    {
      title: "Utility Bills",
      description: "Create and distribute room bills",
      icon: FileText,
      path: "/hostel/room-bills",
      statLabel: "Active",
      stat: "Bills",
    },
    {
      title: "Complaints",
      description: "Track and resolve student issues",
      icon: Wrench,
      path: "/hostel/complaints",
      statLabel: "Open Tickets",
      badge: dashboardStats?.pending_complaints || 0,
      stat: dashboardStats?.pending_complaints || 0,
    },
    {
      title: "Attendance",
      description: "Mark and view daily attendance",
      icon: ClipboardCheck,
      path: "/hostel/attendance",
      statLabel: "Status",
      stat: "Track",
    },
    {
      title: "Gate Passes",
      description: "Manage entry/exit requests",
      icon: Shield,
      path: "/hostel/gate-pass",
      statLabel: "Requests",
      stat: "Review",
    },
    {
      title: "Reports & Analytics",
      description: "View occupancy and financial reports",
      icon: BarChart3,
      path: "/hostel/reports",
      statLabel: "Insights",
      stat: "View",
    },
  ];

  // Quick stats for hero section
  const quickStats = [
    {
      label: "Total Capacity",
      value: dashboardStats?.total_capacity || "0",
      icon: Home,
    },
    {
      label: "Occupancy Rate",
      value: `${dashboardStats?.occupancy_percentage || 0}%`,
      icon: Users,
    },
    {
      label: "Pending Actions",
      value:
        (dashboardStats?.pending_complaints || 0) +
        (fines?.filter((f) => f.status === "pending").length || 0),
      icon: AlertCircle,
    },
    {
      label: "Active Residents",
      value: dashboardStats?.current_occupancy || "0",
      icon: UserCheck,
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-black animate-spin mb-4" />
        <p className="text-gray-900 font-bold bg-gray-100 px-4 py-2 rounded-full text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
          <AlertCircle className="w-8 h-8 text-gray-900" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Dashboard Unavailable</h3>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          {error || "We couldn't load the hostel data. Please check your connection."}
        </p>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="mt-6 px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Calculate pending counts for alert section
  const pendingComplaints = dashboardStats?.pending_complaints || 0;
  const pendingFines = fines?.filter((f) => f.status === "pending").length || 0;
  const pendingBills = roomBills?.filter((b) => b.status === "pending").length || 0;
  const hasAlerts = pendingComplaints > 0 || pendingFines > 0 || pendingBills > 0;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans pb-12">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-8 w-1.5 bg-blue-600 rounded-full"></span>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                Hostel Overview
              </h1>
            </div>
            <p className="text-base text-gray-500 font-medium pl-4">
              Real-time monitoring of occupancy, infrastructure, and student services.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-900 font-bold rounded-lg text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Academic Year 2025-26
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  <div className="p-2 text-white md:text-black md:group-hover:text-white rounded-lg bg-blue-600 md:bg-gray-50 md:group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</span>
                </div>
                {/* Bottom Border Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 md:bg-gray-50 md:group-hover:bg-blue-600 transition-colors duration-200 rounded-b-xl overflow-hidden"></div>
              </div>
            );
          })}
        </div>

        {/* Action Alerts */}
        {hasAlerts && (
          <div className="bg-white rounded-xl p-6 border-l-4 border-l-blue-600 border-y border-r border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-blue-50 rounded-full flex-shrink-0">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">Attention Required</h3>
                <p className="text-gray-500 font-medium">
                  You have pending items that require immediate action.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {pendingComplaints > 0 && (
                <button
                  onClick={() => navigate('/hostel/complaints')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-gray-900 text-white font-bold rounded-lg text-sm hover:bg-gray-800 transition-colors shadow-sm"
                >
                  {pendingComplaints} Complaints
                </button>
              )}
              {pendingFines > 0 && (
                <button
                  onClick={() => navigate('/hostel/fines')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-900 font-bold rounded-lg text-sm hover:border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {pendingFines} Pending Fines
                </button>
              )}
              {pendingBills > 0 && (
                <button
                  onClick={() => navigate('/hostel/room-bills')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-900 font-bold rounded-lg text-sm hover:border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {pendingBills} Unpaid Bills
                </button>
              )}
            </div>
          </div>
        )}

        {/* Management Modules */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Management Console
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {navigationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(card.path)}
                  className="group relative cursor-pointer bg-white rounded-xl border border-blue-500 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Content Container */}
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Icon className="w-6 h-6 transition-colors duration-300" />
                      </div>
                      {card.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                          {card.badge} New
                        </span>
                      )}
                    </div>

                    <div className="mb-6 h-20">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-blue-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.statLabel}</span>
                        <span className="text-lg font-black text-gray-900 tracking-tight">{typeof card.stat === 'number' ? card.stat.toLocaleString() : card.stat}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all text-gray-300">
                        <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Accent - Blue Line Top */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-blue-600 transition-colors duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDashboard;
