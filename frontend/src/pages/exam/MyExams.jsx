import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  ChevronRight,
  Info,
  Layers,
  Award,
} from "lucide-react";
import { fetchMyExamSchedules } from "../../store/slices/examSlice";

const MyExams = () => {
  const dispatch = useDispatch();
  const { schedules, status } = useSelector((state) => state.exam);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyExamSchedules());
  }, [dispatch]);

  // Group schedules by cycle
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const cycleId = schedule.cycle?.id || schedule.exam_cycle_id;
    if (!acc[cycleId]) {
      acc[cycleId] = {
        name: schedule.cycle?.name || "Exam Cycle",
        type: schedule.cycle?.cycle_type,
        instance: schedule.cycle?.instance_number,
        components: schedule.cycle?.component_breakdown || [],
        max_marks: schedule.cycle?.max_marks,
        passing_marks: schedule.cycle?.passing_marks,
        schedules: [],
      };
    }
    acc[cycleId].schedules.push(schedule);
    return acc;
  }, {});

  return (
    <div className="space-y-8 text-gray-900 dark:text-white max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-display text-indigo-900 dark:text-indigo-100">
              My Examinations
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium font-inter">
              View your upcoming exam schedules and subject details
            </p>
          </div>
        </div>
      </header>

      {status === "loading" ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-bold text-gray-400">
            Loading your schedules...
          </p>
        </div>
      ) : Object.keys(groupedSchedules).length > 0 ? (
        Object.entries(groupedSchedules).map(([cycleId, cycleInfo]) => (
          <div key={cycleId} className="space-y-6">
            {/* Cycle Header & Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full translate-x-20 -translate-y-20 blur-3xl opacity-50"></div>

              <div className="relative z-10 flex items-center gap-5">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                    {cycleInfo.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black rounded-full uppercase tracking-wider">
                      {cycleInfo.type?.replace("_", " ")}
                    </span>
                    {cycleInfo.instance && (
                      <span className="text-[10px] px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-black rounded-full uppercase tracking-wider">
                        Instance {cycleInfo.instance}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end gap-4 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 rounded-2xl text-center shadow-lg shadow-indigo-500/20 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest leading-none mb-1">
                      Total Marks
                    </p>
                    <p className="text-3xl font-black text-white">
                      {cycleInfo.max_marks || 100}
                    </p>
                  </div>

                  {/* Integrated Component Breakdown Cards */}
                  {cycleInfo.components && cycleInfo.components.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cycleInfo.components.map((comp, idx) => (
                        <div
                          key={idx}
                          className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center border border-gray-100 dark:border-gray-700 group hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
                        >
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                            {comp.name}
                          </p>
                          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            {comp.max_marks}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cycleInfo.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          Subject Code
                        </div>
                        <div className="text-xs font-black text-indigo-600">
                          {schedule.course?.code}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg leading-tight mb-4 min-h-[3rem]">
                      {schedule.course?.name}
                    </h3>

                    <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-700">
                      <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-3 text-indigo-500" />
                        {new Date(schedule.exam_date).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 mr-3 text-indigo-500" />
                        {schedule.start_time.substring(0, 5)} -{" "}
                        {schedule.end_time.substring(0, 5)}
                      </div>
                      {schedule.venue && (
                        <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-3 text-indigo-500" />
                          {schedule.venue}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        Preparation Mode
                      </span>
                    </div>
                    <Info className="w-4 h-4 text-indigo-400 cursor-help" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border border-gray-100 dark:border-gray-700">
          <Calendar className="w-20 h-20 mx-auto text-gray-100 dark:text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold mb-2">No Exam Schedules</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any upcoming examinations scheduled at the moment.
            Take this time to focus on your regular studies!
          </p>
        </div>
      )}
    </div>
  );
};

export default MyExams;
