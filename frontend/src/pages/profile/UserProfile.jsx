import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { changePassword, clearError } from "../../store/slices/authSlice";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");

  // Password Change State
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    dispatch(clearError());
    const resultAction = await dispatch(
      changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      })
    );

    if (changePassword.fulfilled.match(resultAction)) {
      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPasswordMessage({
        type: "error",
        text: resultAction.payload || "Failed to update password",
      });
    }
  };

  const tabs = [
    { id: "overview", label: "Personal Information", icon: User },
    { id: "security", label: "Security & Password", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={
              user?.profile_picture ||
              `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=6366f1&color=fff&size=128`
            }
            alt="Profile"
            className="w-32 h-32 rounded-full ring-4 ring-gray-50 dark:ring-gray-700"
          />
          <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800"></div>
        </div>
        <div className="text-center md:text-left flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.first_name} {user?.last_name}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-full capitalize">
              {user?.role}
            </span>
            {user?.department && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                {user.department.name}
              </span>
            )}
            {user?.role === "student" && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                Semester {user.current_semester || 1}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg">
            {user?.bio || "No bio added yet."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === tab.id
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
        {/* PERSONAL INFO TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                Academic Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    ID Number
                  </span>
                  <span className="font-medium">
                    {user?.student_id || user?.employee_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Program
                  </span>
                  <span className="font-medium">
                    {user?.program?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Joining Date
                  </span>
                  <span className="font-medium">
                    {user?.joining_date || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Status
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">
                    {user?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-2" /> Email
                  </span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2" /> Phone
                  </span>
                  <span className="font-medium">
                    {user?.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2" /> City
                  </span>
                  <span className="font-medium">
                    {user?.city || "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-gray-500 text-sm">
                Update your password to keep your account secure.
              </p>
            </div>

            {passwordMessage && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start text-sm ${passwordMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
                )}
                <p>{passwordMessage.text}</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {status === "loading" ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
