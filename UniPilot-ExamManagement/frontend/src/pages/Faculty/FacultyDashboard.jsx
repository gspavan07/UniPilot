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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Assigned Exams</h1>
                <p className="text-gray-600 mt-1">
                    Manage question papers for exams assigned to you.
                </p>
            </div>

            {exams.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Exams Assigned</h3>
                    <p className="text-gray-500 mt-2">
                        You currently have no exams assigned for invigilation or paper setting.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <div
                            key={exam.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {exam.exam_cycle.cycle_name}
                                        </span>
                                    </div>
                                    {exam.exam_status === "assigned" ? (
                                        <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                                            <AlertCircle className="w-4 h-4" />
                                            Pending Format
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Format Submitted
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {exam.course.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">{exam.course.code}</p>

                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {exam.start_time} - {exam.end_time}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        to={`/faculty/exam/${exam.id}/format`}
                                        className="block w-full text-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Manage Paper Format
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
