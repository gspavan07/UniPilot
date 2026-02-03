import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronRight, Home } from "lucide-react";

/**
 * items: Array<{ label: string, href?: string }>
 */
const PlacementBreadcrumbs = ({ items }) => {
  const { user } = useSelector((state) => state.auth);

  const getDashboardPath = () => {
    if (user?.role === "student") return "/placement/student/dashboard";
    if (user?.role === "hod") return "/placement/department";
    return "/placement/dashboard";
  };

  return (
    <nav className="flex mb-6 relative z-10" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to={getDashboardPath()}
            className="flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            <span className="font-medium">Placements</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-gray-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-indigo-600 font-bold">{item.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default PlacementBreadcrumbs;
