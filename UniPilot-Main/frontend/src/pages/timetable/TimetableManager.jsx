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
  Trash2,
  ArrowLeft,
  ChevronDown // Added incase, but standard select usually doesn't need it if we stick to native
} from "lucide-react";
import {
  findTimetable,
  createTimetable,
  addSlot,
  deleteSlot,
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
    batch_year: new Date().getFullYear(),
  });

  // Auto-fetch semester based on batch year and program
  useEffect(() => {
    if (criteria.batch_year && criteria.program_id) {
      api.get(`/users/semesters?batch_year=${criteria.batch_year}&program_id=${criteria.program_id}&department_id=${criteria.department_id}`)
        .then(res => {
          const sems = res.data.data;
          if (sems && sems.length > 0) {
            // Assuming the batch is generally synchronized, take the highest semester
            const currentSem = Math.max(...sems);
            setCriteria(prev => ({ ...prev, semester: currentSem }));
          } else {
            // Fallback if no students found? keep current or default to 1?
            // Maybe default calculation is better fallback?
            // For now, if no students, we default to 1 or calculation.
            // Let's rely on calculation as fallback if API returns empty
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            const batchYear = parseInt(criteria.batch_year);
            let diff = currentYear - batchYear;
            let sem = diff * 2 + (currentMonth >= 6 ? 1 : 0);
            if (sem < 1) sem = 1;
            setCriteria(prev => ({ ...prev, semester: sem }));
          }
        })
        .catch(err => {
          console.error("Failed to fetch batch semester", err);
        });
    }
  }, [criteria.batch_year, criteria.program_id]);

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
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [batches, setBatches] = useState([]);
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
      api.get("/users/batch-years"),
    ]).then(([facultyRes, hodRes, blocksRes, settingsRes, batchesRes]) => {
      const allInstructors = [...facultyRes.data.data, ...hodRes.data.data];
      setFaculty(allInstructors);
      setBlocks(blocksRes.data.data || []);
      setIsSatWorking(
        settingsRes.data.data.student_saturday_working === "true",
      );
      setBatches(batchesRes.data.data || []);
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

  // Fetch courses and sections when program/semester changes
  // Fetch courses and sections when program/semester changes
  useEffect(() => {
    if (criteria.program_id && criteria.semester) { // batch_year needed for regulation context
      const fetchContextAndCourses = async () => {
        try {
          let regId = "";
          // Try to find regulation ID from students of this batch
          if (criteria.batch_year) {
            const usersRes = await api.get(`/users?program_id=${criteria.program_id}&batch_year=${criteria.batch_year}&role=student`);
            if (usersRes.data.data && usersRes.data.data.length > 0) {
              regId = usersRes.data.data[0].regulation_id;
            }
          }

          // Fetch courses with regulation context if available
          const coursesRes = await api.get(
            `/courses?program_id=${criteria.program_id}&semester=${criteria.semester}${regId ? `&regulation_id=${regId}` : ''}`
          );
          setCourses(coursesRes.data.data || []);

          // Fetch sections
          const sectionsRes = await api.get(
            `/users/sections?program_id=${criteria.program_id}&semester=${criteria.semester}`
          );

          const newSections = sectionsRes.data.data || [];
          setSections(newSections);

          if (newSections.length > 0) {
            if (!newSections.includes(criteria.section)) {
              setCriteria((prev) => ({ ...prev, section: newSections[0] }));
            }
          } else {
            setCriteria((prev) => ({ ...prev, section: "" }));
          }

        } catch (err) {
          console.error("Error fetching context/courses", err);
          setCourses([]);
        }
      };

      fetchContextAndCourses();

    } else {
      setCourses([]);
      setSections([]);
    }
  }, [criteria.program_id, criteria.semester, criteria.batch_year]);

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

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this class slot?"))
      return;

    try {
      await dispatch(deleteSlot(slotId)).unwrap();
      // No need for explicit refresh as the slice update handles it
    } catch (err) {
      alert(err || "Failed to delete slot");
    }
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-6 pt-8 mb-12">
        <button
          onClick={() => window.history.back()}
          className="group flex items-center text-xs font-bold text-gray-400 hover:text-black transition-colors mb-6 uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3 text-black">
              Timetable<span className="text-blue-600">.</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-lg">
              Manage academic schedules, potential conflicts, and faculty allocations from a single centralized view.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-wrap gap-2">
              <select
                className="appearance-none bg-gray-50 hover:bg-gray-100 border-none px-4 py-3 pr-8 font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer min-w-[160px] focus:ring-2 focus:ring-blue-600 transition-all text-gray-700"
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
                <option value="">Select Dept</option>
                {academicDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                className="appearance-none bg-gray-50 hover:bg-gray-100 border-none px-4 py-3 pr-8 font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer min-w-[160px] focus:ring-2 focus:ring-blue-600 transition-all text-gray-700 disabled:opacity-50"
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
                className="appearance-none bg-gray-50 hover:bg-gray-100 border-none px-4 py-3 pr-8 font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-600 transition-all text-gray-700"
                value={criteria.batch_year}
                onChange={(e) =>
                  setCriteria({ ...criteria, batch_year: e.target.value })
                }
              >
                <option value="">Batch</option>
                {batches.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <div className="bg-blue-50 px-4 py-3 rounded-lg flex items-center justify-center border border-blue-100">
                <span className="text-blue-700 font-bold text-xs uppercase tracking-wide">Sem {criteria.semester}</span>
              </div>

              <select
                className="appearance-none bg-gray-50 hover:bg-gray-100 border-none px-4 py-3 pr-8 font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-600 transition-all text-gray-700 disabled:opacity-50"
                value={criteria.section}
                onChange={(e) =>
                  setCriteria({ ...criteria, section: e.target.value })
                }
                disabled={!criteria.program_id || sections.length === 0}
              >
                <option value="">Sec</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="bg-black text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors rounded-lg shadow-lg shadow-gray-200"
            >
              Load Grid
            </button>
          </div>
        </div>
      </div>

      {/* States */}
      {status === "loading" && (
        <div className="py-32 text-center animate-pulse">
          <div className="text-4xl font-black text-gray-200 mb-4">LOADING...</div>
          <p className="text-gray-400 font-mono text-xs">Fetching configuration data</p>
        </div>
      )}

      {status === "failed" && !currentTimetable && (
        <div className="max-w-2xl mx-auto text-center border border-dashed border-gray-300 rounded-xl p-16">
          <h2 className="text-3xl font-black mb-4">No Timetable Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            We couldn't find an existing schedule for {criteria.academic_year} (Sem {criteria.semester}).
            Initialize a new one to get started.
          </p>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 text-white px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors rounded-lg"
          >
            Create New Timetable
          </button>
        </div>
      )}

      {/* Main Workspace */}
      {currentTimetable && (
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar - Add Slot */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Add Slot</h3>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Day of Week</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded p-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-shadow"
                    value={slotForm.day_of_week}
                    onChange={(e) => setSlotForm({ ...slotForm, day_of_week: e.target.value })}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Time</label>
                    <input
                      type="time"
                      value={slotForm.start_time}
                      onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded p-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Time</label>
                    <input
                      type="time"
                      value={slotForm.end_time}
                      onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded p-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slot Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSlotForm({ ...slotForm, is_activity: false, activity_name: "" })}
                      className={`py-2 text-xs font-bold uppercase tracking-wide rounded transition-all ${!slotForm.is_activity ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      Academic
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotForm({ ...slotForm, is_activity: true, course_id: "" })}
                      className={`py-2 text-xs font-bold uppercase tracking-wide rounded transition-all ${slotForm.is_activity ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      Activity
                    </button>
                  </div>
                </div>

                {!slotForm.is_activity ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course</label>
                    <div className="relative">
                      <select
                        className="w-full bg-gray-50 border-none rounded p-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-shadow truncate pr-8"
                        value={slotForm.course_id}
                        onChange={(e) => setSlotForm({ ...slotForm, course_id: e.target.value })}
                        required
                      >
                        <option value="">Select Course...</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sports, Library"
                      value={slotForm.activity_name}
                      onChange={(e) => setSlotForm({ ...slotForm, activity_name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded p-3 text-sm font-bold focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Instructor {slotForm.is_activity && <span className="text-gray-300 font-normal normal-case">(Optional)</span>}
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none rounded p-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-shadow"
                    value={slotForm.faculty_id}
                    onChange={(e) => setSlotForm({ ...slotForm, faculty_id: e.target.value })}
                    required={!slotForm.is_activity}
                  >
                    <option value="">Select Faculty...</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="w-full bg-gray-50 border-none rounded p-3 text-xs font-bold focus:ring-2 focus:ring-blue-600 transition-shadow"
                      value={slotForm.block_id}
                      onChange={(e) => setSlotForm({ ...slotForm, block_id: e.target.value, room_id: "" })}
                      required
                    >
                      <option value="">Block</option>
                      {blocks.map((b) => (
                        <option key={b.id} value={b.id}>{b.code}</option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-gray-50 border-none rounded p-3 text-xs font-bold focus:ring-2 focus:ring-blue-600 transition-shadow disabled:opacity-50"
                      value={slotForm.room_id}
                      onChange={(e) => setSlotForm({ ...slotForm, room_id: e.target.value })}
                      disabled={!slotForm.block_id}
                      required
                    >
                      <option value="">Room</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.room_number}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold text-xs uppercase tracking-widest py-4 mt-4 hover:bg-black transition-colors rounded shadow-lg shadow-blue-600/20"
                >
                  Confirm Allocation
                </button>

                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Grid Area */}
          <div className="lg:col-span-9">
            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-black">
                  Master Schedule
                </h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Section {currentTimetable.section} / {currentTimetable.program?.code}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Changes</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-12">
              <div className="min-w-[800px]">
                {/* Header */}
                <div
                  className="grid gap-6 mb-6 pb-2"
                  style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
                >
                  <div className="text-right text-[10px] font-mono text-gray-300 pt-1">GMT+5.30</div>
                  {days.map((d) => (
                    <div key={d} className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">
                      {d.substring(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {times.map((time) => (
                  <div
                    key={time}
                    className="grid gap-6 mb-2 min-h-[120px]"
                    style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
                  >
                    <div className="text-right text-xs font-mono text-gray-400 pt-2 pr-4 border-r border-gray-100">
                      {time}
                    </div>

                    {days.map((day) => {
                      const slot = currentTimetable.slots?.find(
                        (s) => s.day_of_week === day && s.start_time.startsWith(time.split(":")[0])
                      );

                      return (
                        <div key={`${day}-${time}`} className="relative group h-full">
                          {slot ? (
                            <div className="absolute inset-0 bg-blue-50 border-l-4 border-blue-600 p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group-hover:bg-blue-600 group-hover:text-white">
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70 group-hover:text-blue-200">
                                    {slot.room?.room_number || "TBD"}
                                  </span>
                                  {slot.activity_name && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>}
                                </div>
                                <h4 className="font-bold text-sm leading-tight mt-1 line-clamp-2">
                                  {slot.activity_name || slot.course?.name}
                                </h4>
                                {slot.course?.code && (
                                  <p className="text-[10px] opacity-60 mt-0.5 font-mono">{slot.course.code}</p>
                                )}
                              </div>

                              <div className="flex justify-between items-end mt-2">
                                <div className="text-[10px] font-medium opacity-70 truncate max-w-[80px]">
                                  {slot.faculty?.last_name || slot.faculty?.name || "Unassigned"}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSlot(slot.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                                  title="Remove Slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full border border-gray-50 bg-gray-50/30 rounded-lg hover:border-blue-200 transition-colors"></div>
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

      {/* Empty Initial State - Clean */}
      {!currentTimetable && status === "idle" && (
        <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
          <Filter className="w-12 h-12 mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No Selection</h2>
          <p className="max-w-xs mt-2 text-sm text-gray-400">Please select a department and program from the toolbar to begin managing the schedule.</p>
        </div>
      )}
    </div>
  );
};

export default TimetableManager;
