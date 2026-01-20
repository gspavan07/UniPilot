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
    (state) => state.timetable,
  );
  const { departments } = useSelector((state) => state.departments);
  const { programs: allPrograms } = useSelector((state) => state.programs);
  const { user } = useSelector((state) => state.auth);

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
    activity_name: "",
    is_activity: false,
    faculty_id: "",
    block_id: "",
    room_id: "",
  });

  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isSatWorking, setIsSatWorking] = useState(false);

  useEffect(() => {
    dispatch(clearCurrentTimetable());
    dispatch(fetchDepartments());
    dispatch(fetchPrograms());
    // Fetch both faculty and HODs for instructor selection
    Promise.all([
      api.get("/users?role=faculty"),
      api.get("/users?role=hod"),
      api.get("/infrastructure/blocks"),
      api.get("/settings?keys=student_saturday_working"),
    ]).then(([facultyRes, hodRes, blocksRes, settingsRes]) => {
      const allInstructors = [...facultyRes.data.data, ...hodRes.data.data];
      setFaculty(allInstructors);
      setBlocks(blocksRes.data.data || []);
      setIsSatWorking(
        settingsRes.data.data.student_saturday_working === "true",
      );
    });
  }, [dispatch]);

  // Set default department for HOD
  useEffect(() => {
    if (user?.role === "hod" && user.department_id && !criteria.department_id) {
      setCriteria((prev) => ({ ...prev, department_id: user.department_id }));
    }
  }, [user, criteria.department_id]);

  // Filter academic departments (and restrict to HOD's own dept if applicable)
  const academicDepartments = departments.filter((d) => {
    const isAcademic = d.type === "academic";
    if (user?.role === "hod") {
      return isAcademic && d.id === user.department_id;
    }
    return isAcademic;
  });

  // Filter programs by department
  const filteredPrograms = allPrograms.filter(
    (p) => p.department_id === criteria.department_id,
  );

  // Fetch courses when program/semester changes
  useEffect(() => {
    if (criteria.program_id) {
      api
        .get(
          `/courses?program_id=${criteria.program_id}&semester=${criteria.semester}`,
        )
        .then((res) => setCourses(res.data.data));
    }
  }, [criteria.program_id, criteria.semester]);

  // Fetch rooms when block changes
  useEffect(() => {
    if (slotForm.block_id) {
      api
        .get(`/infrastructure/rooms?block_id=${slotForm.block_id}`)
        .then((res) => setRooms(res.data.data || []));
    } else {
      setRooms([]);
    }
  }, [slotForm.block_id]);

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
    if (!currentTimetable || currentTimetable.id === "faculty-view") {
      alert("Please search and load a specific timetable first.");
      return;
    }

    dispatch(addSlot({ ...slotForm, timetable_id: currentTimetable.id })).then(
      (res) => {
        if (!res.error) {
          // Refresh the timetable to show the new slot
          dispatch(findTimetable(criteria));

          // Reset form basics
          setSlotForm((prev) => ({
            ...prev,
            course_id: "",
            activity_name: "",
            is_activity: false,
            faculty_id: "",
            block_id: "",
            room_id: "",
          }));
        }
      },
    );
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  if (isSatWorking) days.push("Saturday");

  // Dynamic time slots based on actual timetable data
  const generateTimeSlots = () => {
    if (
      !currentTimetable ||
      !currentTimetable.slots ||
      currentTimetable.slots.length === 0
    ) {
      // Default time slots if no timetable exists
      return [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
      ];
    }

    // Extract unique start times from existing slots
    const uniqueTimes = new Set();
    currentTimetable.slots.forEach((slot) => {
      const hour = slot.start_time.substring(0, 5); // Get HH:MM
      uniqueTimes.add(hour);
    });

    // Sort times chronologically
    return Array.from(uniqueTimes).sort();
  };

  const times = generateTimeSlots();

  // Dynamic grid columns: 1 for time + 2 for each day
  const gridCols = 1 + days.length * 2;
  const gridColsClass = `grid-cols-${gridCols}`;

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
              className="p-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              value={criteria.department_id}
              disabled={user?.role === "hod"}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  department_id: e.target.value,
                  program_id: "",
                })
              }
            >
              <option value="">Department</option>
              {academicDepartments.map((d) => (
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

                {/* Activity Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSlotForm({
                          ...slotForm,
                          is_activity: false,
                          activity_name: "",
                        })
                      }
                      className={`p-3 rounded-2xl text-sm font-bold transition-all ${
                        !slotForm.is_activity
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-600"
                      }`}
                    >
                      Course
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSlotForm({
                          ...slotForm,
                          is_activity: true,
                          course_id: "",
                        })
                      }
                      className={`p-3 rounded-2xl text-sm font-bold transition-all ${
                        slotForm.is_activity
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-600"
                      }`}
                    >
                      Activity
                    </button>
                  </div>
                </div>

                {/* Course or Activity Name */}
                {!slotForm.is_activity ? (
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
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Activity Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Coding Training, Sports, Assembly"
                      value={slotForm.activity_name}
                      onChange={(e) =>
                        setSlotForm({
                          ...slotForm,
                          activity_name: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Faculty {slotForm.is_activity && "(Optional)"}
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    value={slotForm.faculty_id}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, faculty_id: e.target.value })
                    }
                    required={!slotForm.is_activity}
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
                    Block
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    value={slotForm.block_id}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        block_id: e.target.value,
                        room_id: "",
                      })
                    }
                    required
                  >
                    <option value="">Select Block</option>
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Room
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                    value={slotForm.room_id}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, room_id: e.target.value })
                    }
                    disabled={!slotForm.block_id}
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.room_number} - {r.name || r.type} (Capacity:{" "}
                        {r.capacity})
                      </option>
                    ))}
                  </select>
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
                <div
                  className={`grid gap-4 mb-6`}
                  style={{
                    gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
                  }}
                >
                  <div></div>
                  {days.map((d) => (
                    <div
                      key={d}
                      className="text-center uppercase tracking-[0.2em] font-black text-[10px] text-gray-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Rows for Time Slots */}
                {times.map((time) => (
                  <div
                    key={time}
                    className="grid gap-4 mb-4 items-stretch"
                    style={{
                      gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
                    }}
                  >
                    <div className="flex items-center justify-end pr-4 text-[10px] font-black text-gray-300 font-mono">
                      {time}
                    </div>
                    {days.map((day) => {
                      const slot = currentTimetable.slots?.find(
                        (s) =>
                          s.day_of_week === day &&
                          s.start_time.startsWith(time.split(":")[0]),
                      );

                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`min-h-[140px] rounded-2xl p-4 transition-all duration-300 border-2 ${
                            slot
                              ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20 shadow-sm"
                              : "bg-gray-50/30 dark:bg-gray-900/20 border-gray-50 dark:border-gray-800 border-dashed"
                          }`}
                        >
                          {slot ? (
                            <div className="h-full flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 leading-tight mb-1">
                                  {slot.activity_name || slot.course?.name}
                                </h4>
                                {slot.course?.code && (
                                  <p className="text-[10px] text-gray-500 font-medium truncate italic">
                                    {slot.course.code}
                                  </p>
                                )}
                                {slot.activity_name && (
                                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                                    Activity
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                {slot.faculty_id && (
                                  <div className="flex items-center text-[10px] text-gray-400">
                                    <User className="w-3 h-3 mr-1.5 text-indigo-400" />{" "}
                                    {slot.faculty?.name ||
                                      slot.faculty_id.slice(0, 8)}
                                  </div>
                                )}
                                <div className="flex items-center text-[10px] text-gray-400 font-bold">
                                  <MapPin className="w-3 h-3 mr-1.5 text-indigo-400" />{" "}
                                  {slot.room?.room_number ||
                                    slot.room_number ||
                                    "TBD"}
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
