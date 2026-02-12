import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExamCycles,
  fetchRegistrationStatus,
  fetchMyExamSchedules,
} from "../../store/slices/examSlice";
import {
  Calendar,
  Download,
  ShieldAlert,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
  Printer,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const MyHallTicket = () => {
  const dispatch = useDispatch();
  const { cycles, currentRegistration, schedules, status } = useSelector(
    (state) => state.exam,
  );
  const { user } = useSelector((state) => state.auth);
  const [selectedCycleId, setSelectedCycleId] = useState("");

  useEffect(() => {
    dispatch(fetchExamCycles());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCycleId) {
      dispatch(fetchRegistrationStatus(selectedCycleId));
      dispatch(fetchMyExamSchedules()); // Fetches all for current sem/enrolled
    }
  }, [dispatch, selectedCycleId]);

  const activeCycles = cycles.filter((c) => {
    const today = new Date();
    return (
      today >= new Date(c.start_date) &&
      today <= new Date(c.end_date).setDate(new Date(c.end_date).getDate() + 30)
    );
  });

  const handleDownload = () => {
    const accessToken = localStorage.getItem("accessToken");
    const downloadUrl = `${import.meta.env.VITE_API_URL}/exam/registration/${selectedCycleId}/download-hall-ticket?token=${accessToken}`;
    window.location.href = downloadUrl;
  };

  const isEligible =
    currentRegistration &&
    currentRegistration.status !== "blocked" &&
    (currentRegistration.fee_status === "paid" ||
      currentRegistration.override_status) &&
    (currentRegistration.attendance_status === "clear" ||
      currentRegistration.is_condoned ||
      currentRegistration.override_status);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Printer className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
              Exam Hall Ticket
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Verify your eligibility and download your hall ticket
            </p>
          </div>
        </div>

        <select
          value={selectedCycleId}
          onChange={(e) => setSelectedCycleId(e.target.value)}
          className="bg-white dark:bg-gray-800 border-none rounded-2xl text-sm font-black px-6 py-3 shadow-sm focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">Select Exam Cycle</option>
          {activeCycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </header>

      {!selectedCycleId ? (
        <div className="bg-white dark:bg-gray-800 p-20 text-center rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-100 dark:text-gray-700 mb-6" />
          <h2 className="text-xl font-black mb-2 italic text-gray-400">
            Please select an exam cycle
          </h2>
        </div>
      ) : status === "loading" ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="font-bold text-gray-400">Verifying eligibility...</p>
        </div>
      ) : !currentRegistration ? (
        <div className="bg-white dark:bg-gray-800 p-20 text-center rounded-[3rem] border border-gray-100 dark:border-gray-700">
          <Lock className="w-16 h-16 mx-auto text-orange-200 dark:text-orange-900/30 mb-6" />
          <h2 className="text-xl font-black mb-2">Registration Not Found</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            You haven't registered for this exam cycle yet. Registration is
            mandatory to generate a hall ticket.
          </p>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20">
            Go to Registration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Eligibility Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black mb-6">Eligibility Dashboard</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-gray-700/30">
                  {currentRegistration.fee_status === "paid" ||
                  currentRegistration.override_status ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400 leading-none mb-1 tracking-tighter">
                      Financials
                    </p>
                    <p
                      className={`font-black uppercase text-sm ${currentRegistration.fee_status === "paid" ? "text-green-600" : "text-red-500"}`}
                    >
                      {currentRegistration.fee_status === "paid"
                        ? "Fee Cleared"
                        : "Pending Dues"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-gray-700/30">
                  {currentRegistration.attendance_status === "clear" ||
                  currentRegistration.is_condoned ||
                  currentRegistration.override_status ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400 leading-none mb-1 tracking-tighter">
                      Attendance
                    </p>
                    <p
                      className={`font-black uppercase text-sm ${currentRegistration.attendance_status === "clear" || currentRegistration.is_condoned ? "text-green-600" : "text-red-500"}`}
                    >
                      {currentRegistration.is_condoned
                        ? "Condoned"
                        : currentRegistration.attendance_status === "low"
                          ? "Insufficient"
                          : "Satisfactory"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                      Status: {currentRegistration.attendance_percentage}%
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 dark:border-gray-700">
                  <p className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6">
                    Hall Ticket Status
                  </p>
                  <div
                    className={`flex flex-col items-center justify-center p-10 rounded-[2rem] border-2 border-dashed ${isEligible ? "border-green-200 bg-green-50/50 dark:bg-green-900/10" : "border-red-200 bg-red-50/50 dark:bg-red-900/10"}`}
                  >
                    {isEligible ? (
                      <>
                        <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 mb-4 animate-bounce">
                          <Download className="w-8 h-8" />
                        </div>
                        <p className="text-green-700 dark:text-green-400 font-black uppercase text-sm tracking-wide">
                          Ready
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                          <Lock className="w-8 h-8" />
                        </div>
                        <p className="text-red-700 dark:text-red-400 font-black uppercase text-sm tracking-wide">
                          Locked
                        </p>
                      </>
                    )}
                  </div>

                  {isEligible && (
                    <button
                      onClick={handleDownload}
                      className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!isEligible && (
              <div className="bg-red-600 text-white rounded-[2rem] p-8 shadow-xl shadow-red-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="w-6 h-6" />
                  <h4 className="font-black uppercase tracking-widest">
                    Ineligible
                  </h4>
                </div>
                <p className="text-sm font-medium text-red-100 leading-relaxed">
                  {currentRegistration.override_remarks ||
                    "Your hall ticket is currently blocked due to pending requirements. Please contact the administrative office or your HOD for clarification."}
                </p>
              </div>
            )}
          </div>

          {/* Hall Ticket Preview */}
          <div className="lg:col-span-8">
            {isEligible ? (
              <div
                id="hall-ticket-preview"
                className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:p-0"
              >
                {/* University Header */}
                <div className="bg-indigo-900 dark:bg-indigo-950 p-12 text-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600/10 mix-blend-overlay"></div>
                  <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">
                    UniPilot Technical University
                  </h2>
                  <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                    Examination Hall Ticket
                  </p>
                  <div className="mt-8 flex justify-between items-end border-t border-indigo-800 pt-8">
                    <div className="text-left">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">
                        Exam Cycle
                      </p>
                      <p className="font-black text-lg">
                        {cycles.find((c) => c.id === selectedCycleId)?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">
                        Candidate Roll No.
                      </p>
                      <p className="font-black text-lg">
                        {user.id?.substring(0, 10).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Details */}
                <div className="p-12 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-2">
                        Student Name
                      </p>
                      <p className="font-black text-gray-900 dark:text-white uppercase">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-2">
                        Batch Year
                      </p>
                      <p className="font-black text-gray-900 dark:text-white">
                        {user.batch_year}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-2">
                        Semester
                      </p>
                      <p className="font-black text-gray-900 dark:text-white">
                        {user.current_semester}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-2">
                        Program
                      </p>
                      <p className="font-black text-gray-900 dark:text-white uppercase">
                        B.Tech - {user.section}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registered Schedules */}
                <div className="p-12">
                  <h4 className="flex items-center text-lg font-black mb-6">
                    <BookOpen className="w-5 h-5 mr-3 text-indigo-600" />
                    Examination Schedule
                  </h4>
                  <div className="space-y-4">
                    {schedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <h5 className="font-black text-gray-900 dark:text-white leading-tight">
                              {schedule.course?.name}
                            </h5>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {schedule.course?.code}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-wrap gap-4 md:gap-8">
                          <div>
                            <div className="flex items-center text-xs font-black text-gray-900 dark:text-white">
                              <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              {new Date(
                                schedule.exam_date,
                              ).toLocaleDateString()}
                            </div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-5.5 mt-0.5">
                              Date
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center text-xs font-black text-gray-900 dark:text-white">
                              <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              {schedule.start_time.substring(0, 5)} -{" "}
                              {schedule.end_time.substring(0, 5)}
                            </div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-5.5 mt-0.5">
                              Session
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center text-xs font-black text-gray-900 dark:text-white">
                              <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              {schedule.venue || "Exam Center"}
                            </div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-5.5 mt-0.5">
                              Venue
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-12 py-8 bg-gray-50 dark:bg-gray-900/20 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center text-[10px] font-bold text-gray-400">
                  <p>GENERATE DATE: {new Date().toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="uppercase tracking-widest">
                      Digitally Verified by Examination Cell
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-20 text-center border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">
                  Preview Restricted
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                  The digital hall ticket preview is generated only after full
                  eligibility verification. Please check your financial and
                  attendance status on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHallTicket;
