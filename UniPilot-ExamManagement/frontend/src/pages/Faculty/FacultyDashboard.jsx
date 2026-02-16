import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAssignedExams } from "../../services/examCycleService";
import { FileText, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function FacultyDashboard() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const response = await getAssignedExams();
            setExams(response.data.data || []);
        } catch (error) {
            console.error("Error loading exams:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium animate-pulse text-slate-400 uppercase tracking-wider">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
                            Faculty Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black">
                            Assigned <span className="text-blue-600">Exams</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-light leading-relaxed">
                            Overview of your current invigilation schedules and paper setting duties.
                        </p>
                    </div>

                    {exams.length > 0 && (
                        <div className="hidden md:block pl-8 border-l-2 border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Tasks</p>
                            <p className="text-5xl font-bold text-blue-600 tabular-nums">{exams.length}</p>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                {exams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-50/80 transition-colors">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 group">
                            <FileText className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-3">No Exams Assigned</h3>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                            You currently have no exams assigned for invigilation or paper setting. New assignments will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-400/50 transition-all duration-300 overflow-hidden"
                            >
                                {/* Status Strip */}
                                <div className={`h-1.5 w-full ${exam.exam_status === "assigned" ? "bg-amber-400" : "bg-emerald-500"}`} />

                                <div className="p-6 flex flex-col h-full">
                                    {/* Header: Code & Status Badge */}
                                    <div className="flex justify-between items-start mb-5 gap-3">
                                        <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-bold tracking-tight">
                                            {exam.course.code}
                                        </div>
                                        {exam.exam_status === "assigned" ? (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Pending
                                            </span>
                                        ) : (
                                            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Submitted
                                            </span>
                                        )}
                                    </div>

                                    {/* Course Title */}
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors">
                                        {exam.course.name}
                                    </h3>

                                    {/* Cycle Name - Styled as Caption */}
                                    <div className="mb-6">
                                        <div className="relative pl-3 border-l-2 border-slate-200 py-0.5">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Exam Cycle</p>
                                            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide break-words leading-relaxed">
                                                {exam.exam_cycle.cycle_name.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-slate-100 mb-5 mt-auto" />

                                    {/* Meta Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date</span>
                                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-bold text-slate-700">
                                                    {new Date(exam.exam_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time</span>
                                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-bold text-slate-700 truncate">
                                                    {exam.start_time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        to={`/faculty/exam/${exam.id}/format`}
                                        className="group/btn flex items-center justify-center w-full py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold tracking-wide shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-500/25 transform active:scale-[0.98] transition-all duration-200"
                                    >
                                        <span>Manage Format</span>
                                        <svg className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
