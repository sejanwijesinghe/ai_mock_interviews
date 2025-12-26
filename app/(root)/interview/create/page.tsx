"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const interviewSchema = z.object({
    role: z.string().min(3, "Role must be at least 3 characters"),
    type: z.enum(["technical", "behavioral", "mixed"], {
        required_error: "Please select an interview type",
    }),
    techstack: z.array(z.string()).optional(),
    questions: z.array(z.string()).min(1, "Add at least one question"),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

const POPULAR_TECH = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Git",
];

const SAMPLE_QUESTIONS = {
    technical: [
        "Explain the difference between var, let, and const in JavaScript",
        "What is the virtual DOM and how does it work?",
        "Describe how you would optimize a slow database query",
        "What are the principles of RESTful API design?",
    ],
    behavioral: [
        "Tell me about a time you faced a challenging project deadline",
        "How do you handle disagreements with team members?",
        "Describe a situation where you had to learn a new technology quickly",
        "What's your approach to receiving constructive criticism?",
    ],
    mixed: [
        "Walk me through a recent project you're proud of",
        "How do you stay updated with new technologies?",
        "Describe your problem-solving process when debugging",
        "Tell me about a time you improved team efficiency",
    ],
};

export default function CustomInterviewForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [techInput, setTechInput] = useState("");
    const [questionInput, setQuestionInput] = useState("");
    const [selectedTech, setSelectedTech] = useState<string[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm<InterviewFormData>({
        resolver: zodResolver(interviewSchema),
        defaultValues: {
            techstack: [],
            questions: [],
        },
    });

    const interviewType = watch("type");

    const addTech = (tech: string) => {
        const trimmed = tech.trim();
        if (trimmed && !selectedTech.includes(trimmed)) {
            const updated = [...selectedTech, trimmed];
            setSelectedTech(updated);
            setValue("techstack", updated);
            setTechInput("");
        }
    };

    const removeTech = (tech: string) => {
        const updated = selectedTech.filter((t) => t !== tech);
        setSelectedTech(updated);
        setValue("techstack", updated);
    };

    const addQuestion = () => {
        const trimmed = questionInput.trim();
        if (trimmed && !questions.includes(trimmed)) {
            const updated = [...questions, trimmed];
            setQuestions(updated);
            setValue("questions", updated);
            setQuestionInput("");
        }
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
        setValue("questions", updated);
    };

    const addSampleQuestion = (question: string) => {
        if (!questions.includes(question)) {
            const updated = [...questions, question];
            setQuestions(updated);
            setValue("questions", updated);
        }
    };

    const onSubmit = async (data: InterviewFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/interviews/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    userId,
                    techstack: selectedTech,
                    questions,
                }),
            });

            const result = await response.json();

            if (result.success && result.interviewId) {
                toast.success("Interview created successfully!");
                router.push(`/interview/${result.interviewId}`);
            } else {
                toast.error("Failed to create interview");
            }
        } catch (error) {
            console.error("Error creating interview:", error);
            toast.error("An error occurred while creating the interview");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create Custom Interview</h1>
                <p className="text-gray-600">
                    Design your own interview with specific role, technologies, and questions
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Role Input */}
                <div className="space-y-2">
                    <label className="text-lg font-semibold">Role / Position</label>
                    <input
                        {...register("role")}
                        type="text"
                        placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.role && (
                        <p className="text-red-500 text-sm">{errors.role.message}</p>
                    )}
                </div>

                {/* Interview Type */}
                <div className="space-y-2">
                    <label className="text-lg font-semibold">Interview Type</label>
                    <div className="grid grid-cols-3 gap-4">
                        {["technical", "behavioral", "mixed"].map((type) => (
                            <label
                                key={type}
                                className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                                    interviewType === type
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:border-gray-400"
                                }
                `}
                            >
                                <input
                                    {...register("type")}
                                    type="radio"
                                    value={type}
                                    className="sr-only"
                                />
                                <span className="font-medium capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                    {errors.type && (
                        <p className="text-red-500 text-sm">{errors.type.message}</p>
                    )}
                </div>

                {/* Tech Stack */}
                <div className="space-y-3">
                    <label className="text-lg font-semibold">Tech Stack (Optional)</label>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech(techInput))}
                            placeholder="Add technology or skill"
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => addTech(techInput)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                        >
                            <Plus size={20} /> Add
                        </button>
                    </div>

                    {/* Popular Tech Stack */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Popular technologies:</p>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_TECH.map((tech) => (
                                <button
                                    key={tech}
                                    type="button"
                                    onClick={() => addTech(tech)}
                                    disabled={selectedTech.includes(tech)}
                                    className={`
                    px-3 py-1 text-sm rounded-full border transition-all
                    ${
                                        selectedTech.includes(tech)
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white hover:bg-blue-50 hover:border-blue-500"
                                    }
                  `}
                                >
                                    {tech}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Tech Stack */}
                    {selectedTech.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                            {selectedTech.map((tech) => (
                                <span
                                    key={tech}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                                >
                  {tech}
                                    <button
                                        type="button"
                                        onClick={() => removeTech(tech)}
                                        className="hover:text-blue-600"
                                    >
                    <X size={16} />
                  </button>
                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Questions */}
                <div className="space-y-3">
                    <label className="text-lg font-semibold">Interview Questions</label>

                    <div className="flex gap-2">
            <textarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        addQuestion();
                    }
                }}
                placeholder="Enter your interview question"
                rows={2}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                        >
                            <Plus size={20} /> Add
                        </button>
                    </div>

                    {/* Sample Questions */}
                    {interviewType && SAMPLE_QUESTIONS[interviewType] && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2">
                                Sample {interviewType} questions:
                            </p>
                            <div className="space-y-2">
                                {SAMPLE_QUESTIONS[interviewType].map((question, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => addSampleQuestion(question)}
                                        className="w-full text-left px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Questions List */}
                    {questions.length > 0 && (
                        <div className="space-y-2">
                            <p className="font-medium">Added Questions ({questions.length}):</p>
                            <div className="space-y-2">
                                {questions.map((question, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                    >
                    <span className="font-semibold text-gray-500 mt-1">
                      {index + 1}.
                    </span>
                                        <p className="flex-1">{question}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {errors.questions && (
                        <p className="text-red-500 text-sm">{errors.questions.message}</p>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || questions.length === 0}
                        className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Creating...
                            </>
                        ) : (
                            "Create Interview"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}