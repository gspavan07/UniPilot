import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriveById } from "../../store/slices/placementSlice";
import api from "../../utils/api";
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  ArrowRight,
  MoreVertical,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";

const SelectionPipeline = ({ driveId: propDriveId }) => {
  const { id: paramId } = useParams();
  const id = propDriveId || paramId;
  const dispatch = useDispatch();
  const { currentDrive, loading } = useSelector((state) => state.placement);

  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterRound, setFilterRound] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchDriveById(id));
      fetchCandidates();
    }
  }, [id, dispatch]);

  useEffect(() => {
    filterCandidates();
  }, [candidates, filterRound, searchQuery]);

  const fetchCandidates = async () => {
    try {
      const response = await api.get(`/placement/drives/${id}/applications`);
      setCandidates(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch candidates");
    }
  };

  const filterCandidates = () => {
    let result = candidates;

    // Filter by Round
    if (filterRound !== "all") {
      if (filterRound === "applied") {
        result = result.filter((c) => c.status === "applied");
      } else if (filterRound === "selected") {
        result = result.filter((c) => c.status === "placed");
      } else {
        result = result.filter(
          (c) =>
            c.current_round_id === filterRound && c.status === "shortlisted",
        );
      }
    }

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.student?.first_name?.toLowerCase().includes(lowerQuery) ||
          c.student?.last_name?.toLowerCase().includes(lowerQuery) ||
          c.student?.student_id?.toLowerCase().includes(lowerQuery),
      );
    }

    setFilteredCandidates(result);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (appId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedIds(newSelected);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split(/\r?\n/);
      const importedIds = new Set();
      let matchCount = 0;

      // Assume simple one-column CSV of IDs, or search for ID in each row
      rows.forEach((row) => {
        const cleanRow = row.trim().toLowerCase();
        if (cleanRow) {
          // Find candidate with matching student_id
          // Checking exact match or if the row contains the ID
          const match = candidates.find(
            (c) =>
              c.student?.student_id?.toLowerCase() === cleanRow ||
              cleanRow.includes(c.student?.student_id?.toLowerCase()),
          );
          if (match) {
            importedIds.add(match.id);
            matchCount++;
          }
        }
      });

      setSelectedIds(importedIds);
      toast.success(`Found and selected ${matchCount} candidates from CSV`);

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const getNextRoundId = () => {
    if (!currentDrive?.rounds) return null;

    // Logic to determine "Next Round"
    // If filtering by "Applied", next is Round 1.
    // If filtering by Round N, next is Round N+1.

    const sortedRounds = [...currentDrive.rounds].sort(
      (a, b) => a.round_number - b.round_number,
    );

    if (filterRound === "all" || filterRound === "applied") {
      return sortedRounds[0]?.id;
    }

    const currentIndex = sortedRounds.findIndex((r) => r.id === filterRound);
    if (currentIndex !== -1 && currentIndex < sortedRounds.length - 1) {
      return sortedRounds[currentIndex + 1].id;
    }

    return "selected"; // End of rounds
  };

  const handleBulkMove = async () => {
    if (selectedIds.size === 0) return;

    const nextRoundId = getNextRoundId();
    let status = "shortlisted";
    let apiRoundId = nextRoundId;

    if (nextRoundId === "selected") {
      status = "placed";
      apiRoundId = null; // Or keep last round ID depending on backend logic? usually null for placed or last round.
      // let's assume 'placed' status implies final selection.
    }

    // Confirmation
    if (!window.confirm(`Move ${selectedIds.size} candidates to next stage?`))
      return;

    try {
      await api.put("/placement/applications/bulk/status", {
        applicationIds: Array.from(selectedIds),
        status: status,
        roundId: apiRoundId,
      });
      toast.success("Candidates moved successfully");
      fetchCandidates();
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to move candidates");
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Reject ${selectedIds.size} candidates?`)) return;

    try {
      await api.put("/placement/applications/bulk/status", {
        applicationIds: Array.from(selectedIds),
        status: "rejected",
      });
      toast.success("Candidates rejected");
      fetchCandidates();
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to reject candidates");
    }
  };

  const rounds = [
    { id: "all", round_name: "All Candidates" },
    { id: "applied", round_name: "Applied / Pending" },
    ...(currentDrive?.rounds
      ? [...currentDrive.rounds].sort((a, b) => a.round_number - b.round_number)
      : []),
    { id: "selected", round_name: "Final Selections" },
  ];

  const isEmbedded = !!propDriveId;
  const nextTargetRoundId = getNextRoundId();
  const nextTargetRoundName =
    nextTargetRoundId === "selected"
      ? "Final Selection"
      : rounds.find((r) => r.id === nextTargetRoundId)?.round_name ||
        "Next Round";

  return (
    <div
      className={`flex flex-col ${isEmbedded ? "" : "min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-24"}`}
    >
      {!isEmbedded && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 mb-6">
          <PlacementBreadcrumbs
            items={[
              { label: "Drives", href: "/placement/drives" },
              {
                label: currentDrive?.drive_name || "Drive",
                href: `/placement/drives/${id}`,
              },
              { label: "Applicants" },
            ]}
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Applicants Pipeline
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {candidates.length} students participating in{" "}
                {currentDrive?.drive_name}
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                ref={fileInputRef}
                onChange={handleCSVImport}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-300"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Import CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={isEmbedded ? "" : "max-w-7xl mx-auto w-full px-6"}>
        {/* Round Navigator - Stepper Style */}
        <div className="mb-8 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-center min-w-max p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            {rounds.map((round, idx) => {
              const isActive = filterRound === round.id;
              return (
                <React.Fragment key={round.id}>
                  <button
                    onClick={() => setFilterRound(round.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all relative ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-bold"
                        : "text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isActive
                          ? "bg-white/20"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span>{round.round_name}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                  {idx < rounds.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-1" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Table/List View */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-5 w-12">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                        checked={
                          filteredCandidates.length > 0 &&
                          selectedIds.size === filteredCandidates.length
                        }
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                    Student Information
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">
                    Department
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                    Pipeline Status
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                    Stage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className={`group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-all duration-200 ${
                      selectedIds.has(candidate.id)
                        ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                        checked={selectedIds.has(candidate.id)}
                        onChange={() => handleSelectOne(candidate.id)}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-base shadow-sm group-hover:scale-110 transition-transform">
                          {candidate.student?.first_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white leading-tight">
                            {candidate.student?.first_name}{" "}
                            {candidate.student?.last_name}
                          </div>
                          <div className="text-xs font-bold text-gray-400 mt-0.5">
                            {candidate.student?.student_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        {candidate.student?.department?.name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2
                        ${
                          candidate.status === "placed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900"
                            : candidate.status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:border-red-900"
                              : candidate.status === "shortlisted"
                                ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900"
                                : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                        }
                      `}
                      >
                        {candidate.status === "placed" && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {candidate.status === "rejected" && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl inline-block">
                        {rounds.find((r) => r.id === candidate.current_round_id)
                          ?.round_name || "Applied"}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-bold">
                        No candidates match your filters
                      </p>
                      <button
                        onClick={() => {
                          setFilterRound("all");
                          setSearchQuery("");
                        }}
                        className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                      >
                        Reset all filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Action Bar - Only shown when selection exists */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-gray-900 dark:bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-gray-800 dark:border-indigo-500 backdrop-blur-md">
            <div className="flex items-center gap-4 pl-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black">
                {selectedIds.size}
              </div>
              <p className="font-bold text-sm tracking-tight hidden sm:block">
                Students Selected
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBulkReject}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-black transition-all"
              >
                Reject
              </button>
              {nextTargetRoundId && (
                <button
                  onClick={handleBulkMove}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 dark:text-indigo-600 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all shadow-lg"
                >
                  Move to {nextTargetRoundName}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionPipeline;
