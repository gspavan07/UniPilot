import React from "react";
import {
  Plus,
  Trash2,
  Clock,
  MapPin,
  Globe,
  Building,
  CheckCircle2,
} from "lucide-react";

const RoundsSetup = ({ rounds, onChange }) => {
  const addRound = () => {
    const nextRoundNumber = rounds.length + 1;
    const newRound = {
      id: Date.now(),
      round_number: nextRoundNumber,
      round_name: `Round ${nextRoundNumber}`,
      round_type: "Aptitude Test",
      mode: "online",
      venue_type: "online", // online, college, office
      round_date: "",
      round_time: "",
      venue: "",
      is_eliminatory: true,
    };
    onChange([...rounds, newRound]);
  };

  const removeRound = (id) => {
    onChange(rounds.filter((r) => r.id !== id));
  };

  const updateRound = (id, updates) => {
    onChange(
      rounds.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          // Sync backend 'mode' based on UI 'venue_type'
          if (updates.venue_type) {
            updated.mode =
              updates.venue_type === "online" ? "online" : "offline";
          }
          return updated;
        }
        return r;
      }),
    );
  };

  const roundTypes = [
    "Aptitude Test",
    "Technical Test",
    "Group Discussion",
    "Technical Interview",
    "Managerial Interview",
    "HR Interview",
    "Final Selection",
  ];

  const venueTypes = [
    { id: "online", label: "Online / Virtual", icon: Globe },
    { id: "college", label: "College Campus", icon: Building },
    { id: "office", label: "Company Office", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
            Selection Rounds
          </h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            Configure the sequence of recruitment stages
          </p>
        </div>
        <button
          type="button"
          onClick={addRound}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Add Stage
        </button>
      </div>

      <div className="space-y-4">
        {rounds.map((round, index) => (
          <div
            key={round.id}
            className="group p-6 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-3xl relative hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Round Number Indicator */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {index + 1}
                </div>
              </div>

              {/* Round Content */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Round Name / Stage Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="e.g. Initial Shortlisting"
                      value={round.round_name}
                      onChange={(e) =>
                        updateRound(round.id, { round_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Stage Type
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                      value={round.round_type}
                      onChange={(e) =>
                        updateRound(round.id, { round_type: e.target.value })
                      }
                    >
                      {roundTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Venue Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                    Where will this be conducted?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {venueTypes.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          updateRound(round.id, { venue_type: v.id })
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          round.venue_type === v.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        <v.icon
                          className={`w-4 h-4 ${round.venue_type === v.id ? "text-white" : "text-gray-400"}`}
                        />
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={round.round_date}
                      onChange={(e) =>
                        updateRound(round.id, { round_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={round.round_time}
                      onChange={(e) =>
                        updateRound(round.id, { round_time: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Specific Venue / Link
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder={
                        round.venue_type === "online"
                          ? "Meeting URL"
                          : "Room No / Floor"
                      }
                      value={round.venue}
                      onChange={(e) =>
                        updateRound(round.id, { venue: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500 transition-all"
                      checked={round.is_eliminatory}
                      onChange={(e) =>
                        updateRound(round.id, {
                          is_eliminatory: e.target.checked,
                        })
                      }
                    />
                    <div className="ml-3">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        Elimination Round
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Students not selected here will be blocked from next
                        rounds
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeRound(round.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Stage
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {rounds.length === 0 && (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h4 className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No rounds configured
            </h4>
            <p className="text-gray-400 text-xs mt-1">
              Add stages like Aptitude Test, Interviews, etc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundsSetup;
