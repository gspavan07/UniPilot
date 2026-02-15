import { useAuth } from "../../context/AuthContext";
import { User, Mail, Briefcase, Calendar, MapPin } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with Avatar */}
        <div className="gradient-primary p-8 text-white relative">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-indigo-100 mt-1">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                <Briefcase className="w-4 h-4" />
                <span className="capitalize">{user?.role || "User"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map((field) => (
              <div key={field.label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <field.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {field.label}
                  </p>
                  <p className="text-gray-900 mt-1">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all">
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-600">
              Update your account password
            </p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all">
            <p className="font-medium text-gray-900">Update Profile</p>
            <p className="text-sm text-gray-600">
              Edit your personal information
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
