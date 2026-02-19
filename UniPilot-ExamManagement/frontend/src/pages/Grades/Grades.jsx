import { useEffect, useState } from "react";
import { getAllRegulations } from "../../services/examCycleService.js";
import { FileText, ChevronRight, GraduationCap, ArrowRight } from "lucide-react";

export default function Grades() {
    const [regulations, setRegulations] = useState([]);
    const [selectedRegulation, setSelectedRegulation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegulations();
    }, []);

    const fetchRegulations = async () => {
        try {
            const response = await getAllRegulations();
            const data = response.data.data || [];
            setRegulations(data);
            if (data.length > 0) {
                setSelectedRegulation(data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch regulations", error);
        } finally {
            setLoading(false);
        }
    };

    const renderGradeScale = (scaleData) => {
        if (!scaleData) return <p className="text-gray-500 italic">No grade scale defined.</p>;

        let scale = scaleData;
        if (typeof scaleData === 'string') {
            try {
                scale = JSON.parse(scaleData);
            } catch (e) {
                console.error("Failed to parse grade scale JSON", e);
                return (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                        Failed to parse grade scale data.
                    </div>
                )
            }
        }

        if (Array.isArray(scale)) {
            return (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Range (Max - Min)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade Letter</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade Points</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {scale.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {item.max !== undefined && item.min !== undefined
                                            ? `${item.max} - ${item.min}`
                                            : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm ${item.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                                            {item.grade || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">
                                        {item.points !== undefined ? item.points : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {item.description || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto shadow-inner">
                <code className="text-sm font-mono text-blue-300">
                    {JSON.stringify(scale, null, 2)}
                </code>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Grade Scales</h1>
                    <p className="text-gray-500 mt-2 text-lg">Master grading systems & definitions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Sidebar List of Regulations */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                    <div className="p-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Regulations</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{regulations.length}</span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {regulations.map((reg) => (
                            <button
                                key={reg.id}
                                onClick={() => setSelectedRegulation(reg)}
                                className={`w-full text-left p-4 flex items-center group transition-all duration-200 ${selectedRegulation?.id === reg.id ? "bg-blue-50 border-r-4 border-blue-600" : "hover:bg-gray-50 border-r-4 border-transparent"}`}
                            >
                                <div className="flex-1">
                                    <p className={`font-bold transition-colors ${selectedRegulation?.id === reg.id ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600"}`}>
                                        {reg.name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{reg.code || "REG CODE"}</p>
                                </div>
                                {selectedRegulation?.id === reg.id && <ArrowRight className="w-4 h-4 text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content: Grade Scale */}
                <div className="lg:col-span-9 space-y-6">
                    {selectedRegulation ? (
                        <>
                            {/* Regulation Header Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-start gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

                                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                                    <GraduationCap className="w-8 h-8" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                                        {selectedRegulation.name}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                            Code: <span className="text-gray-900 font-bold">{selectedRegulation.code || "N/A"}</span>
                                        </span>
                                        {selectedRegulation.academic_year && (
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                                Year: <span className="text-gray-900 font-bold">{selectedRegulation.academic_year}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Grade Scale Data */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-bold text-gray-900">Grading System Structure</h3>
                                </div>

                                {renderGradeScale(selectedRegulation.grade_scale || selectedRegulation.exam_configuration?.grade_scale)}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-[500px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No Regulation Selected</h3>
                            <p className="text-gray-500 mt-2">Choose a regulation from the sidebar to view its grade scale details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
