import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ClipboardList,
  Users,
  FileText,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems =
    user?.role === "faculty"
      ? [
        { path: "/faculty/exams", icon: LayoutDashboard, label: "My Exams" },
        { path: "/profile", icon: User, label: "Profile" },
      ]
      : [
        { path: "/", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/exam-cycles", icon: Calendar, label: "Exam Cycles" },
        { path: "/hall-tickets", icon: Ticket, label: "Hall Tickets" },
        { path: "/schedules", icon: ClipboardList, label: "Schedules" },
        { path: "/seating", icon: Users, label: "Seating" },
        { path: "/grades", icon: FileText, label: "Grades" },
        { path: "/settings", icon: Settings, label: "Settings" },
      ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Archivo:wght@600;700;800&display=swap');
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .nav-link { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .nav-link:hover .nav-accent { width: 3px; }
        .nav-accent { transition: width 0.25s ease; }
        * { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
        h1, h2, h3 { font-family: 'Archivo', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      {/* Sidebar - Desktop */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-200 transition-all duration-300 ease-out flex flex-col fixed h-full z-40 hidden lg:flex`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div
          className={`h-16 flex items-center border-b border-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"}`}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-5">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">U</span>
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-bold text-black tracking-tight">
                  UniPilot
                </h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  Exam Portal
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">U</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={`nav-link group flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2.5 mb-0.5 rounded-md transition-all duration-200 relative ${isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
              style={{ animationDelay: `${index * 25}ms` }}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 nav-accent bg-blue-600 rounded-r ${isActive(item.path) ? "w-0" : "w-0"
                  }`}
              />
              <item.icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive(item.path)
                    ? "text-white"
                    : "text-gray-600 group-hover:text-blue-600"
                  }`}
              />
              {sidebarOpen && (
                <span
                  className={`text-[13px] font-medium truncate whitespace-nowrap overflow-hidden ${isActive(item.path)
                      ? "font-semibold text-white"
                      : "text-gray-700"
                    }`}
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`p-4 border-t border-gray-100 ${!sidebarOpen && "px-2"}`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigate("/profile");
              }}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.first_name?.[0] || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize truncate">
                    {user?.role?.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </button>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded transition-colors group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-xl z-50 lg:hidden flex flex-col shadow-2xl animate-[slideInLeft_0.3s_ease-out]">
            <div className="h-24 flex items-center justify-between px-6 border-b border-gray-200/50 bg-linear-to-r from-white to-blue-50/30">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-black text-2xl tracking-tight">U</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="font-black text-black text-xl tracking-tight">UniPilot</h1>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Exam Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
              >
                <X className="w-6 h-6 text-black" strokeWidth={2.5} />
              </button>
            </div>
            <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-4 px-5 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/40"
                      : "flex items-center gap-4 px-5 py-4 rounded-2xl text-black hover:bg-white hover:shadow-lg font-semibold transition-all duration-300"
                  }
                >
                  <div className={({ isActive }) => isActive ? "p-2 bg-white/20 rounded-xl" : "p-2 bg-blue-50 rounded-xl"}>
                    <item.icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px]">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-6 border-t border-gray-200/50 bg-linear-to-r from-white to-blue-50/30">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-lg">
                <div className="relative w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
                  {user?.first_name?.[0] || "U"}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-3 px-5 py-4 bg-linear-to-r from-red-500 to-red-600 text-white rounded-2xl hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300 font-bold transform hover:scale-[1.02]"
              >
                <LogOut className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? "ml-64" : "ml-16"} hidden lg:flex`}
      >
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col lg:hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Menu className="w-6 h-6 text-black" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-black">UniPilot</h2>
            <p className="text-xs text-gray-500">Exam Portal</p>
          </div>
          <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.first_name?.[0] || "U"}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
