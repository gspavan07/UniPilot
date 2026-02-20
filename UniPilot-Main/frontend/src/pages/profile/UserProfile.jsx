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
  Users,
  GraduationCap,
  FileText,
  Info,
  CreditCard,
  Building,
  History,
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
      }),
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

  const isStudent = user?.role === "student";

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    ...(isStudent
      ? [
        { id: "academic", label: "Academic", icon: GraduationCap },
        { id: "personal", label: "Personal", icon: User },
        { id: "family", label: "Family", icon: Users },
        { id: "history", label: "Education", icon: History },
        { id: "documents", label: "Documents", icon: FileText },
      ]
      : [{ id: "details", label: "Profile Details", icon: User }]),
    { id: "security", label: "Security", icon: Shield },
  ];

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex justify-between border-b border-gray-50 dark:border-gray-700/50 pb-3 items-center">
      <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
        {Icon && <Icon className="w-3.5 h-3.5 mr-2 opacity-50" />}
        {label}
      </span>
      <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
        {value || "N/A"}
      </span>
    </div>
  );

  const SectionTitle = ({ title, icon: Icon }) => (
    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center mb-6">
      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
        <Icon className="w-4 h-4" />
      </div>
      {title}
    </h3>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10">
          <div className="relative">
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
              className="w-32 h-32 rounded-3xl ring-4 ring-white dark:ring-gray-800 object-cover shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"></div>
          </div>
        </div>

        <div className="text-center md:text-left flex-1 space-y-3 z-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {user?.email}
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-4 py-1.5 bg-primary-600 text-white text-xs font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary-500/20">
              {user?.role}
            </span>
            {user?.department && (
              <span className="px-4 py-1.5 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl shadow-sm">
                {user.department.name}
              </span>
            )}
            {user?.program && (
              <span className="px-4 py-1.5 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl shadow-sm">
                {user.program.name}
              </span>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center p-6 border-l border-gray-100 dark:border-gray-700 space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Global ID
          </p>
          <p className="text-xl font-black text-primary-600 dark:text-primary-400 font-mono">
            #{user?.student_id || user?.employee_id || "N/A"}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700/50 max-w-fit mx-auto md:mx-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-5 py-2.5 font-bold text-xs transition-all rounded-xl ${activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <tab.icon
              className={`w-3.5 h-3.5 mr-2 ${activeTab === tab.id ? "animate-pulse" : ""}`}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-8">
              <SectionTitle title="Account Overview" icon={Info} />
              <div className="space-y-4">
                <DetailItem
                  label="Full Name"
                  value={`${user?.first_name} ${user?.last_name}`}
                  icon={User}
                />
                <DetailItem
                  label="Official Email"
                  value={user?.email}
                  icon={Mail}
                />
                <DetailItem
                  label="Phone Number"
                  value={user?.phone}
                  icon={Phone}
                />
                <DetailItem
                  label="Account Status"
                  value={user?.is_active ? "Verified & Active" : "Inactive"}
                  icon={CheckCircle}
                />
                <DetailItem
                  label="Joining Date"
                  value={user?.joining_date}
                  icon={Calendar}
                />
              </div>
            </div>

            <div className="space-y-8">
              <SectionTitle title="Bio / About" icon={Briefcase} />
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed">
                  {user?.bio ||
                    "This user prefers to keep their bio a mystery. No description provided yet."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800">
                  <p className="text-[10px] font-black text-primary-600/60 uppercase tracking-widest mb-1">
                    User Role
                  </p>
                  <p className="text-sm font-black text-primary-700 dark:text-primary-300">
                    {user?.role?.toUpperCase()}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest mb-1">
                    Affiliation
                  </p>
                  <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                    {user?.department?.code || "INSTITUTION"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC TAB (Student Specific) */}
        {activeTab === "academic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-8">
              <SectionTitle title="Enrollment Details" icon={GraduationCap} />
              <div className="space-y-4">
                <DetailItem label="Program Name" value={user?.program?.name} />
                <DetailItem label="Program Code" value={user?.program?.code} />
                <DetailItem label="Batch Year" value={user?.batch_year} />
                <DetailItem
                  label="Academic Regulation"
                  value={user?.regulation?.name}
                />
                <DetailItem
                  label="Passout Year"
                  value={user?.batch_year ? user.batch_year + 4 : "N/A"}
                />
              </div>
            </div>
            <div className="space-y-8">
              <SectionTitle title="Current Standing" icon={Award} />
              <div className="space-y-4">
                <DetailItem
                  label="Current Semester"
                  value={`Semester ${user?.current_semester || 1}`}
                />
                <DetailItem
                  label="Section Assignment"
                  value={
                    user?.section
                      ? `Section ${user.section}`
                      : "Awaiting assignment"
                  }
                />
                <DetailItem
                  label="Admission Type"
                  value={user?.admission_type}
                />
                <DetailItem
                  label="Global Admission #"
                  value={user?.global_admission_number}
                />
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL TAB */}
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-8">
              <SectionTitle title="Identity Information" icon={CreditCard} />
              <div className="space-y-4">
                <DetailItem
                  label="Aadhaar Number"
                  value={user?.aadhaar_number}
                />
                <DetailItem label="PAN Number" value={user?.pan_number} />
                <DetailItem
                  label="Passport Number"
                  value={user?.passport_number}
                />
                <DetailItem
                  label="Date of Birth"
                  value={user?.date_of_birth}
                  icon={Calendar}
                />
                <DetailItem
                  label="Gender"
                  value={user?.gender.toUpperCase()}
                  icon={User}
                />
                <DetailItem label="Blood Group" value={user?.blood_group} />
                <DetailItem label="Category" value={user?.caste} />
              </div>
            </div>
            <div className="space-y-8">
              <SectionTitle title="Address Details" icon={MapPin} />
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    State & City
                  </p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {user?.city}, {user?.state} - {user?.zip_code}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Residential Address
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {user?.address || "No detailed address provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAMILY TAB */}
        {activeTab === "family" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-8">
              <SectionTitle title="Parent Information" icon={Users} />
              <div className="space-y-4">
                <DetailItem
                  label="Father's Name"
                  value={user?.parent_details?.father_name}
                />
                <DetailItem
                  label="Father's Phone"
                  value={user?.parent_details?.father_mobile}
                />
                <DetailItem
                  label="Father's Job"
                  value={user?.parent_details?.father_job}
                />
                <DetailItem
                  label="Father's Email"
                  value={user?.parent_details?.father_email}
                />
                <div className="h-4" />
                <DetailItem
                  label="Mother's Name"
                  value={user?.parent_details?.mother_name}
                />
                <DetailItem
                  label="Mother's Phone"
                  value={user?.parent_details?.mother_mobile}
                />
                <DetailItem
                  label="Mother's Job"
                  value={user?.parent_details?.mother_job}
                />
                <DetailItem
                  label="Mother's Email"
                  value={user?.parent_details?.mother_email}
                />
              </div>
            </div>
            <div className="space-y-8">
              <SectionTitle title="Guardian / Alternate" icon={Shield} />
              <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-400 font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Emergency Contact
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-orange-600/70 text-sm">Guardian</span>
                    <span className="font-bold text-orange-900 dark:text-orange-200">
                      {user?.parent_details?.guardian_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600/70 text-sm">Phone</span>
                    <span className="font-bold text-orange-900 dark:text-orange-200">
                      {user?.parent_details?.guardian_mobile || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-12 animate-fade-in">
            <div className="max-w-2xl">
              <SectionTitle title="Educational Qualifications" icon={History} />
              {user?.previous_academics?.length > 0 ? (
                <div className="space-y-4">
                  {user.previous_academics.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center mr-4 border border-gray-100 dark:border-gray-700">
                          <Award className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {edu.qualification || edu.board}
                          </p>
                          <p className="text-xs text-gray-500">
                            {edu.school} ({edu.year}) • {edu.board}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary-600 dark:text-primary-400">
                          {edu.percentage}%
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-black">
                          Score
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    No historical records found.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-12 animate-fade-in">
            <SectionTitle title="Authenticated Documents" icon={FileText} />
            {user?.documents?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${doc.status === "approved"
                            ? "bg-success-50 text-success-600"
                            : doc.status === "rejected"
                              ? "bg-error-50 text-error-600"
                              : "bg-warning-50 text-warning-600"
                          }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {doc.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-6 uppercase tracking-tighter">
                      {doc.type}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700">
                      <a
                        href={`${doc.file_url}?token=${localStorage.getItem("accessToken")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  No documents uploaded yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="max-w-md mx-auto animate-fade-in py-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Secure Access
              </h3>
              <p className="text-gray-500 text-sm">
                Last updated password ensures higher security.
              </p>
            </div>

            {passwordMessage && (
              <div
                className={`mb-6 p-4 rounded-2xl flex items-start text-sm ${passwordMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2 shrink-0 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mr-2 shrink-0 animate-shake" />
                )}
                <p className="font-medium">{passwordMessage.text}</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
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
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
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
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 transform active:scale-95"
              >
                {status === "loading" ? "Processing..." : "Secure Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
