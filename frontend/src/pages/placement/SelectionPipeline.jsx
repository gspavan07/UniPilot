import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriveById } from "../../store/slices/placementSlice";
import api from "../../utils/api";
import {
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const SelectionPipeline = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentDrive, loading } = useSelector((state) => state.placement);
  const [candidates, setCandidates] = useState([]);
  const [activeRound, setActiveRound] = useState(0);

  useEffect(() => {
    dispatch(fetchDriveById(id));
    fetchCandidates();
  }, [id, dispatch]);

  const fetchCandidates = async () => {
    try {
      const response = await api.get(`/placement/drives/${id}/applications`);
      setCandidates(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch candidates");
    }
  };

  const updateCandidateStatus = async (appId, status, roundId) => {
    try {
      await api.put(`/placement/applications/${appId}/status`, {
        status,
        roundId,
      });
      toast.success(`Candidate status updated to ${status}`);
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const rounds = [
    { id: "applied", round_name: "Applied Students" },
    ...(currentDrive?.rounds?.sort((a, b) => a.round_number - b.round_number) ||
      []),
    { id: "selected", round_name: "Final Selections" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PlacementBreadcrumbs
        items={[
          { label: "Drives", href: "/placement/drives" },
          {
            label: currentDrive?.drive_name || "Drive",
            href: `/placement/drives/${id}`,
          },
          { label: "Pipeline" },
        ]}
      />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Selection Pipeline
          </h1>
          <p className="text-gray-500">
            {currentDrive?.drive_name} • Funnel View
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold shadow-sm">
            Export Results
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
            Publish Results
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
        {rounds.map((round, idx) => {
          const roundCandidates = candidates.filter(
            (c) =>
              (round.id === "applied" && c.status === "applied") ||
              (round.id === "selected" && c.status === "placed") ||
              (c.current_round_id === round.id && c.status === "shortlisted"),
          );

          return (
            <div key={round.id} className="min-w-[320px] w-80 shrink-0">
              <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {round.round_name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">
                    {roundCandidates.length} CANDIDATES
                  </p>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>

              <div className="space-y-3">
                {roundCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
                  >
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-indigo-600 text-sm">
                        {candidate.student?.first_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {candidate.student?.first_name}{" "}
                          {candidate.student?.last_name}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-medium truncate">
                          {candidate.student?.id_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {idx < rounds.length - 1 && (
                        <button
                          onClick={() =>
                            updateCandidateStatus(
                              candidate.id,
                              "shortlisted",
                              rounds[idx + 1].id,
                            )
                          }
                          className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                        >
                          SHORLIST <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          updateCandidateStatus(candidate.id, "rejected")
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {roundCandidates.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400 font-medium">
                      No candidates in this stage
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectionPipeline;
