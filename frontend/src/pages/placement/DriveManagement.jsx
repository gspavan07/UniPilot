import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrives } from "../../store/slices/placementSlice";
import { Calendar, MapPin, Users, Tag, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const DriveManagement = () => {
  const dispatch = useDispatch();
  const { drives, loading } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchDrives());
  }, [dispatch]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs items={[{ label: "Placement Drives" }]} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Placement Drives
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Schedule and monitor recruitment events on campus
          </p>
        </div>
        <Link
          to="/placement/drives/new"
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Drive
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">
          Fetching drive data...
        </div>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => (
            <Link
              key={drive.id}
              to={`/placement/drives/${drive.id}`}
              className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
            >
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-500 mr-6">
                {drive.job_posting?.company?.logo_url ? (
                  <img
                    src={drive.job_posting.company.logo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  drive.job_posting?.company?.name?.charAt(0) || "D"
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {drive.drive_name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      drive.status === "scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : drive.status === "ongoing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {drive.status}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-3">
                  {drive.job_posting?.company?.name} •{" "}
                  {drive.job_posting?.role_title}
                </p>
                <div className="flex gap-6 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {drive.drive_date || "TBA"}
                  </div>
                  <div className="flex items-center text-indigo-500 font-semibold">
                    <Tag className="w-4 h-4 mr-2" />₹
                    {drive.job_posting?.ctc_lpa || "0"} LPA
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block mr-8">
                  <div className="flex items-center justify-end text-sm text-gray-500 mb-1 font-medium">
                    <Users className="w-4 h-4 mr-1" />
                    Registered Students
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}

          {drives.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Calendar className="w-16 h-16 text-gray-100 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Empty calendar
              </h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                No placement drives have been scheduled yet. Click the button
                above to start.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriveManagement;
