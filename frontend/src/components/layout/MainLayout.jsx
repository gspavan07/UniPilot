import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Layout,
  Menu,
  X,
  Clock,
  Bell,
  Layers,
  Search,
  ChevronRight,
  User as UserIcon,
  Shield,
  CalendarIcon,
  LifeBuoy,
  RefreshCcw,
  Book,
  UserPlus,
  ClipboardCheck,
  PlaneTakeoff,
  Award,
  Wallet,
  Coins,
  Upload,
  Library,
  Sliders,
  Briefcase,
  Building,
  Bus,
  Home,
} from "lucide-react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard:view",
    },
    {
      name: "Admission Analytics",
      href: "/admission/dashboard",
      icon: ClipboardCheck,
      permission: "admissions:view",
    },
    {
      name: "Departments",
      href: "/departments",
      icon: BookOpen,
      permission: "academics:dept:manage", // Students/Faculty need to see this
    },
    {
      name: "Infrastructure",
      href: "/infrastructure",
      icon: Building,
      roles: ["admin", "super_admin"], // Visible to Admins
    },
    {
      name: "Programs",
      href: "/programs",
      icon: GraduationCap,
      permission: "academics:programs:manage",
    },
    {
      name: "Regulations",
      href: "/regulations",
      icon: Book,
      permission: "academics:programs:manage", // Same as programs for now
    },
    {
      name: "Courses",
      href: "/courses",
      icon: FileText,
      permission: "academics:courses:manage",
    },
    {
      name: "Onboard Employee",
      href: "/hr/onboard",
      icon: UserPlus,
      permission: "emp:onboarding:access",
    },
    {
      name: "Employees",
      href: "/employees",
      icon: Briefcase,
      permission: "hr:staff:view",
    },
    {
      name: "Register Student",
      href: "/student/register",
      icon: UserPlus,
      permission: "admissions:manage",
    },
    {
      name: "Students",
      href: "/students",
      icon: GraduationCap,
      permission: "students:view",
    },
    {
      name: "My Courses",
      href: "/my-courses",
      icon: BookOpen,
      roles: ["student"],
    },
    // {
    //   name: "User Management",
    //   href: "/users",
    //   icon: Users,
    //   permission: "users:manage",
    // },
    {
      name: "Payroll Dashboard",
      href: "/hr/payroll",
      icon: Wallet,
      permission: "hr:payroll:view",
    },
    {
      name: "Salary Grades",
      href: "/hr/payroll/grades",
      icon: Layers,
      permission: "hr:payroll:manage",
    },
    {
      name: "Schedule Management",
      href: "/timetable/manage",
      icon: Calendar,
      permission: "academics:timetable:manage",
    },
    {
      name: "Student Calendar",
      href: "/academic/calendar",
      icon: CalendarIcon,
      permission: "academics:timetable:manage",
    },
    {
      name: "My Schedule",
      href: "/timetable/my",
      icon: Clock,
      permission: "academics:timetable:view",
    },
    {
      name: "My HR",
      href: "/hr/my-profile",
      icon: UserIcon,
      permission: "hr:leaves:view", // Staff/Faculty have this, Students don't
    },
    {
      name: "Proctoring",
      href: "/proctoring",
      icon: LifeBuoy,
      permission: "proctoring:view",
    },
    {
      name: "Lifecycle",
      href: "/lifecycle",
      icon: RefreshCcw,
      permission: "academics:promotion:manage",
    },
    {
      name: "Sections",
      href: "/academic/sections",
      icon: Layout,
      permission: "academics:sections:manage",
    },
    {
      name: "Reports",
      href: "/hostel/reports",
      icon: FileText,
      permission: "hostel:read",
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
      permission: ["academics:attendance:view", "academics:attendance:manage"], // Students view, Faculty manage
    },
    {
      name: "Leave Approvals",
      href: "/hr/leaves",
      icon: PlaneTakeoff,
      permission: "hr:leaves:manage",
    },
    {
      name: "Staff Attendance",
      href: "/hr/attendance",
      icon: Users,
      permission: "hr:attendance:view",
    },
    {
      name: "Staff Calendar",
      href: "/hr/calendar",
      icon: CalendarIcon,
      permission: "hr:staff:view",
    },
    {
      name: "Exam Schedules",
      href: "/exams/schedules",
      icon: Calendar,
      permission: "exams:manage",
    },
    {
      name: "Marks Entry",
      href: "/exams/marks-entry",
      icon: FileText,
      permission: "exams:results:entry",
    },
    {
      name: "Publish Marks",
      href: "/exams/publish",
      icon: Award,
      permission: "exams:results:publish",
    },
    {
      name: "Exams",
      href: "/my-exams",
      icon: Calendar,
      roles: ["student"],
    },
    {
      name: "Exam Payments",
      href: "/exams/payments",
      icon: Wallet,
      roles: ["student"],
    },
    {
      name: "My Results",
      href: "/results",
      icon: Award,
      roles: ["student"],
    },
    {
      name: "Fee Management",
      href: "/fees",
      icon: Wallet,
      permission: "finance:fees:manage",
    },
    {
      name: "My Fees",
      href: "/my-fees",
      icon: Coins,
      roles: ["student"],
    },
    {
      name: "Transport",
      href: "/transport",
      icon: Bus,

      permission: ["transport:read", "transport:write", "transport:admin"],
      roles: ["super_admin"],
    },
    {
      name: "Hostel",
      href: "/hostel",
      icon: Building,
      permission: "hostel:read",
    },
    {
      name: "Library",
      href: "/library",
      icon: Library,
      permission: "library:books:manage",
    },
    {
      name: "My Library",
      href: "/my-library",
      icon: BookOpen,
      roles: ["student"],
    },
    {
      name: "My Hostel",
      href: "/hostel/student",
      icon: Home,
      roles: ["student"],
    },
    {
      name: "Settings",
      href: "/settings/roles",
      icon: Settings,
      permission: "settings:roles:manage",
    },
    {
      name: "Admission Config",
      href: "/admission/settings",
      icon: Sliders,
      permission: "admissions:manage",
    },
    // Example of role-based restricted item:
    // {
    //   name: "Role Restricted",
    //   href: "/restricted",
    //   icon: Shield,
    //   roles: ["admin", "super_admin"], // Only these roles can see this
    // },
  ];

  // Logic to filter navigation based STRICTLY on user permissions
  const filteredNavigation = navigation.filter((item) => {
    // 1. Super Admin Bypass
    // if (user?.role === "super_admin") return true;

    // 2. Role Check (Optional)
    if (item.roles && Array.isArray(item.roles)) {
      if (!item.roles.includes(user?.role)) return false;
    }

    // 3. Strict Permission Check
    if (item.permission) {
      if (Array.isArray(item.permission)) {
        return item.permission.some((p) => user?.permissions?.includes(p));
      }
      return user?.permissions?.includes(item.permission);
    }

    // 3. Fallback: If no permission specified, it's public (but better to specify 'dashboard:view')
    return true;
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
          <div className={`flex items-center ${!sidebarOpen && "hidden"}`}>
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold mr-2">
              U
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 font-display">
              UniPilot
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-500" />
            ) : (
              <Menu className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive(item.href)
                    ? "text-primary-600 dark:text-primary-400"
                    : "group-hover:text-primary-500"
                }`}
              />
              <span
                className={`ml-3 font-medium ${!sidebarOpen && "hidden"} transition-opacity`}
              >
                {item.name}
              </span>
              {isActive(item.href) && sidebarOpen && (
                <ChevronRight className="ml-auto w-4 h-4" />
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer (User Info) */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <Link to="/profile" className="flex items-center overflow-hidden">
            <img
              src={
                user?.profile_picture
                  ? user.profile_picture.startsWith("http")
                    ? user.profile_picture
                    : `${user.profile_picture}?token=${localStorage.getItem(
                        "accessToken",
                      )}`
                  : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=6366f1&color=fff&size=128`
              }
              alt="Profile"
              className="w-10 h-10 rounded-full ring-4 ring-gray-50 dark:ring-gray-700 object-cover"
            />
            <div
              className={`ml-3 overflow-hidden ${!sidebarOpen && "hidden"} cursor-pointer hover:text-primary-600`}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={`ml-auto p-2 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-all ${!sidebarOpen && "hidden"}`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        {/* Header */}
        {/* <header className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="relative w-96 hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2 pl-10 pr-4 block w-full text-sm focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="Search..."
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 dark:border-gray-700 mx-2"></div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 hidden sm:block">
                {user?.first_name}
              </span>
              <img
                src={
                  user?.profile_picture ||
                  `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=6366f1&color=fff`
                }
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-primary-500/20"
              />
            </div>
          </div>
        </header> */}

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
