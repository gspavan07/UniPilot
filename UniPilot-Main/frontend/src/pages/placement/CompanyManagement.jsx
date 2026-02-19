import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchCompanies } from "../../store/slices/placementSlice";
import {
  Building2,
  MapPin,
  Tag,
  Search,
  Plus,
  MoreVertical,
} from "lucide-react";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const CompanyManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { companies, loading } = useSelector((state) => state.placement);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs items={[{ label: "Companies" }]} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Companies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage partner companies and recruitment contacts
          </p>
        </div>
        <Link
          to="/placement/companies/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Company
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="group relative bg-white dark:bg-gray-850 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    company.name.charAt(0)
                  )}
                </div>
                {/* <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreVertical className="w-6 h-6" />
                </button> */}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {company.name}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${company.company_tier === "super_dream"
                      ? "bg-purple-100 text-purple-700"
                      : company.company_tier === "dream"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {company.company_tier.toUpperCase().replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {company.industry}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {company.location || "Location not specified"}
                </div>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {company.contacts?.length || 0} Contacts
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/placement/companies/${company.id}`}
                  className="flex-1 py-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-100 dark:border-indigo-900 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-center"
                >
                  View Profile
                </Link>
                <Link
                  to={`/placement/companies/${company.id}/edit`}
                  className="px-3 py-2 text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-bold"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No companies found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or add a new company.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
