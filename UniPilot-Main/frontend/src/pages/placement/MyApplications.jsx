import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyApplications } from "../../store/slices/placementSlice";
import {
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const MyApplications = () => {
  const dispatch = useDispatch();
  const { myApplications, loading } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const stages = [
    {
      key: "applied",
      label: "Applied",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      icon: TrendingUp,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      key: "technical_interview",
      label: "Technical",
      icon: Layers,
      icon_size: "w-4 h-4",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      key: "hr_interview",
      label: "HR Round",
      icon: CheckCircle2,
      icon_size: "w-4 h-4",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      key: "placed",
      label: "Hired",
      icon: BadgeCheckIcon,
      icon_size: "w-4 h-4",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  // Helper for fun icon mapping
  function BadgeCheckIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z" />
        <polyline points="9 11 12 14 22 4" />
      </svg>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "placed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      case "shortlisted":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-50/30 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <PlacementBreadcrumbs
          items={[
            { label: "Dashboard", href: "/placement/student/dashboard" },
            { label: "My Applications" },
          ]}
        />

        <header className="mt-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  Career Intelligence
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Track your journey
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Application <span className="text-blue-600">Funnel.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
                Monitor your recruitment progress in real-time, from initial
                application to final offer letters.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-[1.5rem] border border-gray-100">
              <div className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm border border-gray-100">
                Total: {myApplications.length}
              </div>
              <div className="px-6 py-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                Hired:{" "}
                {myApplications.filter((a) => a.status === "Placed").length}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-50 rounded-[2.5rem] border border-gray-100"
              ></div>
            ))}
          </div>
        ) : myApplications.length === 0 ? (
          <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
            <div className="mx-auto w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-gray-200/50 mb-8">
              <Briefcase className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-3xl font-black text-black tracking-tight mb-3">
              You haven't applied yet.
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed mb-8">
              Start your career journey by exploring active recruitment drives
              tailored to your skills.
            </p>
            <Link
              to="/placement/eligible"
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              Browse Active Drives
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="group relative bg-white rounded-[2.5rem] border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden"
              >
                <div className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
                    {/* Application Header */}
                    <div className="lg:w-1/3 space-y-6">
                      <div className="flex gap-5 items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-[1.2rem] flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-500 overflow-hidden shadow-sm">
                          {app.drive?.job_posting?.company?.logo_url ? (
                            <img
                              src={app.drive.job_posting.company.logo_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-200" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-black tracking-tight group-hover:text-blue-600 transition-colors">
                            {app.drive?.drive_name}
                          </h3>
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {app.drive?.job_posting?.company?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 flex items-center gap-2 ${getStatusColor(app.status)} shadow-sm`}
                        >
                          {app.status === "Placed" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : app.status === "Rejected" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {app.status}
                        </div>
                        <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100 shadow-sm flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied:{" "}
                          {new Date(app.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Visual Funnel/Progress Tracker */}
                    <div className="flex-1 relative pb-4 px-2">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden pointer-events-none">
                        <div
                          className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          style={{
                            width: `${app.status === "Placed" ? 100 : app.status === "Shortlisted" ? 40 : 15}%`,
                          }}
                        ></div>
                      </div>

                      <div className="relative z-10 flex justify-between items-center w-full">
                        {stages.map((stage, idx) => {
                          const isCompleted =
                            app.status === "Placed" ||
                            (app.status === "Shortlisted" && idx <= 1) ||
                            idx === 0;
                          return (
                            <div
                              key={stage.key}
                              className="flex flex-col items-center gap-4 group/step"
                            >
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                                  isCompleted
                                    ? "bg-white border-blue-600 shadow-xl shadow-blue-500/10"
                                    : "bg-gray-50 border-gray-100"
                                }`}
                              >
                                <stage.icon
                                  className={`w-4 h-4 ${isCompleted ? "text-blue-600" : "text-gray-300"}`}
                                />
                              </div>
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? "text-black" : "text-gray-300"} whitespace-nowrap hidden sm:block`}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sidebar/Action */}
                    <div className="lg:w-48 flex lg:flex-col justify-between items-center lg:items-end gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-12">
                      <div className="text-left lg:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                          CTC Offered
                        </p>
                        <p className="text-xl font-black text-black leading-none tracking-tight">
                          ₹{app.drive?.job_posting?.ctc_lpa} LPA
                        </p>
                      </div>

                      <Link
                        to={`/placement/my-applications/${app.id}`}
                        className="group flex items-center gap-3 px-6 py-4 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10"
                      >
                        Details
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
