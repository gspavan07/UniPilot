import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  MapPin,
  Shield,
  Key,
  Edit3,
  Camera
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const profileFields = [
    {
      label: "Full Name",
      value: `${user?.first_name || ""} ${user?.last_name || ""}`,
      icon: User,
    },
    { label: "Email", value: user?.email || "N/A", icon: Mail },
    { label: "Role", value: user?.role || "N/A", icon: Briefcase },
    {
      label: "Employee ID",
      value: user?.employee_id || user?.student_id || "N/A",
      icon: Calendar,
    },
    {
      label: "Department",
      value: user?.department?.name || "N/A",
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">

        {/* Left Panel: Identity Column */}
        <div className="w-full md:w-[400px] bg-gray-900 text-white relative p-10 flex flex-col items-center text-center justify-center overflow-hidden shrink-0">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Avatar Section */}
            <div className="relative mb-6 group cursor-pointer">
              <div className="w-40 h-40 rounded-full bg-linear-to-tr from-blue-500 to-blue-400 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-5xl font-bold text-white overflow-hidden border-4 border-gray-900 relative">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}

                  {/* Photo Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-8 h-8 text-white/80" />
                  </div>
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition-colors border-4 border-gray-900">
                <Edit3 size={16} />
              </button>
            </div>

            {/* Primary Info */}
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              {user?.first_name} {user?.last_name}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-800 rounded-full border border-gray-700 shadow-sm mb-6">
              <Briefcase size={14} className="text-blue-400" />
              <span className="text-sm font-bold uppercase tracking-wider text-gray-300">
                {user?.role || "User"}
              </span>
            </div>

            <div className="w-full h-px bg-gray-800 my-6"></div>

            {/* Quick Contact Stats or Info */}
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-blue-400">
                  <Mail size={18} />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs text-gray-400 font-medium uppercase">Email Address</p>
                  <p className="text-sm font-bold text-white truncate w-full" title={user?.email}>
                    {user?.email || "No email provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Details & Actions */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              Personal Information
            </h2>
            <p className="text-gray-500">Manage your persona and university details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mb-12">
            {profileFields.filter(f => f.label !== "Full Name" && f.label !== "Email" && f.label !== "Role").map((field) => (
              <div key={field.label} className="group">
                <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  <field.icon size={16} />
                  <span>{field.label}</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 group-hover:border-blue-100 transition-colors">
                  {field.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              Account Security
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group group-hover:shadow-md cursor-pointer text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Key size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500 mt-0.5">Update your password securely</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                  <Edit3 size={14} />
                </div>
              </button>

              <button className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group group-hover:shadow-md cursor-pointer text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-500 mt-0.5">Edit personal details and bio</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                  <Edit3 size={14} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
