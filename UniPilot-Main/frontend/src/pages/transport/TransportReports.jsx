import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bus,
  Wallet,
  Receipt,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchTransportDashboardStats } from "../../store/slices/transportSlice";

const TransportReports = () => {
  const dispatch = useDispatch();
  const { dashboardStats, status } = useSelector((state) => state.transport);

  useEffect(() => {
    dispatch(fetchTransportDashboardStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const reportCards = [
    {
      title: "Total Vehicles",
      value: dashboardStats?.totalVehicles || 0,
      icon: Bus,
      desc: "Registered fleet size",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      accent: "bg-indigo-500",
    },
    {
      title: "Fee to be Collected",
      value: formatCurrency(dashboardStats?.totalToCollectFee || 0),
      icon: Wallet,
      desc: "Outstanding transport revenue",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      accent: "bg-amber-500",
    },
    {
      title: "Total Collected Fee",
      value: formatCurrency(dashboardStats?.totalCollectedFee || 0),
      icon: Receipt,
      desc: "Realized transport revenue",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      accent: "bg-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link
              to="/transport"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Transport Analytics
              </h1>
              <p className="text-gray-500 mt-2 font-medium">
                Detailed financial and operational performance reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900">
                Period: Current Semester
              </p>
              <p className="text-gray-400 font-medium tracking-tight">
                Updated just now
              </p>
            </div>
          </div>
        </div>

        {/* Analytic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reportCards.map((card, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden bg-white p-8 rounded-3xl border ${card.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              {/* Decoration */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500`}
              />

              <div className="relative z-10 space-y-6">
                <div
                  className={`inline-flex p-4 rounded-2xl ${card.bg} ${card.color} shadow-inner`}
                >
                  <card.icon className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {card.title}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">
                      {card.value}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 font-medium">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">
                    Live Metric
                  </span>
                  <div
                    className={`h-1.5 w-12 rounded-full ${card.accent} opacity-30`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for charts/tables */}
        <div className="bg-white border border-dashed border-gray-300 rounded-[32px] p-20 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Trend Analysis Coming Soon
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              We are building advanced charts and comparative reports to help
              you track transport efficiency over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportReports;
