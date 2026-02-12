import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOffers } from "../../store/slices/placementSlice";
import {
  Trophy,
  Calendar,
  FileText,
  Building2,
  BadgeCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const MyOffers = () => {
  const dispatch = useDispatch();
  const { myOffers, loading } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchMyOffers());
  }, [dispatch]);

  if (loading && myOffers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Loading your success stories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pt-8 pb-12 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <PlacementBreadcrumbs
            items={[
              { label: "Dashboard", to: "/placement" },
              { label: "My Offers" },
            ]}
            className="mb-8"
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  My Offers
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-xl">
                Congratulations! Track and manage your recruitment successes
                here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {myOffers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-20 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <BadgeCheck className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              No offers received yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
              Keep pushing! Your hard work will pay off soon. Check your ongoing
              applications to stay updated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myOffers.map((offer, idx) => (
              <div
                key={offer.id}
                className="group bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                      {offer.drive?.job_posting?.company?.logo_url ? (
                        <img
                          src={offer.drive.job_posting.company.logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        offer.company_name?.charAt(0) || "C"
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                        {offer.status}
                      </span>
                      <div className="text-2xl font-black text-emerald-600 mt-2 tracking-tight">
                        ₹{offer.package_lpa} LPA
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                    {offer.designation}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-sm mb-6">
                    <Building2 className="w-4 h-4" />
                    {offer.company_name}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gray-50 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-black uppercase tracking-widest">
                        Expected Joining
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {offer.joining_date || "To be shared"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-black uppercase tracking-widest">
                        Drive Type
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {offer.is_on_campus ? "On Campus" : "Off Campus"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 flex gap-2">
                  {offer.offer_letter_url ? (
                    <a
                      href={offer.offer_letter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      <FileText className="w-4 h-4" />
                      View Offer Letter
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl font-black text-xs">
                      <Clock className="w-4 h-4" />
                      Processing Offer
                    </div>
                  )}
                  <button className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group/info">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover/info:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;
