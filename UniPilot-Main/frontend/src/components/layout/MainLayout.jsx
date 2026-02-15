import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Clock,
  Users,
  User as UserIcon,
  ClipboardCheck,
  Award,
  Wallet,
  Coins,
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
      name: "Admissions",
      href: "/admission",
      icon: ClipboardCheck,
      permission: ["admissions:view", "admissions:manage"],
      roles: ["super_admin", "principal", "admission_admin", "admission_staff"],
    },
    {
      name: "Academics",
      href: "/academics",
      icon: BookOpen,
      permission: ["academics:manage"],
      roles: ["super_admin", "principal", "hod", "staff"],
    },
    {
      name: "HR Management",
      href: "/hr-management",
      icon: Briefcase,
      permission: [
        "hr:staff:view",
        "emp:onboarding:access",
        "hr:payroll:view",
        "hr:payroll:manage",
        "hr:leaves:manage",
        "hr:attendance:view",
      ],
      roles: ["super_admin", "principal", "hr_admin", "hr_staff"],
    },

    {
      name: "Students",
      href: "/students",
      icon: GraduationCap,
      permission: "students:view",
      roles: ["super_admin", "principal", "hod", "staff", "faculty"],
    },
    {
      name: "Infrastructure",
      href: "/infrastructure",
      icon: Building,
      roles: ["principal", "super_admin"], // Visible to Admins
    },
    {
      name: "My Courses",
      href: "/my-courses",
      icon: BookOpen,
      roles: ["student"],
    },
    {
      name: "My Students",
      href: "/my-students",
      icon: Users,
      roles: ["faculty", "hod"],
    },
    {
      name: "My Timetable",
      href: "/timetable/my",
      icon: Clock,
      permission: "academics:timetable:view",
      roles: ["student", "faculty", "hod"],
    },
    {
      name: "My HR",
      href: "/hr/my-profile",
      icon: UserIcon,
      permission: "hr:leaves:view", // Staff/Faculty have this, Students don't
      roles: [
        "faculty",
        "hod",
        "staff",
        "principal",
        "super_admin",
        "hr_admin",
        "hr_staff",
        "exam_admin",
        "exam_staff",
        "admission_admin",
        "admission_staff",
        "hostel_admin",
        "transport_admin",
      ],
    },
    // {
    //   name: "Proctoring",
    //   href: "/proctoring",
    //   icon: LifeBuoy,
    //   permission: "proctoring:view",
    //   roles: ["faculty", "hod", "principal", "super_admin"],
    // },
    {
      name: "Reports",
      href: "/hostel/reports",
      icon: FileText,
      permission: "hostel:read",
      roles: ["super_admin", "principal", "hostel_admin"],
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
      permission: ["academics:attendance:view", "academics:attendance:manage"], // Students view, Faculty manage
      roles: ["student", "faculty", "hod", "principal"],
    },

    {
      name: "Examination Hub",
      href: "/my-exams",
      icon: Award,
      roles: ["student"],
    },
    {
      name: "My Results",
      href: "/results",
      icon: FileText,
      roles: ["student"],
    },
    {
      name: "Fee Management",
      href: "/fees",
      icon: Wallet,
      permission: "finance:fees:manage",
      roles: ["super_admin", "principal", "finance_admin", "finance_staff"],
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
      permission: ["transport:manage"],
      roles: ["super_admin", "principal", "transport_admin"],
    },
    {
      name: "Hostel",
      href: "/hostel",
      icon: Building,
      permission: "hostel:read",
      roles: ["super_admin", "principal", "hostel_admin"],
    },
    {
      name: "Placements",
      href: "/placement/dashboard",
      icon: Briefcase,
      // permission: ["placement.company.manage", "placement.drive.manage"],
      roles: ["super_admin", "principal", "tpo", "placement_coordinator"],
    },
    {
      name: "Dept. Placements",
      href: "/placement/department",
      icon: Briefcase,
      roles: ["hod", "faculty"],
      isPlacementCoordinator: true,
    },
    {
      name: "My Placements",
      href: "/placement/student/dashboard",
      icon: Briefcase,
      roles: ["student"],
    },
    // {
    //   name: "Library",
    //   href: "/library",
    //   icon: Library,
    //   permission: "library:books:manage",
    // },
    // {
    //   name: "My Library",
    //   href: "/my-library",
    //   icon: BookOpen,
    //   roles: ["student"],
    // },
    {
      name: "My Hostel",
      href: "/hostel/student",
      icon: Home,
      roles: ["student"],
      isHostellerOnly: true, // Custom flag for student-level restriction
    },
    {
      name: "Roles & Permissions",
      href: "/settings/roles",
      icon: Settings,
      permission: "settings:roles:manage",
      roles: ["super_admin", "principal"],
    },
    // Example of role-based restricted item:
    // {
    //   name: "Role Restricted",
    //   href: "/restricted",
    //   icon: Shield,
    //   roles: ["principal", "super_admin"], // Only these roles can see this
    // },
  ];

  // Logic to filter navigation based STRICTLY on user permissions
  const filteredNavigation = navigation.filter((item) => {
    // 1. Admin/Super Admin bypass (Priority) - Consistent with backend logic
    // const adminRoles = ["super_admin", "admin", "administrator"];
    // if (adminRoles.includes(user?.role)) return true;

    // 2. Role Check
    if (item.roles && Array.isArray(item.roles)) {
      if (!item.roles.includes(user?.role)) return false;
    }

    // 3. Specific Student-Level Restrictions (e.g., Hostel)
    if (
      item.isHostellerOnly &&
      user?.role === "student" &&
      !user?.is_hosteller
    ) {
      return false;
    }

    if (
      item.isPlacementCoordinator &&
      user?.role === "faculty" &&
      !user?.is_placement_coordinator
    ) {
      return false;
    }

    // 4. Strict Permission Check (if item has permission but user is not admin)
    if (item.permission) {
      if (Array.isArray(item.permission)) {
        return item.permission.some((p) => user?.permissions?.includes(p));
      }
      return user?.permissions?.includes(item.permission);
    }

    // 5. Fallback: If no permission specified and role matched, allow
    return true;
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white flex">
      <aside
        className={`${sidebarOpen ? "w-52" : "w-16"} bg-white border-r border-gray-200 transition-all duration-300 ease-out flex flex-col fixed h-full z-40`}
        onMouseEnter={() => setSidebarOpen(true)}
        // onMouseLeave={() => setSidebarOpen(false)}
      >
        <div
          className={`h-16 flex items-center border-b border-gray-100 ${sidebarOpen ? "justify-start" : "justify-center"}`}
        >
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-3 px-5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">U</span>
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-bold text-black tracking-tight">
                  UniPilot
                </h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  System
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">U</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
          {filteredNavigation.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-link group flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2.5 mb-0.5 rounded-md transition-all duration-200 relative ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              style={{ animationDelay: `${index * 25}ms` }}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 nav-accent bg-blue-600 rounded-r ${
                  isActive(item.href) ? "w-0" : "w-0"
                }`}
              />
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-gray-600 group-hover:text-blue-600"
                }`}
              />
              {sidebarOpen && (
                <span
                  className={`text-[13px] font-medium truncate whitespace-nowrap overflow-hidden ${
                    isActive(item.href)
                      ? "font-semibold text-white"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div
          className={`p-4 border-t border-gray-100 ${!sidebarOpen && "px-2"}`}
        >
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={
                    user?.profile_picture
                      ? user.profile_picture.startsWith("http")
                        ? user.profile_picture
                        : `${user.profile_picture}?token=${localStorage.getItem("accessToken")}`
                      : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=3b82f6&color=fff&size=128`
                  }
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100"
                />
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
            </Link>
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

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? "ml-52 " : "ml-16"}`}
      >
        <main className="flex-1  overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
