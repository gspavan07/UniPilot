import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getHodFormattedPapers,
    updateHodPaperFormat,
    freezeHodPaperFormat
} from "../../services/hodService";
import { getCourseOutcomes } from "../../services/courseOutcomeService";
import {
    ArrowLeft,
    Save,
    Lock,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    Layers,
    Type,
    HelpCircle,
    Layout,
    Target
} from "lucide-react";

export default function HodPaperReview() {
    const { timetableId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [courseOutcomes, setCourseOutcomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [freezing, setFreezing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form State for the new structure
    const [componentsConfig, setComponentsConfig] = useState({});

    // Read-only state
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        loadExamDetails();
    }, [timetableId]);

    const loadExamDetails = async () => {
        try {
            const response = await getHodFormattedPapers();
            const foundExam = response.data.data.find((e) => e.id === timetableId);

            if (foundExam) {
                setExam(foundExam);
                setIsReadOnly(foundExam.exam_status === 'format_freezed');

                try {
                    const coResponse = await getCourseOutcomes(foundExam.course_id);
                    setCourseOutcomes(coResponse.data.data || []);
                } catch (coErr) {
                    console.error("Error fetching COs:", coErr);
                }

                if (foundExam.paper_format && foundExam.paper_format.components) {
                    const initialConfig = {};
                    foundExam.paper_format.components.forEach(comp => {
                        initialConfig[comp.component_id] = comp;
                    });
                    setComponentsConfig(initialConfig);
                }
            } else {
                setError("Exam not found or access denied.");
            }
        } catch (err) {
            console.error("Error loading exam:", err);
            setError("Failed to load exam details.");
        } finally {
            setLoading(false);
        }
    };

    const getComponentState = (compId, maxMarks) => {
        return componentsConfig[compId] || {
            component_id: compId,
            is_checked: false,
            max_marks: maxMarks,
            sections: []
        };
    };

    const updateComponentState = (compId, updates) => {
        if (isReadOnly) return;
        setComponentsConfig(prev => ({
            ...prev,
            [compId]: { ...prev[compId], ...updates }
        }));
    };

    const handleComponentToggle = (compId, maxMarks) => {
        if (isReadOnly) return;
        const current = getComponentState(compId, maxMarks);
        updateComponentState(compId, {
            ...current,
            is_checked: !current.is_checked,
        });
    };

    // --- Section Management ---
    const addSection = (compId) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const newSection = {
            section_id: `Section ${current.sections.length + 1}`,
            total_questions: 1,
            questions_to_answer: 1,
            max_marks: 0,
            questions: []
        };
        updateComponentState(compId, {
            sections: [...(current.sections || []), newSection]
        });
    };

    const removeSection = (compId, sectionIndex) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections.splice(sectionIndex, 1);
        updateComponentState(compId, { sections: updatedSections });
    };

    const updateSectionField = (compId, sectionIndex, field, value) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], [field]: value };
        updateComponentState(compId, { sections: updatedSections });
    };

    // --- Question Management ---
    const addQuestion = (compId, sectionIndex) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex].questions.push({
            question_number: String(updatedSections[sectionIndex].questions.length + 1),
            max_marks: 0,
            co_id: "",
            sub_parts: []
        });
        updateComponentState(compId, { sections: updatedSections });
    };

    const removeQuestion = (compId, sectionIndex, qIndex) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex].questions.splice(qIndex, 1);
        updateComponentState(compId, { sections: updatedSections });
    };

    const updateQuestionField = (compId, sectionIndex, qIndex, field, value) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        const question = updatedSections[sectionIndex].questions[qIndex];
        updatedSections[sectionIndex].questions[qIndex] = { ...question, [field]: value };
        updateComponentState(compId, { sections: updatedSections });
    };

    // --- Sub-part Management ---
    const addSubPart = (compId, sectionIndex, qIndex) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        const question = updatedSections[sectionIndex].questions[qIndex];

        if (!question.sub_parts) question.sub_parts = [];
        const nextSubLabel = `${question.question_number}.${question.sub_parts.length + 1}`;

        question.sub_parts.push({
            question_number: nextSubLabel,
            max_marks: 0
        });

        updateComponentState(compId, { sections: updatedSections });
    };

    const removeSubPart = (compId, sectionIndex, qIndex, spIndex) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex].questions[qIndex].sub_parts.splice(spIndex, 1);
        updateComponentState(compId, { sections: updatedSections });
    };

    const updateSubPartField = (compId, sectionIndex, qIndex, spIndex, field, value) => {
        if (isReadOnly) return;
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        const subPart = updatedSections[sectionIndex].questions[qIndex].sub_parts[spIndex];
        updatedSections[sectionIndex].questions[qIndex].sub_parts[spIndex] = { ...subPart, [field]: value };
        updateComponentState(compId, { sections: updatedSections });
    };


    // --- Validation ---
    const validateForm = () => {
        const errors = [];
        Object.values(componentsConfig).forEach(comp => {
            if (!comp.is_checked) return;
            comp.sections.forEach((section, sIdx) => {
                if (parseInt(section.questions_to_answer) > parseInt(section.total_questions)) {
                    errors.push(`[${comp.component_id} - ${section.section_id}] "Questions to answer" cannot exceed "Total questions".`);
                }
                section.questions.forEach((q, qIdx) => {
                    if (q.sub_parts && q.sub_parts.length > 0) {
                        const subTotal = q.sub_parts.reduce((sum, sp) => sum + (parseFloat(sp.max_marks || 0)), 0);
                        if (subTotal !== parseFloat(q.max_marks)) {
                            errors.push(`[${comp.component_id} - ${section.section_id} - Q${q.question_number}] Sum of sub-part marks (${subTotal}) must equal question max marks (${q.max_marks}).`);
                        }
                    }
                });
            });
        });
        return errors;
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(" "));
            setSaving(false);
            return;
        }

        try {
            const payloadComponents = [];
            Object.values(componentsConfig).forEach(comp => {
                if (comp.is_checked) {
                    payloadComponents.push({
                        component_id: comp.component_id,
                        is_checked: true,
                        sections: comp.sections.map(s => ({
                            section_id: s.section_id,
                            total_questions: parseInt(s.total_questions),
                            questions_to_answer: parseInt(s.questions_to_answer),
                            max_marks: parseFloat(s.max_marks),
                            questions: s.questions.map(q => {
                                const hasSubParts = q.sub_parts && q.sub_parts.length > 0;
                                return {
                                    question_number: q.question_number,
                                    max_marks: parseFloat(q.max_marks),
                                    co_id: hasSubParts ? null : q.co_id,
                                    ...(hasSubParts ? {
                                        sub_parts: q.sub_parts.map(sp => ({
                                            question_number: sp.question_number,
                                            max_marks: parseFloat(sp.max_marks),
                                            co_id: sp.co_id
                                        }))
                                    } : {})
                                };
                            })
                        }))
                    });
                } else {
                    payloadComponents.push({
                        component_id: comp.component_id,
                        is_checked: false,
                        max_marks: comp.max_marks
                    });
                }
            });

            const payload = {
                paper_format: {
                    components: payloadComponents
                },
            };

            await updateHodPaperFormat(timetableId, payload);
            setSuccess("Paper format updated successfully!");
        } catch (err) {
            console.error("Save error:", err);
            setError(err.response?.data?.error || "Failed to update paper format.");
        } finally {
            setSaving(false);
        }
    };

    const handleFreeze = async () => {
        if (!window.confirm("Are you sure you want to freeze this paper format? Once frozen, the faculty will not be able to edit it anymore.")) return;

        setFreezing(true);
        setError("");

        try {
            await freezeHodPaperFormat(timetableId);
            setSuccess("Paper format frozen successfully!");
            setIsReadOnly(true);
            setTimeout(() => navigate("/hod/papers"), 2000);
        } catch (err) {
            console.error("Freeze error:", err);
            setError(err.response?.data?.error || "Failed to freeze paper format.");
        } finally {
            setFreezing(false);
        }
    };

    // Recursive helper to traverse Exam Cycle structure and render standard UI
    const renderStructure = (structNode) => {
        if (!structNode) return null;

        const isLeafComponent = !structNode.components || structNode.components.length === 0;

        if (isLeafComponent) {
            const config = getComponentState(structNode.id, structNode.max_marks);
            // Ensure config exists in state if not already
            if (!componentsConfig[structNode.id]) {
                // Side-effect controlled in real app, here we rely on defaults
            }

            return (
                <div key={structNode.id} className="mb-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    {/* Component Header */}
                    <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${config.is_checked ? 'bg-blue-50/10' : 'bg-gray-50/50'}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id={`check-${structNode.id}`}
                                    checked={config.is_checked}
                                    onChange={() => handleComponentToggle(structNode.id, structNode.max_marks)}
                                    disabled={isReadOnly}
                                    className="peer sr-only"
                                />
                                <label
                                    htmlFor={`check-${structNode.id}`}
                                    className={`block w-12 h-7 rounded-full transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-transform peer-checked:after:translate-x-5 ${isReadOnly ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 peer-checked:bg-blue-600 cursor-pointer'}`}
                                ></label>
                            </div>

                            <div>
                                <h3 className={`text-lg font-bold font-display ${config.is_checked ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {structNode.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.is_checked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                        Max Marks: {structNode.max_marks}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {config.is_checked && !isReadOnly && (
                            <button
                                onClick={() => addSection(structNode.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Section</span>
                            </button>
                        )}
                    </div>

                    {/* Component Body */}
                    {config.is_checked && (
                        <div className="p-6 bg-white animate-fadeIn">
                            {config.sections?.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h4 className="text-gray-900 font-bold">No Sections Added</h4>
                                    <p className="text-sm text-gray-500 mb-4">Start by adding a section to this component.</p>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => addSection(structNode.id)}
                                            className="text-blue-600 font-bold text-sm hover:underline"
                                        >
                                            Add New Section
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {config.sections?.map((section, sIdx) => (
                                        <div key={sIdx} className="relative group/section">
                                            {/* Section Connector Line */}
                                            {sIdx < config.sections.length - 1 && (
                                                <div className="absolute left-6 top-full h-8 w-px bg-gray-100 -ml-px z-0"></div>
                                            )}

                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 z-10 font-bold text-lg">
                                                    {sIdx + 1}
                                                </div>

                                                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                                                    {/* Section Header */}
                                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
                                                        <div className="flex-1 min-w-[200px]">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Section Title</label>
                                                            <div className="relative">
                                                                <Type className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-300" />
                                                                <input
                                                                    type="text"
                                                                    value={section.section_id}
                                                                    onChange={(e) => updateSectionField(structNode.id, sIdx, 'section_id', e.target.value)}
                                                                    disabled={isReadOnly}
                                                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                                    placeholder="e.g. Part A"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="w-32">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Qs</label>
                                                            <input
                                                                type="number"
                                                                value={section.total_questions}
                                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'total_questions', e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                            />
                                                        </div>
                                                        <div className="w-32">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">To Answer</label>
                                                            <input
                                                                type="number"
                                                                value={section.questions_to_answer}
                                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'questions_to_answer', e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                            />
                                                        </div>
                                                        <div className="w-32">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Max Marks</label>
                                                            <input
                                                                type="number"
                                                                value={section.max_marks}
                                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'max_marks', e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                            />
                                                        </div>

                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={() => removeSection(structNode.id, sIdx)}
                                                                className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Section"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Questions List */}
                                                    <div className="p-4 bg-white space-y-3">
                                                        <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                            Questions Configuration
                                                        </div>

                                                        {section.questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="group/item relative p-5 bg-white border border-gray-200 rounded-2xl mb-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                                                                <div className="flex items-start gap-6">
                                                                    {/* Question Number */}
                                                                    <div className="w-24 shrink-0">
                                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Question No</label>
                                                                        <div className="relative group/input">
                                                                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-mono font-bold group-focus-within/input:text-blue-500 transition-colors">Q.</span>
                                                                            <input
                                                                                type="text"
                                                                                value={q.question_number}
                                                                                onChange={(e) => updateQuestionField(structNode.id, sIdx, qIdx, 'question_number', e.target.value)}
                                                                                disabled={isReadOnly}
                                                                                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                                                placeholder="1"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Max Marks */}
                                                                    <div className="w-28 shrink-0">
                                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max Marks</label>
                                                                        <div className="relative group/input">
                                                                            <input
                                                                                type="number"
                                                                                value={q.max_marks}
                                                                                onChange={(e) => updateQuestionField(structNode.id, sIdx, qIdx, 'max_marks', e.target.value)}
                                                                                disabled={isReadOnly}
                                                                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                                            />
                                                                            <span className="absolute right-3 top-2.5 text-gray-400 text-[10px] font-bold uppercase pointer-events-none">Pts</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* CO Mapping */}
                                                                    <div className="w-40 shrink-0">
                                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Outcome (CO)</label>
                                                                        {q.sub_parts && q.sub_parts.length > 0 ? (
                                                                            <div className="h-[42px] px-4 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                                <Layers className="w-3.5 h-3.5" />
                                                                                <span>Mapped in Sub-parts</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="relative group/select">
                                                                                <Target className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within/select:text-blue-500 transition-colors pointer-events-none" />
                                                                                <ChevronDown className="absolute right-3 top-3.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                                                <select
                                                                                    value={q.co_id}
                                                                                    onChange={(e) => updateQuestionField(structNode.id, sIdx, qIdx, 'co_id', e.target.value)}
                                                                                    disabled={isReadOnly}
                                                                                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-bold text-gray-900 outline-none appearance-none transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                                                                                >
                                                                                    <option value="">Select CO...</option>
                                                                                    {courseOutcomes.map(co => (
                                                                                        <option key={co.id} value={co.co_code}>{co.co_code} - {co.description?.substring(0, 20)}...</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1"></div>

                                                                    {/* Action Buttons */}
                                                                    {!isReadOnly && (
                                                                        <div className="flex items-center gap-2 pt-6 opacity-0 group-hover/item:opacity-100 transition-all duration-200 translate-y-2 group-hover/item:translate-y-0">
                                                                            <button
                                                                                onClick={() => addSubPart(structNode.id, sIdx, qIdx)}
                                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                                                title="Add Sub-part"
                                                                            >
                                                                                <Layers className="w-3.5 h-3.5" />
                                                                                <span>Sub-part</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => removeQuestion(structNode.id, sIdx, qIdx)}
                                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                                title="Remove Question"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Sub Parts Section */}
                                                                {q.sub_parts && q.sub_parts.length > 0 && (
                                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Sub-Questions</div>
                                                                        <div className="space-y-2 pl-4 border-l-2 border-indigo-100 ml-2">
                                                                            {q.sub_parts.map((sp, spIdx) => (
                                                                                <div key={spIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group/sub">
                                                                                    <span className="text-gray-300 text-lg leading-none select-none">↳</span>

                                                                                    <div className="relative w-20">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={sp.question_number}
                                                                                            onChange={(e) => updateSubPartField(structNode.id, sIdx, qIdx, spIdx, 'question_number', e.target.value)}
                                                                                            disabled={isReadOnly}
                                                                                            className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg py-1.5 px-2 text-center transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="relative w-20">
                                                                                        <input
                                                                                            type="number"
                                                                                            placeholder="Marks"
                                                                                            value={sp.max_marks}
                                                                                            onChange={(e) => updateSubPartField(structNode.id, sIdx, qIdx, spIdx, 'max_marks', e.target.value)}
                                                                                            disabled={isReadOnly}
                                                                                            className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg py-1.5 px-2 text-center transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="relative w-24">
                                                                                        <select
                                                                                            value={sp.co_id || ""}
                                                                                            onChange={(e) => updateSubPartField(structNode.id, sIdx, qIdx, spIdx, 'co_id', e.target.value)}
                                                                                            disabled={isReadOnly}
                                                                                            className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg py-1.5 px-2 appearance-none cursor-pointer transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                                                        >
                                                                                            <option value="">CO</option>
                                                                                            {courseOutcomes.map(co => (
                                                                                                <option key={co.id} value={co.co_code}>{co.co_code}</option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </div>

                                                                                    {!isReadOnly && (
                                                                                        <button
                                                                                            onClick={() => removeSubPart(structNode.id, sIdx, qIdx, spIdx)}
                                                                                            className="ml-auto text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-white shadow-sm opacity-0 group-hover/sub:opacity-100 transition-all transform scale-90 hover:scale-100"
                                                                                        >
                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={() => addQuestion(structNode.id, sIdx)}
                                                                className="mt-3 text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-50 w-fit"
                                                            >
                                                                <Plus className="w-3 h-3" /> Add Question
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        // If not a leaf, recurse
        return (
            <div key={structNode.id} className="mt-8 first:mt-0">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest px-4 border border-gray-200 rounded-full py-1 bg-white">
                        {structNode.name}
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <div>
                    {structNode.components?.map(child => renderStructure(child))}
                </div>
            </div>
        );
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!exam) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">Exam not found</h3>
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go Back</button>
        </div>
    );

    const relevantCourseType = exam.exam_configuration?.course_types?.find(
        ct => ct.name.toLowerCase() === exam.course.course_type?.toLowerCase()
    );

    const findComponentByCycleType = (component, cycleType) => {
        if (!component) return null;
        if (component.name.toLowerCase() === cycleType?.toLowerCase()) {
            return component;
        }
        if (component.components) {
            for (let child of component.components) {
                const found = findComponentByCycleType(child, cycleType);
                if (found) return found;
            }
        }
        return null;
    };

    const targetStructure = relevantCourseType
        ? findComponentByCycleType(relevantCourseType.structure, exam.exam_cycle.cycle_type)
        : null;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight block">
                                HOD Paper Review {isReadOnly && <span className="text-xs text-red-500 font-bold ml-2 border border-red-500 px-2 py-0.5 rounded-md">VIEW ONLY</span>}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">Review, updated or freeze the paper format</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-xs font-bold text-gray-900">{exam.course.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono tracking-wider">{exam.course.code}</span>
                        </div>

                        {!isReadOnly && (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || freezing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-gray-500 border-t-gray-800 rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>Save Draft</span>
                                </button>

                                <button
                                    onClick={handleFreeze}
                                    disabled={saving || freezing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    {freezing ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    <span>Freeze Format</span>
                                </button>
                            </>
                        )}

                        {isReadOnly && (
                            <div className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-bold rounded-xl flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>Frozen</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-8">
                {/* Context Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Layout className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Exam Type</p>
                            <h3 className="text-base font-bold text-gray-900">{exam.exam_cycle.cycle_type}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Course Outcomes</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {courseOutcomes.length > 0 ? courseOutcomes.map(co => (
                                    <span key={co.id} className="text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100">
                                        {co.co_code}
                                    </span>
                                )) : <span className="text-sm text-gray-400 italic">No COs defined</span>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Marks</p>
                            <h3 className="text-2xl font-black text-gray-900 flex items-baseline gap-1">
                                {targetStructure ? targetStructure.max_marks : '-'} <span className="text-sm font-medium text-gray-500">/ {targetStructure ? targetStructure.max_marks : '-'}</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-slideDown">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-slideDown">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <p className="text-sm font-medium text-green-700">{success}</p>
                    </div>
                )}

                {/* Editor Surface */}
                <div className="space-y-8">
                    {targetStructure ? (
                        <>
                            {targetStructure.components && targetStructure.components.length > 0 ? (
                                targetStructure.components.map(comp => renderStructure(comp))
                            ) : (
                                renderStructure(targetStructure)
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <HelpCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Configuration Not Found</h3>
                            <p className="text-gray-500 mt-2">No standard structure found for this exam type.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
