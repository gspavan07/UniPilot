import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Activity,
  Sparkles,
  Search,
  ChevronRight
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
      bg: "bg-blue-500",
      iconColor: "text-white",
      trend: "+2 this month",
      trendColor: "text-blue-200"
    },
    {
      title: "Active Exams",
      value: "3",
      icon: Clock,
      bg: "bg-teal-500",
      iconColor: "text-white",
      trend: "Ongoing",
      trendColor: "text-teal-200"
    },
    {
      title: "Completed",
      value: "8",
      icon: CheckCircle,
      bg: "bg-indigo-500",
      iconColor: "text-white",
      trend: "95% success rate",
      trendColor: "text-indigo-200"
    },
    {
      title: "Pending Tasks",
      value: "5",
      icon: AlertCircle,
      bg: "bg-amber-500",
      iconColor: "text-white",
      trend: "Needs attention",
      trendColor: "text-amber-200"
    },
  ];

  const quickActions = [
    {
      title: "Create Exam Cycle",
      description: "Set up a new examination cycle",
      icon: Plus,
      bg: "bg-gray-900 border-gray-900 text-white hover:bg-black",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      action: () => navigate("/exam-cycles/create"),
    },
    {
      title: "View All Cycles",
      description: "Manage existing exam cycles",
      icon: Calendar,
      bg: "bg-white border-gray-200 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      action: () => navigate("/exam-cycles"),
    },
    {
      title: "Generate Hall Tickets",
      description: "Create hall tickets for students",
      icon: FileText,
      bg: "bg-white border-gray-200 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      action: () => navigate("/hall-tickets"),
    },
    {
      title: "Manage Students",
      description: "View and manage student data",
      icon: Users,
      bg: "bg-white border-gray-200 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      action: () => navigate("/students"),
    },
  ];

  const recentActivities = [
    {
      action: "Created exam cycle",
      detail: "B.Tech R20 VI Semester Examination Feb-2026",
      time: "2 hours ago",
      icon: Calendar,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      action: "Generated timetable",
      detail: "Auto-generated for CSE Department",
      time: "5 hours ago",
      icon: Clock,
      bg: "bg-teal-50",
      color: "text-teal-600",
    },
    {
      action: "Updated fee configuration",
      detail: "Added late fee slabs",
      time: "1 day ago",
      icon: FileText,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 sm:px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {getGreeting()}, {user?.first_name || 'Admin'}
            </h1>
            <p className="text-gray-500 mt-1 font-medium text-sm">
              Here is an overview of your examination management system.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search cycles, students..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-gray-200">
              {user?.first_name?.[0] || 'A'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 space-y-12 animate-slideUp">
        {/* Stats Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className={`${stat.bg} p-6 rounded-3xl text-white shadow-xl shadow-gray-200 transform transition-transform hover:-translate-y-1 relative overflow-hidden group h-40 flex flex-col justify-between`}>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-black opacity-5 rounded-full -ml-6 -mb-6"></div>

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-blue-100/90 text-sm font-bold uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-4xl font-extrabold mt-1 tracking-tight">{stat.value}</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${stat.trendColor} relative z-10`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Quick Actions Panel */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className={`group relative p-6 rounded-3xl text-left border transition-all duration-300 shadow-sm hover:shadow-xl ${action.bg}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                      <action.icon className={`w-7 h-7 ${action.iconColor}`} />
                    </div>
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${idx === 0 ? 'text-white' : 'text-gray-400'}`}>
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{action.title}</h3>
                    <p className={`text-sm font-medium ${idx === 0 ? 'text-gray-400' : 'text-gray-500'}`}>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Activity</h2>
              </div>
              <button className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider">View All</button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-1">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="p-5 hover:bg-gray-50 rounded-2xl transition-colors group cursor-default"
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${activity.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-1">
                        {activity.detail}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">{activity.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
              <button className="w-full py-4 text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest border-t border-gray-50 mt-1">
                Load More
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
