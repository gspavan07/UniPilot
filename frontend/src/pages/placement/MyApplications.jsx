import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyApplications } from "../../store/slices/placementSlice";
import {
  Briefcase,
  MapPin,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const MyApplications = () => {
  const dispatch = useDispatch();
  const { myApplications, loading } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "placed":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-100";
      case "shortlisted":
        return "text-indigo-600 bg-indigo-50 border-indigo-100";
      default:
        return "text-amber-600 bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PlacementBreadcrumbs
        items={[
          { label: "Dashboard", href: "/placement/student/dashboard" },
          { label: "My Applications" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Applications
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your progress in recruitment drives
        </p>
      </div>

      <div className="space-y-6">
        {myApplications.length === 0 && !loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No applications yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Start browsing eligible drives and apply to kickstart your career!
            </p>
            <Link
              to="/placement/eligible"
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              Browse Drives
            </Link>
          </div>
        ) : (
          myApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Left: Company & Drive Info */}
                <div className="flex-1">
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-750 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                      {app.drive?.job_posting?.company?.logo_url ? (
                        <img
                          src={app.drive.job_posting.company.logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Briefcase className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        {app.drive?.drive_name}
                      </h3>
                      <p className="text-indigo-600 font-bold mt-1">
                        {app.drive?.job_posting?.company?.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Applied on:{" "}
                      {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {app.drive?.venue || app.drive?.mode}
                    </div>
                  </div>
                </div>

                {/* Right: Status & Steps */}
                <div className="md:w-72 flex flex-col justify-center gap-4">
                  <div
                    className={`px-4 py-2 rounded-xl border text-center font-bold text-sm ${getStatusColor(app.status)}`}
                  >
                    {app.status.toUpperCase()}
                  </div>
                  <Link
                    to={`/placement/drive/${app.drive_id}`}
                    className="w-full py-3 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-100 dark:border-gray-700 text-center text-sm font-bold hover:bg-gray-100 transition-colors"
                  >
                    View Drive Details
                  </Link>
                </div>
              </div>

              {/* Funnel Progress (Dynamic) */}
              <div className="px-8 pb-8 pt-2 overflow-x-auto">
                <div className="flex items-center w-full min-w-[500px]">
                  {/* Step 0: Applied */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-black text-emerald-600 mt-2 whitespace-nowrap">
                      Applied
                    </span>
                  </div>

                  {app.drive?.rounds?.map((round, index) => {
                    const isCompleted =
                      app.status === "placed" ||
                      (app.current_round &&
                        app.current_round.round_number > round.round_number);
                    const isCurrent =
                      app.status !== "rejected" &&
                      app.status !== "placed" &&
                      app.current_round_id === round.id;
                    const isRejected =
                      app.status === "rejected" &&
                      app.current_round_id === round.id;

                    return (
                      <React.Fragment key={round.id}>
                        <div
                          className={`flex-1 h-1 mx-2 mb-6 transition-colors duration-500 ${isCompleted || isCurrent || isRejected ? "bg-indigo-500" : "bg-gray-100 dark:bg-gray-700"}`}
                        ></div>

                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                              isCompleted
                                ? "bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-900/20"
                                : isCurrent
                                  ? "bg-indigo-600 text-white ring-4 ring-indigo-50 dark:ring-indigo-900/20 animate-pulse"
                                  : isRejected
                                    ? "bg-red-500 text-white ring-4 ring-red-50 dark:ring-red-900/20"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isRejected ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <span
                            className={`text-[10px] uppercase font-black mt-2 whitespace-nowrap ${
                              isCompleted
                                ? "text-emerald-600"
                                : isCurrent
                                  ? "text-indigo-600"
                                  : isRejected
                                    ? "text-red-500"
                                    : "text-gray-400"
                            }`}
                          >
                            {round.round_name}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Final Step: Selected/Placed */}
                  <div
                    className={`flex-1 h-1 mx-2 mb-6 ${app.status === "placed" ? "bg-emerald-500" : "bg-gray-100 dark:bg-gray-700"}`}
                  ></div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${app.status === "placed" ? "bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-900/20" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                    >
                      {app.status === "placed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        (app.drive?.rounds?.length || 0) + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-black mt-2 whitespace-nowrap ${app.status === "placed" ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      Selected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyApplications;
