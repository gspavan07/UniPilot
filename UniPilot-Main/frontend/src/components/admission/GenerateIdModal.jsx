import React, { useState, useEffect } from "react";
import {
  X,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const GenerateIdModal = ({
  isOpen,
  onClose,
  onSuccess,
  departmentList,
  programList,
}) => {
  const [step, setStep] = useState(1); // 1: Select, 2: Preview
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Form State
  const [selectedBatch, setSelectedBatch] = useState(new Date().getFullYear());
  const [selectedProgram, setSelectedProgram] = useState("");
  const [startSequence, setStartSequence] = useState(""); // Optional override

  const handlePreview = async () => {
    if (!selectedProgram) {
      toast.error("Please select a program");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/admission/ids/preview", {
        batch_year: selectedBatch,
        program_id: selectedProgram,
        start_sequence: startSequence || undefined,
      });
      setPreviewData(res.data.data);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setLoading(true);
    try {
      await api.post("/admission/ids/commit", {
        batch_year: selectedBatch,
        program_id: selectedProgram,
        students: previewData.preview,
      });
      toast.success("IDs generated successfully!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error("Failed to commit changes");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPreviewData(null);
    setSelectedProgram("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
              <Wand2 className="w-6 h-6 mr-2 text-primary-600" />
              Generate Permanent IDs
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1
                ? "Select batch and program to assign Roll Numbers"
                : "Review and approve the proposed ID changes"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition-all text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4 flex items-start">
                <ShieldAlert className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-bold mb-1">Important Note</p>
                  <p>
                    This action will replace temporary IDs (e.g., TM-...) with
                    permanent Roll Numbers for all students in the selected
                    program who confirm their admission.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Batch Year
                  </label>
                  <input
                    type="number"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Start Sequence (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={startSequence}
                    onChange={(e) => setStartSequence(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Program / Branch
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold appearance-none"
                >
                  <option value="">Select Program to Generate...</option>
                  {programList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && previewData && (
            <div className="space-y-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Ready to Generate
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {previewData.count} Students
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Next Sequence
                  </p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {previewData.next_sequence}
                  </p>
                </div>
              </div>

              <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Old ID (Temp)</th>
                      <th className="px-4 py-3"></th>
                      <th className="px-4 py-3 text-emerald-600">
                        New ID (Perm)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {previewData.preview.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {item.current_id || "---"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-emerald-600">
                          {item.new_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.preview.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No matching students found with Temporary IDs.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          {step === 1 ? (
            <button
              onClick={handlePreview}
              disabled={loading || !selectedProgram}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-lg shadow-primary-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <span>Preview Generation</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-all font-bold text-sm"
              >
                Back
              </button>
              <button
                onClick={handleCommit}
                disabled={loading || previewData?.preview?.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50 flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Approve & Generate</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateIdModal;
