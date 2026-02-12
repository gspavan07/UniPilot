import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Bus,
  MapPin,
  Users,
  Calendar,
  AlertTriangle,
  BarChart3,
  UserPlus,
  Route as RouteIcon,
  PlusCircle,
  FileText,
} from "lucide-react";
import { fetchTransportDashboardStats } from "../../store/slices/transportSlice";

const TransportDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, status } = useSelector((state) => state.transport);

  useEffect(() => {
    dispatch(fetchTransportDashboardStats());
  }, [dispatch]);

  const cards = [
    {
      title: "Route Management",
      description: "Manage transport routes and stops",
      icon: <RouteIcon className="w-8 h-8 text-blue-500" />,
      link: "/transport/routes",
      count: dashboardStats?.totalRoutes || 0,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Vehicle Management",
      description: "Manage buses and vehicle maintenance",
      icon: <Bus className="w-8 h-8 text-purple-500" />,
      link: "/transport/vehicles",
      count: dashboardStats?.totalVehicles || 0,
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "Driver Management",
      description: "Manage transport drivers and staff",
      icon: <Users className="w-8 h-8 text-green-500" />,
      link: "/transport/drivers",
      count: dashboardStats?.totalDrivers || 0,
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Student Allocation",
      description: "Assign students to routes and stops",
      icon: <UserPlus className="w-8 h-8 text-orange-500" />,
      link: "/transport/allocations",
      count: dashboardStats?.activeAllocations || 0,
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "Trip Management",
      description: "Special trips and daily trip logs",
      icon: <Calendar className="w-8 h-8 text-indigo-500" />,
      link: "/transport/trips",
      count: dashboardStats?.pendingTrips || 0,
      color: "bg-indigo-50 border-indigo-200",
    },
    {
      title: "Reports & Analytics",
      description: "View utilization and revenue reports",
      icon: <BarChart3 className="w-8 h-8 text-pink-500" />,
      link: "/transport/reports",
      color: "bg-pink-50 border-pink-200",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Transport Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage university transportation services
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Routes"
          value={dashboardStats?.totalRoutes || 0}
          icon={<RouteIcon className="w-6 h-6" />}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <StatCard
          title="Active Vehicles"
          value={dashboardStats?.totalVehicles || 0}
          icon={<Bus className="w-6 h-6" />}
          color="text-purple-600"
          bg="bg-purple-100"
        />
        <StatCard
          title="Allocated Students"
          value={dashboardStats?.activeAllocations || 0}
          icon={<Users className="w-6 h-6" />}
          color="text-green-600"
          bg="bg-green-100"
        />
        <StatCard
          title="Pending Trips"
          value={dashboardStats?.pendingTrips || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="text-orange-600"
          bg="bg-orange-100"
        />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`p-6 border rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 ${card.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {card.icon}
              </div>
              {card.count !== undefined && (
                <span className="text-2xl font-bold text-gray-900">
                  {card.count}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {card.title}
            </h3>
            <p className="text-gray-600 text-sm">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <PlusCircle className="mr-2 text-blue-500" />
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <span className="font-medium">Allocate Student to Route</span>
              <UserPlus className="w-5 h-5 text-gray-500" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <span className="font-medium">Log Daily Trip</span>
              <FileText className="w-5 h-5 text-gray-500" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <span className="font-medium">Create Special Trip</span>
              <Calendar className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            Maintenance & Compliance Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="mr-4">
                <Bus className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-bold text-yellow-800 dark:text-yellow-200">
                  Vehicle Fitness Expiring
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Bus AP 12 X 4567 fitness expires in 12 days
                </p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="mr-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800 dark:text-red-200">
                  License Renewal Due
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Driver Rameshwar Rao license expires in 5 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex items-center justify-between pointer-events-none">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
      <div className={`p-3 ${bg} ${color} rounded-lg`}>{icon}</div>
    </div>
  </div>
);

export default TransportDashboard;
