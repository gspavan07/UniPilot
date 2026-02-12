import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEligibleDrives } from "../../store/slices/placementSlice";
import {
  Search,
  Filter,
  MapPin,
  Banknote,
  Building2,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const BrowseDrives = () => {
  const dispatch = useDispatch();
  const { eligibleDrives, loading } = useSelector((state) => state.placement);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    dispatch(fetchEligibleDrives());
  }, [dispatch]);

  const filteredDrives = eligibleDrives.filter((drive) => {
    const matchesSearch =
      drive.drive_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.job_posting?.company?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (filterMode === "online")
      return matchesSearch && drive.mode === "online";
    if (filterMode === "offline")
      return matchesSearch && drive.mode === "offline";
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs
        items={[
          { label: "Dashboard", href: "/placement/student/dashboard" },
          { label: "Eligible Drives" },
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Active Opportunities
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Explore and apply for campus recruitment drives
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or role..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "online", "offline"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterMode === mode
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrives.map((drive) => (
          <div
            key={drive.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all border-b-4 border-b-indigo-500"
          >
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-750 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                  {drive.job_posting?.company?.logo_url ? (
                    <img
                      src={drive.job_posting.company.logo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        drive.job_posting?.company?.company_tier ===
                        "super_dream"
                          ? "bg-purple-100 text-purple-700"
                          : drive.job_posting?.company?.company_tier === "dream"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {drive.job_posting?.company?.company_tier || "Regular"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 leading-tight">
                    {drive.drive_name}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    {drive.job_posting?.company?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Banknote className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-bold whitespace-nowrap">
                    ₹{drive.job_posting?.ctc_lpa} LPA
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {drive.venue || drive.mode}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Info className="w-4 h-4 mr-2 text-gray-400" />
                  Apply by{" "}
                  {new Date(drive.registration_end).toLocaleDateString()}
                </div>
              </div>

              {!drive.isEligible ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold mb-4">
                  Ineligible: {drive.ineligible_reason}
                </div>
              ) : null}

              <div className="flex gap-2">
                <Link
                  to={`/placement/drives/${drive.id}/apply`}
                  className="flex-1 py-2 text-center bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                >
                  Details
                </Link>
                {drive.isEligible && (
                  <Link
                    to={`/placement/drives/${drive.id}/apply`}
                    className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700"
                  >
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrives.length === 0 && !loading && (
        <div className="p-20 text-center">
          <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No drives found
          </h3>
          <p className="text-gray-500">
            Check back later for more opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseDrives;
