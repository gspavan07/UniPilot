import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  Plus,
  User,
  BookOpen,
  MapPin,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MousePointer2,
} from "lucide-react";
import {
  findTimetable,
  createTimetable,
  addSlot,
  clearCurrentTimetable,
} from "../../store/slices/timetableSlice";
import { fetchPrograms } from "../../store/slices/programSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import api from "../../utils/api";

const TimetableManager = () => {
  const dispatch = useDispatch();
  const { currentTimetable, status, error } = useSelector(
    (state) => state.timetable
  );
  const { departments } = useSelector((state) => state.departments);
  const { programs: allPrograms } = useSelector((state) => state.programs);

  // Search Criteria
  const [criteria, setCriteria] = useState({
    department_id: "",
    program_id: "",
    semester: 1,
    academic_year: "2025-2026",
    section: "A",
  });

  // Local state for new slot
  const [slotForm, setSlotForm] = useState({
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "10:30",
    course_id: "",
    faculty_id: "",
    room_number: "",
  });

  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    api.get("/users?role=faculty").then((res) => setFaculty(res.data.data));
  }, [dispatch]);

  // Filter programs by department
  const filteredPrograms = allPrograms.filter(
    (p) => p.department_id === criteria.department_id
  );

  // Fetch courses when program/semester changes
  useEffect(() => {
    if (criteria.program_id) {
      api
        .get(
          `/courses?program_id=${criteria.program_id}&semester=${criteria.semester}`
        )
        .then((res) => setCourses(res.data.data));
    }
  }, [criteria.program_id, criteria.semester]);

  const handleSearch = () => {
    if (!criteria.program_id || !criteria.semester || !criteria.academic_year)
      return;
    dispatch(findTimetable(criteria));
  };

  const handleCreateNew = () => {
    dispatch(createTimetable(criteria));
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!currentTimetable) return;

    dispatch(addSlot({ ...slotForm, timetable_id: currentTimetable.id })).then(
      (res) => {
        if (!res.error) {
          // Reset form basics
          setSlotForm((prev) => ({
            ...prev,
            course_id: "",
            faculty_id: "",
            room_number: "",
          }));
        }
      }
    );
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto text-gray-900 dark:text-white">
      {/* Header & Criteria Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Schedule Planner</h1>
              <p className="text-xs text-gray-500">
                Configure university-wide timetables
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-grow max-w-4xl">
            <select
              className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={criteria.department_id}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  department_id: e.target.value,
                  program_id: "",
                })
              }
            >
              <option value="">Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={criteria.program_id}
              onChange={(e) =>
                setCriteria({ ...criteria, program_id: e.target.value })
              }
              disabled={!criteria.department_id}
            >
              <option value="">Program</option>
              {filteredPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code}
                </option>
              ))}
            </select>

            <select
              className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={criteria.semester}
              onChange={(e) =>
                setCriteria({ ...criteria, semester: e.target.value })
              }
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>

            <select
              className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={criteria.section}
              onChange={(e) =>
                setCriteria({ ...criteria, section: e.target.value })
              }
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>

            <button
              onClick={handleSearch}
              className="btn btn-primary flex items-center justify-center py-2.5"
            >
              <Search className="w-4 h-4 mr-2" /> Load
            </button>
          </div>
        </div>
      </div>

      {status === "loading" && (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Retrieving schedule data...</p>
        </div>
      )}

      {status === "failed" && !currentTimetable && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl text-center border-2 border-dashed border-gray-100 dark:border-gray-700 max-w-2xl mx-auto shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Schedule Found</h2>
          <p className="text-gray-500 mb-8 px-10">
            There is no active timetable for {criteria.academic_year}, Semester{" "}
            {criteria.semester} (Section {criteria.section}). Would you like to
            create one now?
          </p>
          <button
            onClick={handleCreateNew}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
          >
            Create Base Timetable
          </button>
        </div>
      )}

      {currentTimetable && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up">
          {/* Sidebar: Add Slot */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-6 flex items-center text-lg">
                <Plus className="w-5 h-5 mr-2 text-indigo-500" /> New Class Slot
              </h3>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Day
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    value={slotForm.day_of_week}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, day_of_week: e.target.value })
                    }
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Start
                    </label>
                    <input
                      type="time"
                      value={slotForm.start_time}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, start_time: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      End
                    </label>
                    <input
                      type="time"
                      value={slotForm.end_time}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, end_time: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Subject
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    value={slotForm.course_id}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, course_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Faculty
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    value={slotForm.faculty_id}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, faculty_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Instructor</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.first_name} {f.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 3, LH-101"
                    value={slotForm.room_number}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, room_number: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all mt-4"
                >
                  Authorize Slot
                </button>
              </form>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-start space-x-3 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Main Content: Weekly Grid */}
          <div className="lg:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold">Weekly Schedule Preview</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Section {currentTimetable.section} |{" "}
                  {currentTimetable.program?.name}
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                  Active System
                </span>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="min-w-[900px]">
                {/* Day Labels */}
                <div className="grid grid-cols-11 gap-4 mb-6">
                  <div className="col-span-1"></div>
                  {days.map((d) => (
                    <div
                      key={d}
                      className="col-span-2 text-center uppercase tracking-[0.2em] font-black text-[10px] text-gray-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Rows for Time Slots */}
                {times.map((time) => (
                  <div
                    key={time}
                    className="grid grid-cols-11 gap-4 mb-4 items-stretch"
                  >
                    <div className="col-span-1 flex items-center justify-end pr-4 text-[10px] font-black text-gray-300 font-mono">
                      {time}
                    </div>
                    {days.map((day) => {
                      const slot = currentTimetable.slots?.find(
                        (s) =>
                          s.day_of_week === day &&
                          s.start_time.startsWith(time.split(":")[0])
                      );

                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`col-span-2 min-h-[140px] rounded-2xl p-4 transition-all duration-300 border-2 ${
                            slot
                              ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20 shadow-sm"
                              : "bg-gray-50/30 dark:bg-gray-900/20 border-gray-50 dark:border-gray-800 border-dashed"
                          }`}
                        >
                          {slot ? (
                            <div className="h-full flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 leading-tight mb-1">
                                  {slot.course?.name}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-medium truncate italic">
                                  {slot.course?.code}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center text-[10px] text-gray-400">
                                  <User className="w-3 h-3 mr-1.5 text-indigo-400" />{" "}
                                  {slot.faculty?.name ||
                                    slot.faculty_id.slice(0, 8)}
                                </div>
                                <div className="flex items-center text-[10px] text-gray-400 font-bold">
                                  <MapPin className="w-3 h-3 mr-1.5 text-indigo-400" />{" "}
                                  {slot.room_number || "TBD"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <MousePointer2 className="w-4 h-4 text-gray-100 dark:text-gray-800" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentTimetable && status === "idle" && (
        <div className="py-24 text-center card bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto shadow-sm">
          <Calendar className="w-16 h-16 text-indigo-100 dark:text-indigo-900/30 mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Ready to Design the Week?</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
            Select a Department and Program above to begin configuring
            section-wise schedules and faculty allocations.
          </p>
          <div className="flex items-center justify-center space-x-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <CheckCircle className="w-3 h-3 text-emerald-500" />{" "}
            <span>Conflict Detection</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full mx-2"></span>
            <CheckCircle className="w-3 h-3 text-emerald-500" />{" "}
            <span>Real-time Loading</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManager;
