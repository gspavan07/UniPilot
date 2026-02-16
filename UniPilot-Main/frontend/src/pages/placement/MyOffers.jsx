import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOffers } from "../../store/slices/placementSlice";
import {
  Trophy,
  Building2,
  Calendar,
  ChevronRight,
  Download,
  PartyPopper,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const MyOffers = () => {
  const dispatch = useDispatch();
  const { myOffers, loading } = useSelector((state) => state.placement);

  useEffect(() => {
    dispatch(fetchMyOffers());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      {/* Background Celebration Accents */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-emerald-50/20 rounded-full blur-[150px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-50/30 rounded-full blur-[120px] -ml-24 -mb-24 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <PlacementBreadcrumbs
          items={[
            { label: "Dashboard", href: "/placement/student/dashboard" },
            { label: "My Success" },
          ]}
        />

        <header className="mt-10 mb-20 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100/50">
                  Achievement Gallery
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.9]">
                My <span className="text-blue-600">Offers.</span>
              </h1>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
                Great things happen to those who persist. Here's a record of
                your{" "}
                <span className="text-black font-bold underline decoration-emerald-500/30 underline-offset-4">
                  career milestones
                </span>{" "}
                and hard-won opportunities.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-6 p-8 bg-gray-950 rounded-[3rem] text-white shadow-2xl shadow-blue-900/10 border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">
                  Success Rate
                </p>
                <p className="text-3xl font-black tracking-tight leading-none">
                  Top 5%
                </p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-50 rounded-[3rem] border border-gray-100"
              ></div>
            ))}
          </div>
        ) : myOffers.length === 0 ? (
          <div className="py-32 text-center bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-200">
            <div className="mx-auto w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-gray-200/50 mb-10 relative">
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl animate-pulse"></div>
              <PartyPopper className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-4xl font-black text-black tracking-tight mb-4">
              The journey is just beginning.
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed mb-10 text-lg">
              Every application is a step closer to your dream role. Keep
              sharpening your skills!
            </p>
            <Link
              to="/placement/eligible"
              className="inline-flex items-center gap-4 px-10 py-5 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-black/10 group"
            >
              Browse New Roles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {myOffers.map((offer) => (
              <div
                key={offer.id}
                className="group relative bg-white rounded-[4rem] border border-gray-100 hover:border-blue-200 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(59,130,246,0.1)] overflow-hidden flex flex-col pt-2"
              >
                {/* Visual Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="p-10 relative z-10 flex-1">
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-700 overflow-hidden shadow-sm">
                      {offer.drive?.job_posting?.company?.logo_url ? (
                        <img
                          src={offer.drive.job_posting.company.logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-gray-200 group-hover:text-blue-400 transition-colors" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 shadow-sm">
                        Accepted
                      </div>
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                        Ref: #{offer.id.slice(0, 6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    <h3 className="text-3xl font-black text-black tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                      {offer.designation || "Software Engineer"}
                    </h3>
                    <p className="text-lg font-bold text-gray-400">
                      {offer.drive?.job_posting?.company?.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-50 flex items-center justify-between group-hover:bg-white group-hover:border-blue-100 transition-all">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-300">
                          Annual CTC
                        </p>
                        <p className="text-2xl font-black text-black tracking-tight">
                          ₹{offer.ctc_lpa || offer.drive?.job_posting?.ctc_lpa}{" "}
                          LPA
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-50 space-y-4 group-hover:bg-white group-hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-300">
                            Joining Date
                          </p>
                          <p className="text-xs font-black text-black">
                            {offer.joining_date
                              ? new Date(offer.joining_date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "To be decided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto relative z-10">
                  <div className="flex flex-col gap-4">
                    <a
                      href={offer.offer_letter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-gray-950 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-black/10 group/btn"
                    >
                      <Download className="w-3.5 h-3.5 group-hover/btn:-translate-y-1 transition-transform" />
                      Official Offer Letter
                    </a>
                    <button className="flex items-center justify-center gap-3 w-full py-5 bg-white text-blue-600 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all border-2 border-blue-100">
                      View Benefits Package
                    </button>
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

export default MyOffers;
