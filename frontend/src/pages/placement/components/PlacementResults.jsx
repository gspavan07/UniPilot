import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import {
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const PlacementResults = ({ driveId }) => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacements();
  }, [driveId]);

  const fetchPlacements = async () => {
    try {
      const response = await api.get(`/placement/drives/${driveId}/placements`);
      setPlacements(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch placement results");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
              Student
            </th>
            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
              Designation
            </th>
            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
              Package (LPA)
            </th>
            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
              Joining Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
              Offer Letter
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
          {placements.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="font-bold text-gray-900 dark:text-white">
                  {p.student?.first_name} {p.student?.last_name}
                </div>
                <div className="text-xs text-gray-400">
                  {p.student?.student_id}
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {p.designation}
              </td>
              <td className="px-6 py-4 font-bold text-emerald-600">
                ₹{p.package_lpa} LPA
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {p.joining_date || "Not Set"}
                </div>
              </td>
              <td className="px-6 py-4">
                {p.offer_letter_url ? (
                  <a
                    href={p.offer_letter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Offer
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs italic">Pending</span>
                )}
              </td>
            </tr>
          ))}
          {placements.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-12 text-center text-gray-500 italic"
              >
                No placement records found yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlacementResults;
