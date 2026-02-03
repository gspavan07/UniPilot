import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanyById,
  clearCurrentCompany,
} from "../../store/slices/placementSlice";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  User,
  Briefcase,
  ChevronLeft,
  Calendar,
  Users,
  ExternalLink,
  Award,
  Clock,
} from "lucide-react";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const CompanyProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCompany: company, loading } = useSelector(
    (state) => state.placement,
  );
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyById(id));
    }
    return () => {
      dispatch(clearCurrentCompany());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Company not found
        </h2>
        <Link
          to="/placement/companies"
          className="text-indigo-600 hover:underline mt-4 inline-block font-bold"
        >
          Back to Companies
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "postings", label: "Job Postings", icon: Briefcase },
    { id: "history", label: "Drive History", icon: Calendar },
    { id: "students", label: "Working Students", icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Companies", href: "/placement/companies" },
          { label: company.name },
        ]}
      />

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row gap-6 -mt-12 items-end md:items-center">
            <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-3xl shadow-xl flex items-center justify-center p-4 border-4 border-white dark:border-gray-800 overflow-hidden">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-16 h-16 text-gray-200" />
              )}
            </div>
            <div className="flex-1 mt-12 md:mt-0 pt-2">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    company.company_tier === "super_dream"
                      ? "bg-purple-100 text-purple-700"
                      : company.company_tier === "dream"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {company.company_tier} Tier
                </span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {company.industry || "General Industry"}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {company.location || "Global"}
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/placement/companies/${company.id}/edit`}
                className="px-6 py-2.5 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                Edit Company
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar info */}
        <div className="space-y-8">
          {/* HR Contacts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              HR Contacts
            </h3>
            <div className="space-y-6">
              {company.contacts && company.contacts.length > 0 ? (
                company.contacts.map((contact) => (
                  <div key={contact.id} className="group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {contact.designation}
                        </p>
                        <div className="space-y-1">
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center text-xs text-indigo-500 hover:underline"
                          >
                            <Mail className="w-3 h-3 mr-1.5" />
                            {contact.email}
                          </a>
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center text-xs text-gray-500"
                          >
                            <Phone className="w-3 h-3 mr-1.5" />
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No contact details added.
                </p>
              )}
            </div>
          </div>

          {/* Stats Box */}
          <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mb-1">
                  Total Drives
                </p>
                <p className="text-xl font-bold">
                  {company.job_postings?.reduce(
                    (sum, jp) => sum + (jp.drives?.length || 0),
                    0,
                  ) || 0}
                </p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mb-1">
                  Total Hired
                </p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Custom Tabs */}
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  About the Company
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {company.description ||
                    "No company description provided yet."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        Recognition
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      Company is categorized in the{" "}
                      <span className="text-indigo-600 font-bold uppercase">
                        {company.company_tier}
                      </span>{" "}
                      tier based on recruitment standards and package offerings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "postings" && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {company.job_postings && company.job_postings.length > 0 ? (
                  company.job_postings.map((posting) => (
                    <div
                      key={posting.id}
                      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-200 transition-all flex justify-between items-center group"
                    >
                      <div className="flex gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <Briefcase className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                            {posting.role_title}
                          </h4>
                          <div className="flex gap-4 mt-1 text-sm text-gray-500">
                            <span className="font-bold text-emerald-600">
                              ₹{posting.ctc_lpa} LPA
                            </span>
                            <span>•</span>
                            <span>{posting.job_type || "Full Time"}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/placement/postings/${posting.id}/edit`}
                        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                      >
                        <Briefcase className="w-5 h-5" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-400">
                    No job postings found for this company.
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Drive Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {company.job_postings?.flatMap((jp) => jp.drives || [])
                      .length > 0 ? (
                      company.job_postings
                        .flatMap((jp) => jp.drives)
                        .map((drive) => (
                          <tr
                            key={drive.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {drive.drive_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(drive.drive_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                  drive.status === "scheduled"
                                    ? "bg-blue-100 text-blue-600"
                                    : drive.status === "ongoing"
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-green-100 text-green-600"
                                }`}
                              >
                                {drive.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/placement/drive/${drive.id}`}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-gray-400 italic"
                        >
                          No recruitment history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "students" && (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Alumni Tracking
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                  This section will show the list of students hired by this
                  company in previous academic years.
                </p>
                <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl inline-flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  Feature coming in next phase
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
