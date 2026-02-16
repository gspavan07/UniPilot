import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHodFormattedPapers } from "../../services/hodService";
import {
    Layout,
    Eye,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    Search,
    Filter,
    FileText,
    AlertTriangle,
    Lock
} from "lucide-react";

export default function HodDashboard() {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadPapers();
    }, []);

    const loadPapers = async () => {
        try {
            const response = await getHodFormattedPapers();
            setPapers(response.data.data || []);
        } catch (error) {
            console.error("Error loading papers:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "format_submitted":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "format_freezed":
                return "bg-green-50 text-green-700 border-green-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "format_submitted":
                return "Review Pending";
            case "format_freezed":
                return "Frozen";
            default:
                return status?.replace(/_/g, " ");
        }
    };

    const filteredPapers = papers.filter(paper => {
        const matchesSearch = paper.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            paper.course.code.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "all") return matchesSearch;
        if (filter === "pending") return matchesSearch && paper.exam_status === "format_submitted";
        if (filter === "frozen") return matchesSearch && paper.exam_status === "format_freezed";
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                        Paper Formatting
                    </h1>
                    <p className="text-gray-500 font-medium">Review and freeze exam paper formats from your department.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div onClick={() => setFilter("all")} className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${filter === 'all' ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10' : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Papers</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">{papers.length}</div>
                </div>

                <div onClick={() => setFilter("pending")} className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${filter === 'pending' ? 'bg-yellow-50 border-yellow-200 shadow-lg shadow-yellow-500/10' : 'bg-white border-gray-100 hover:border-yellow-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${filter === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500'}`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Review</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">
                        {papers.filter(p => p.exam_status === 'format_submitted').length}
                    </div>
                </div>

                <div onClick={() => setFilter("frozen")} className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${filter === 'frozen' ? 'bg-green-50 border-green-200 shadow-lg shadow-green-500/10' : 'bg-white border-gray-100 hover:border-green-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${filter === 'frozen' ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                            <Lock className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Frozen Papers</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900">
                        {papers.filter(p => p.exam_status === 'format_freezed').length}
                    </div>
                </div>
            </div>

            {/* Papers List */}
            {filteredPapers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {filteredPapers.map((paper) => (
                        <div key={paper.id} className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start gap-6 mb-4 md:mb-0">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                                    {paper.course.code.substring(0, 2)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{paper.course.name}</h3>
                                        <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{paper.course.code}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {new Date(paper.exam_date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            Faculty: {paper.assigned_faculty ? `${paper.assigned_faculty.first_name} ${paper.assigned_faculty.last_name}` : 'Unknown'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {paper.start_time?.substring(0, 5)} - {paper.end_time?.substring(0, 5)}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusColor(paper.exam_status)}`}>
                                            {getStatusLabel(paper.exam_status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/hod/paper/${paper.id}`)}
                                className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all hover:scale-105 flex items-center justify-center gap-2 group-hover:bg-blue-600"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Review Paper</span>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Papers Found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}
