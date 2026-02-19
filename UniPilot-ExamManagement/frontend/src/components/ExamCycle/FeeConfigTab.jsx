import { useState, useEffect } from "react";
import {
  getFeeConfigByCycle,
  createFeeConfig,
  updateFeeConfig,
  addLatFeeSlab,
  updateLatFeeSlab,
  deleteLatFeeSlab,
  calculateFee,
} from "../../services/examCycleService.js";

export default function FeeConfigTab({ cycleId }) {
  const [feeConfig, setFeeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [feePreview, setFeePreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    base_fee: "",
    regular_start_date: "",
    regular_end_date: "",
    final_registration_date: "",
  });

  // New slab form
  const [newSlab, setNewSlab] = useState({
    start_date: "",
    end_date: "",
    fine_amount: "",
  });

  const [showAddSlab, setShowAddSlab] = useState(false);

  useEffect(() => {
    loadFeeConfig();
  }, [cycleId]);

  const loadFeeConfig = async () => {
    setLoading(true);
    try {
      const response = await getFeeConfigByCycle(cycleId);
      setFeeConfig(response.data.data);
      setFormData({
        base_fee: response.data.data.base_fee,
        regular_start_date: response.data.data.regular_start_date,
        regular_end_date: response.data.data.regular_end_date,
        final_registration_date: response.data.data.final_registration_date,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // No fee config yet
        setFeeConfig(null);
        setEditing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    const { regular_start_date, regular_end_date, final_registration_date } =
      formData;

    if (new Date(regular_start_date) > new Date(regular_end_date)) {
      alert("Regular start date cannot be after regular end date");
      setLoading(false);
      return;
    }
    if (new Date(regular_end_date) > new Date(final_registration_date)) {
      alert("Regular end date cannot be after final registration date");
      setLoading(false);
      return;
    }

    try {
      if (feeConfig) {
        await updateFeeConfig(feeConfig.id, formData);
      } else {
        await createFeeConfig(cycleId, { ...formData, slabs: [] });
      }
      await loadFeeConfig();
      setEditing(false);
    } catch (err) {
      alert(
        "Failed to save fee configuration: " +
        (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlab = async (e) => {
    e.preventDefault();
    const { start_date, end_date } = newSlab;
    if (new Date(start_date) > new Date(end_date)) {
      alert("Start date cannot be after end date for late fee slabs");
      setLoading(false);
      return;
    }

    try {
      await addLatFeeSlab(feeConfig.id, newSlab);
      await loadFeeConfig();
      setNewSlab({ start_date: "", end_date: "", fine_amount: "" });
      setShowAddSlab(false);
    } catch (err) {
      alert("Failed to add late fee slab");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlab = async (slabId) => {
    if (!confirm("Delete this late fee slab?")) return;

    try {
      await deleteLatFeeSlab(slabId);
      await loadFeeConfig();
    } catch (err) {
      alert("Failed to delete slab");
    }
  };

  const handleCalculateFee = async () => {
    try {
      const response = await calculateFee(cycleId);
      setFeePreview(response.data.data);
    } catch (err) {
      alert("Failed to calculate fee");
    }
  };

  if (loading && !feeConfig) {
    return (
      <div className="text-center py-16 px-8 text-slate-500 font-medium">
        Loading fee configuration...
      </div>
    );
  }

  if (!feeConfig && !editing) {
    return (
      <div className="text-center py-16 px-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="text-[4rem] mb-4">💰</div>
        <h3 className="text-[1.5rem] text-slate-900 mb-2 font-bold">
          No Fee Configuration
        </h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Set up the exam fee and late fee slabs to enable registrations for this
          cycle.
        </p>
        <button
          onClick={() => setEditing(true)}
          className="p-3 px-8 rounded-xl font-bold text-base cursor-pointer transition-all border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
        >
          Configure Fee Now
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {editing ? (
        <form
          onSubmit={handleCreateOrUpdate}
          className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 shadow-sm"
        >
          <h3 className="m-0 mb-6 text-xl text-slate-900 font-extrabold flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              {feeConfig ? "📝" : "✨"}
            </span>
            {feeConfig ? "Edit Fee Configuration" : "Create Fee Configuration"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider">
                Base Exam Fee (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                className="p-3 px-4 border-2 border-slate-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white"
                value={formData.base_fee}
                onChange={(e) =>
                  setFormData({ ...formData, base_fee: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider">
                Regular Start Date *
              </label>
              <input
                type="date"
                className="p-3 px-4 border-2 border-slate-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white"
                value={formData.regular_start_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regular_start_date: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider">
                Regular End Date *
              </label>
              <input
                type="date"
                className="p-3 px-4 border-2 border-slate-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white"
                value={formData.regular_end_date}
                onChange={(e) =>
                  setFormData({ ...formData, regular_end_date: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider">
                Final Registration Date *
              </label>
              <input
                type="date"
                className="p-3 px-4 border-2 border-slate-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white"
                value={formData.final_registration_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    final_registration_date: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            {feeConfig && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-3 px-6 rounded-xl font-bold text-sm bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all hover:border-slate-300"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="p-3 px-8 rounded-xl font-bold text-sm transition-all border-none bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : feeConfig
                  ? "Update Configuration"
                  : "Create Configuration"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100">
              <h3 className="m-0 text-xl text-slate-900 font-extrabold flex items-center gap-2">
                <span className="text-2xl">💰</span> Fee Configuration
              </h3>
              <button
                onClick={() => setEditing(true)}
                className="p-2 px-4 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-wider"
              >
                Edit Configuration
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Base Fee
                </span>
                <span className="text-xl font-black text-indigo-700">
                  ₹{feeConfig.base_fee}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Regular Period
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  {new Date(feeConfig.regular_start_date).toLocaleDateString()}{" "}
                  - {new Date(feeConfig.regular_end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  Registration Deadline
                </span>
                <span className="text-sm font-bold text-amber-700">
                  {new Date(
                    feeConfig.final_registration_date,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="m-0 text-lg text-slate-900 font-extrabold flex items-center gap-2">
                <span className="text-xl">📅</span> Late Fee Slabs
              </h3>
              <button
                onClick={() => setShowAddSlab(!showAddSlab)}
                className={`p-2 px-4 rounded-lg font-bold text-xs transition-all border uppercase tracking-wider ${showAddSlab
                  ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                  : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                  }`}
              >
                {showAddSlab ? "Cancel" : "+ Add Slab"}
              </button>
            </div>

            {showAddSlab && (
              <form
                onSubmit={handleAddSlab}
                className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-600 mb-2 text-xs uppercase tracking-wide">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className="p-3 px-4 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all bg-white"
                      value={newSlab.start_date}
                      onChange={(e) =>
                        setNewSlab({ ...newSlab, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-600 mb-2 text-xs uppercase tracking-wide">
                      End Date *
                    </label>
                    <input
                      type="date"
                      className="p-3 px-4 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all bg-white"
                      value={newSlab.end_date}
                      onChange={(e) =>
                        setNewSlab({ ...newSlab, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-600 mb-2 text-xs uppercase tracking-wide">
                      Fine Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="p-3 px-4 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all bg-white"
                      value={newSlab.fine_amount}
                      onChange={(e) =>
                        setNewSlab({ ...newSlab, fine_amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="p-3 px-8 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
                    disabled={loading}
                  >
                    Add Slab
                  </button>
                </div>
              </form>
            )}

            {feeConfig.slabs && feeConfig.slabs.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="p-4 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="p-4 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Fine Amount
                      </th>
                      <th className="p-4 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feeConfig.slabs.map((slab) => (
                      <tr
                        key={slab.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 text-sm font-medium text-slate-700">
                          {new Date(slab.start_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-700">
                          {new Date(slab.end_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-bold text-indigo-600">
                          ₹{slab.fine_amount}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteSlab(slab.id)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-sm">
                No late fee slabs configured for this cycle.
              </div>
            )}
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-[10rem] pointer-events-none">
              💸
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="m-0 text-xl text-white font-black flex items-center gap-3">
                  <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    🔍
                  </span>{" "}
                  Fee Preview
                </h3>
                <button
                  onClick={handleCalculateFee}
                  className="p-3 px-6 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-indigo-50 transition-all uppercase tracking-widest shadow-xl shadow-white/5"
                >
                  Calculate Now
                </button>
              </div>

              {feePreview && (
                <div
                  className={`mt-6 p-6 rounded-2xl border-2 transition-all duration-500 ${feePreview.blocked
                    ? "bg-rose-500/10 border-rose-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
                      <span>Base Examination Fee:</span>
                      <span className="text-white font-bold">
                        ₹{feePreview.base_fee}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-sm font-medium">
                      <span>Late Registration Penalty:</span>
                      <span
                        className={`font-bold ${feePreview.late_fine > 0 ? "text-amber-400" : "text-emerald-400"}`}
                      >
                        ₹{feePreview.late_fine}
                      </span>
                    </div>
                    <div className="pt-4 mt-2 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-slate-100 font-bold text-lg">
                        Total Payable:
                      </span>
                      <span className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        ₹{feePreview.total}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">
                    {feePreview.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
