import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getAssignedExams,
    updatePaperFormat,
} from "../../services/examCycleService";
import { getCourseOutcomes } from "../../services/courseOutcomeService";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

export default function PaperFormatEditor() {
    const { timetableId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [courseOutcomes, setCourseOutcomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form State for the new structure
    // structure: { components: [ { component_id, is_checked, sections: [...], max_marks } ] }
    // We will maintain a local state mapping component_id to its configuration
    const [componentsConfig, setComponentsConfig] = useState({});

    useEffect(() => {
        loadExamDetails();
    }, [timetableId]);

    const loadExamDetails = async () => {
        try {
            const response = await getAssignedExams();
            const foundExam = response.data.data.find((e) => e.id === timetableId);

            if (foundExam) {
                setExam(foundExam);

                // Fetch COs for this course
                try {
                    const coResponse = await getCourseOutcomes(foundExam.course_id);
                    setCourseOutcomes(coResponse.data.data || []);
                } catch (coErr) {
                    console.error("Error fetching COs:", coErr);
                    // Don't block loading, just log error
                }

                // Initialize state from existing format or fetch default from cycle structure
                if (foundExam.paper_format && foundExam.paper_format.components) {
                    // Transform array back to object keyed by component_id for easier editing
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

    // Helper to initialize a component config if it doesn't exist
    const getComponentState = (compId, maxMarks) => {
        return componentsConfig[compId] || {
            component_id: compId,
            is_checked: false,
            max_marks: maxMarks,
            sections: []
        };
    };

    const updateComponentState = (compId, updates) => {
        setComponentsConfig(prev => ({
            ...prev,
            [compId]: { ...prev[compId], ...updates }
        }));
    };

    const handleComponentToggle = (compId, maxMarks) => {
        const current = getComponentState(compId, maxMarks);
        updateComponentState(compId, {
            ...current,
            is_checked: !current.is_checked,
            // Reset sections if unchecked? No, maybe keep them in memory unless explicitly cleared, 
            // but the payload generator will strip them.
            // Requirement said: "If is_checked=false, sections MUST NOT exist". 
            // We handle this at payload generation time.
        });
    };

    // --- Section Management ---
    const addSection = (compId) => {
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
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections.splice(sectionIndex, 1);
        updateComponentState(compId, { sections: updatedSections });
    };

    const updateSectionField = (compId, sectionIndex, field, value) => {
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], [field]: value };
        updateComponentState(compId, { sections: updatedSections });
    };

    // --- Question Management ---
    const addQuestion = (compId, sectionIndex) => {
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
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex].questions.splice(qIndex, 1);
        updateComponentState(compId, { sections: updatedSections });
    };

    const updateQuestionField = (compId, sectionIndex, qIndex, field, value) => {
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        const question = updatedSections[sectionIndex].questions[qIndex];

        updatedSections[sectionIndex].questions[qIndex] = { ...question, [field]: value };

        // Auto-update parent max marks if it matches sum (Optional, user didn't ask but good UX)
        // But here we just update the specific field
        updateComponentState(compId, { sections: updatedSections });
    };

    // --- Sub-part Management ---
    const addSubPart = (compId, sectionIndex, qIndex) => {
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        const question = updatedSections[sectionIndex].questions[qIndex];

        // Initialize sub_parts if undefined
        if (!question.sub_parts) question.sub_parts = [];

        // Default label 1a, 1b etc logic is complex, just simple default for now
        const nextSubLabel = `${question.question_number}.${question.sub_parts.length + 1}`;

        question.sub_parts.push({
            question_number: nextSubLabel,
            max_marks: 0
        });

        updateComponentState(compId, { sections: updatedSections });
    };

    const removeSubPart = (compId, sectionIndex, qIndex, spIndex) => {
        const current = componentsConfig[compId];
        const updatedSections = [...current.sections];
        updatedSections[sectionIndex].questions[qIndex].sub_parts.splice(spIndex, 1);
        updateComponentState(compId, { sections: updatedSections });
    };

    const updateSubPartField = (compId, sectionIndex, qIndex, spIndex, field, value) => {
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
                // 1. Answer Constraint
                if (parseInt(section.questions_to_answer) > parseInt(section.total_questions)) {
                    errors.push(`[${comp.component_id} - ${section.section_id}] "Questions to answer" cannot exceed "Total questions".`);
                }

                section.questions.forEach((q, qIdx) => {
                    // 2. Sub-Part Rule
                    if (q.sub_parts && q.sub_parts.length > 0) {
                        const subTotal = q.sub_parts.reduce((sum, sp) => sum + (parseFloat(sp.max_marks || 0)), 0);
                        if (subTotal !== parseFloat(q.max_marks)) {
                            errors.push(`[${comp.component_id} - ${section.section_id} - Q${q.question_number}] Sum of sub-part marks (${subTotal}) must equal question max marks (${q.max_marks}).`);
                        }
                    } else {
                        // If no subparts, basic mark check? 
                        // User didn't specify separate rule for this, but implicitly marks should be > 0 usually
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
            setError(validationErrors.join(" ")); // Simple join for now, could be better UI
            setSaving(false);
            return;
        }

        try {
            // Construct Payload
            const payloadComponents = [];

            // We need to iterate over the *target structure* to ensure we capture defaults for unchecked ones correctly?
            // Or just iterate over our config state?
            // Let's iterate over our config state, assuming it captures everything users interacted with.
            // Better: Iterate over the discovered structure from exam cycle to ensure we don't miss anything,
            // but for now, let's rely on componentsConfig which we populate lazily or fully.
            // Actually, we should iterate the `targetStructure` to be safe, but `targetStructure` is local to render.
            // Let's use `componentsConfig`.

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

            await updatePaperFormat(timetableId, payload);
            setSuccess("Paper format saved successfully!");
            setTimeout(() => navigate("/faculty/exams"), 2000);
        } catch (err) {
            console.error("Save error:", err);
            setError(err.response?.data?.error || "Failed to save paper format.");
        } finally {
            setSaving(false);
        }
    };

    // Recursive helper to traverse Exam Cycle structure and render standard UI
    const renderStructure = (structNode) => {
        if (!structNode) return null;

        // If this node represents a leaf "Component" in the paper (like Part A, Part B), render the editor
        // Indication: It has no further sub-components OR it's explicitly marked as a paper component
        // Based on previous code: `(comp.components.length === 0 || comp.isExam)`

        const isLeafComponent = !structNode.components || structNode.components.length === 0;

        if (isLeafComponent) {
            const config = getComponentState(structNode.id, structNode.max_marks);
            // Ensure config exists in state if not already
            if (!componentsConfig[structNode.id]) {
                // Side-effect in render is bad. 
                // We should ideally init this in useEffect, but traversing cycle structure is hard there.
                // We'll just use the derived `config` object for rendering and `handleComponentToggle` will init state.
            }

            return (
                <div key={structNode.id} className="mb-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id={`check-${structNode.id}`}
                                checked={config.is_checked}
                                onChange={() => handleComponentToggle(structNode.id, structNode.max_marks)}
                                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor={`check-${structNode.id}`} className="font-bold text-lg text-gray-800">
                                {structNode.name} <span className="text-gray-500 text-base font-normal">({structNode.max_marks} Marks)</span>
                            </label>
                        </div>
                        {config.is_checked && (
                            <button
                                onClick={() => addSection(structNode.id)}
                                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Section
                            </button>
                        )}
                    </div>

                    {config.is_checked && (
                        <div className="space-y-6 pl-4 border-l-2 border-indigo-100 ml-2">
                            {config.sections?.map((section, sIdx) => (
                                <div key={sIdx} className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                                    <button
                                        onClick={() => removeSection(structNode.id, sIdx)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Section ID</label>
                                            <input
                                                type="text"
                                                value={section.section_id}
                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'section_id', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Total Questions</label>
                                            <input
                                                type="number"
                                                value={section.total_questions}
                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'total_questions', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Minimum Questions to be Answered</label>
                                            <input
                                                type="number"
                                                value={section.questions_to_answer}
                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'questions_to_answer', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Max Marks</label>
                                            <input
                                                type="number"
                                                value={section.max_marks}
                                                onChange={(e) => updateSectionField(structNode.id, sIdx, 'max_marks', e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    {/* Questions Table */}
                                    <div className="space-y-3">
                                        {section.questions.map((q, qIdx) => (
                                            <div key={qIdx} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-16">
                                                        <label className="block text-[10px] text-gray-400 uppercase">Q.No</label>
                                                        <input
                                                            type="text"
                                                            value={q.question_number}
                                                            onChange={(e) => updateQuestionField(structNode.id, sIdx, qIdx, 'question_number', e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded p-1"
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-[10px] text-gray-400 uppercase">Marks</label>
                                                        <input
                                                            type="number"
                                                            value={q.max_marks}
                                                            onChange={(e) => updateQuestionField(structNode.id, sIdx, qIdx, 'max_marks', e.target.value)}
                                                            className="w-full text-sm border-gray-300 rounded p-1"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="block text-[10px] text-gray-400 uppercase">CO</label>
                                                        {q.sub_parts && q.sub_parts.length > 0 ? (
                                                            <div className="text-xs text-gray-400 italic py-2">See sub-parts</div>
                                                        ) : (
                                                            <select
                                                                value={q.co_id}
                                                                onChange={(e) => updateQuestionField(structNode.id, sIdx, qIdx, 'co_id', e.target.value)}
                                                                className="w-full text-sm border-gray-300 rounded p-1"
                                                            >
                                                                <option value="">Select CO</option>
                                                                {courseOutcomes.map(co => (
                                                                    <option key={co.id} value={co.co_code}>{co.co_code}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>

                                                    <div className="flex-1"></div>

                                                    <button
                                                        onClick={() => addSubPart(structNode.id, sIdx, qIdx)}
                                                        className="mt-4 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        title="Add Sub-part"
                                                    >
                                                        <Plus className="w-3 h-3" /> Sub-part
                                                    </button>

                                                    <button
                                                        onClick={() => removeQuestion(structNode.id, sIdx, qIdx)}
                                                        className="mt-4 text-red-400 hover:text-red-600"
                                                        title="Remove Question"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Sub Parts Render */}
                                                {q.sub_parts && q.sub_parts.length > 0 && (
                                                    <div className="mt-2 ml-8 pl-3 border-l-2 border-gray-100 space-y-2">
                                                        {q.sub_parts.map((sp, spIdx) => (
                                                            <div key={spIdx} className="flex items-center gap-2">
                                                                <span className="text-gray-400 text-xs">↳</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="No."
                                                                    value={sp.question_number}
                                                                    onChange={(e) => updateSubPartField(structNode.id, sIdx, qIdx, spIdx, 'question_number', e.target.value)}
                                                                    className="w-16 text-xs border-gray-200 rounded p-1 bg-gray-50"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="Marks"
                                                                    value={sp.max_marks}
                                                                    onChange={(e) => updateSubPartField(structNode.id, sIdx, qIdx, spIdx, 'max_marks', e.target.value)}
                                                                    className="w-16 text-xs border-gray-200 rounded p-1 bg-gray-50"
                                                                />
                                                                <select
                                                                    value={sp.co_id || ""}
                                                                    onChange={(e) => updateSubPartField(structNode.id, sIdx, qIdx, spIdx, 'co_id', e.target.value)}
                                                                    className="w-20 text-xs border-gray-200 rounded p-1 bg-gray-50"
                                                                >
                                                                    <option value="">CO</option>
                                                                    {courseOutcomes.map(co => (
                                                                        <option key={co.id} value={co.co_code}>{co.co_code}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    onClick={() => removeSubPart(structNode.id, sIdx, qIdx, spIdx)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => addQuestion(structNode.id, sIdx)}
                                        className="mt-3 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-indigo-300 hover:text-indigo-500 flex justify-center items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Add Question
                                    </button>
                                </div>
                            ))}

                            {config.sections?.length === 0 && (
                                <div className="text-center py-6 text-gray-400 italic">
                                    No sections added. Click "Add Section" to start.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        // If not a leaf, recurse
        return (
            <div key={structNode.id} className="mt-4">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-2 pl-1 border-b border-gray-100 pb-1">
                    {structNode.name}
                </h4>
                <div className="pl-2">
                    {structNode.components?.map(child => renderStructure(child))}
                </div>
            </div>
        );
    };


    if (loading) return <div className="p-8 text-center text-gray-500">Loading exam details...</div>;
    if (!exam) return <div className="p-8 text-center text-red-500">Exam not found</div>;

    // Determine target structure to render based on Cycle Type e.g., "Semester End Exam"
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
        <div className="max-w-5xl mx-auto pb-20 pt-6 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Exams
            </button>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{exam.course.name}</h1>
                        <p className="text-indigo-100 mt-1 font-mono text-sm tracking-wide">{exam.course.code}</p>
                        <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/10">
                                {exam.course.course_type}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/10">
                                {exam.exam_cycle.cycle_type}
                            </span>
                        </div>
                    </div>
                    <div className="text-right bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <span className="block text-xs text-indigo-200 uppercase tracking-widest">Exam Date</span>
                        <span className="font-bold text-xl">{new Date(exam.exam_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 shadow-sm animate-fade-in">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Validation Error</h4>
                        <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{success}</span>
                </div>
            )}

            {/* Main Form Area */}
            <div className="space-y-8">
                {targetStructure ? (
                    <div>
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Question Paper Configuration</h2>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Total Max Marks: {targetStructure.max_marks}</span>
                        </div>

                        {/* We verify if the target structure is just a container like "Semester End Exam" with components (Part A/B)
                            or if it is the component itself.
                            If it has components, we render them. If not, we render it as a single component.
                         */}

                        {targetStructure.components && targetStructure.components.length > 0 ? (
                            targetStructure.components.map(comp => renderStructure(comp))
                        ) : (
                            renderStructure(targetStructure)
                        )}

                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg mb-2">No configuration found for this exam type.</p>
                        <p className="text-sm text-gray-400">Checked for: {exam.course.course_type} / {exam.exam_cycle.cycle_type}</p>
                    </div>
                )}
            </div>

            {/* Save Button Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10 flex justify-end gap-4 max-w-5xl mx-auto rounded-t-xl">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg font-medium"
                >
                    {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Configuration</>}
                </button>
            </div>
        </div>
    );
}
