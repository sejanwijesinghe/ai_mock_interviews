// "use client";
//
// import Image from "next/image";
// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
//
// import { cn } from "@/lib/utils";
// import { vapi } from "@/lib/vapi.sdk";
// import { interviewer, interviewGenerator } from "@/constants";
// import { createFeedback, updateInterviewWithQuestions } from "@/lib/actions/general.action";
//
// enum CallStatus {
//     INACTIVE = "INACTIVE",
//     CONNECTING = "CONNECTING",
//     ACTIVE = "ACTIVE",
//     FINISHED = "FINISHED",
// }
//
// interface SavedMessage {
//     role: "user" | "system" | "assistant";
//     content: string;
// }
//
// interface CollectedInfo {
//     role?: string;
//     level?: string;
//     type?: string;
//     techstack?: string;
//     amount?: string;
// }
//
// const Agent = ({
//                    userName,
//                    userId,
//                    interviewId,
//                    feedbackId,
//                    type,
//                    questions,
//                    profileImage,
//                }: AgentProps) => {
//     const router = useRouter();
//     const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
//     const [messages, setMessages] = useState<SavedMessage[]>([]);
//     const [isSpeaking, setIsSpeaking] = useState(false);
//     const [lastMessage, setLastMessage] = useState<string>("");
//     const [interviewPhase, setInterviewPhase] = useState<"generation" | "interview">(
//         type === "generate" ? "generation" : "interview"
//     );
//     const [isGenerating, setIsGenerating] = useState(false);
//     const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({});
//     const hasProcessedGeneration = useRef(false);
//
//     // Analyze messages to extract interview parameters
//     const analyzeConversation = useCallback((messages: SavedMessage[]) => {
//         console.log("=== ANALYZING CONVERSATION ===");
//         console.log("Total messages:", messages.length);
//
//         const info: CollectedInfo = {};
//
//         for (let i = 0; i < messages.length - 1; i++) {
//             const currentMsg = messages[i];
//             const nextMsg = messages[i + 1];
//
//             if (currentMsg.role === "assistant" && nextMsg.role === "user") {
//                 const question = currentMsg.content.toLowerCase();
//                 const answer = nextMsg.content.trim();
//
//                 // More flexible pattern matching
//                 if ((question.includes("role") || question.includes("position") || question.includes("job")) && !info.role) {
//                     info.role = answer;
//                     console.log("Found role:", answer);
//                 }
//                 else if ((question.includes("level") || question.includes("experience") || question.includes("seniority")) && !info.level) {
//                     const levelMatch = answer.match(/\b(junior|mid|middle|senior|entry|lead|staff)\b/i);
//                     if (levelMatch) {
//                         let level = levelMatch[1].toLowerCase();
//                         if (level === "middle") level = "mid";
//                         info.level = level;
//                         console.log("Found level:", info.level);
//                     } else if (answer.toLowerCase().includes("junior")) {
//                         info.level = "junior";
//                     } else if (answer.toLowerCase().includes("senior")) {
//                         info.level = "senior";
//                     } else if (answer.toLowerCase().includes("mid")) {
//                         info.level = "mid";
//                     }
//                 }
//                 else if ((question.includes("type of interview") || question.includes("kind of interview") || (question.includes("interview") && question.includes("prefer"))) && !info.type) {
//                     const typeMatch = answer.match(/\b(technical|behavioral|mixed|both)\b/i);
//                     if (typeMatch) {
//                         let type = typeMatch[1].toLowerCase();
//                         if (type === "both") type = "mixed";
//                         info.type = type;
//                         console.log("Found type:", info.type);
//                     }
//                 }
//                 else if ((question.includes("technolog") || question.includes("stack") || question.includes("language") || question.includes("framework")) && !info.techstack) {
//                     info.techstack = answer;
//                     console.log("Found tech stack:", answer);
//                 }
//                 else if ((question.includes("how many") || question.includes("number") || question.includes("questions")) && !info.amount) {
//                     const amountMatch = answer.match(/\b(\d+)\b/);
//                     if (amountMatch) {
//                         info.amount = amountMatch[1];
//                         console.log("Found amount:", info.amount);
//                     }
//                 }
//             }
//         }
//
//         console.log("Final extracted info:", info);
//         return info;
//     }, []);
//
//     // Check if we have complete info - now shows actual values
//     const hasCompleteInfo = useCallback((info: CollectedInfo) => {
//         const isComplete = !!(
//             info.role &&
//             info.level &&
//             info.type &&
//             info.techstack &&
//             info.amount
//         );
//
//         console.log("Info completeness check:", {
//             role: info.role || "❌ MISSING",
//             level: info.level || "❌ MISSING",
//             type: info.type || "❌ MISSING",
//             techstack: info.techstack || "❌ MISSING",
//             amount: info.amount || "❌ MISSING",
//             isComplete
//         });
//
//         return isComplete;
//     }, []);
//
//     // Handle question generation
//     const generateAndStartInterview = useCallback(async (info: CollectedInfo) => {
//         if (isGenerating || hasProcessedGeneration.current) {
//             console.log("Already processing generation, skipping...");
//             return;
//         }
//
//         if (!hasCompleteInfo(info)) {
//             console.log("Incomplete info, waiting for more responses...");
//             return;
//         }
//
//         console.log("=== GENERATING INTERVIEW ===");
//         console.log("Using info:", info);
//
//         hasProcessedGeneration.current = true;
//         setIsGenerating(true);
//
//         try {
//             // Stop the current call
//             console.log("Stopping generation call...");
//             vapi.stop();
//             setCallStatus(CallStatus.FINISHED);
//
//             // Show generating message
//             await new Promise(resolve => setTimeout(resolve, 500));
//
//             // Generate questions using AI
//             console.log("Calling API to generate questions...");
//             const response = await fetch("/api/generate-questions", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     role: info.role,
//                     level: info.level,
//                     type: info.type,
//                     techstack: info.techstack,
//                     amount: parseInt(info.amount!) || 7,
//                 }),
//             });
//
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || "Failed to generate questions");
//             }
//
//             const data = await response.json();
//             console.log("API Response:", data);
//
//             if (!data.success || !data.questions || data.questions.length === 0) {
//                 throw new Error("No questions were generated");
//             }
//
//             console.log("Generated questions:", data.questions);
//
//             // Update interview in database
//             console.log("Updating interview in database...");
//             const updated = await updateInterviewWithQuestions({
//                 interviewId,
//                 role: info.role!,
//                 level: info.level!,
//                 type: info.type!,
//                 techstack: info.techstack!.split(",").map((t: string) => t.trim()),
//                 questions: data.questions,
//             });
//
//             if (!updated) {
//                 throw new Error("Failed to update interview in database");
//             }
//
//             console.log("Interview updated successfully!");
//
//             // Switch to interview phase
//             setInterviewPhase("interview");
//             setMessages([]); // Clear messages from generation phase
//
//             // Start the interview after a brief delay
//             console.log("Starting interview phase in 3 seconds...");
//             await new Promise(resolve => setTimeout(resolve, 3000));
//
//             await startInterviewPhase(data.questions);
//
//         } catch (error) {
//             console.error("=== ERROR GENERATING INTERVIEW ===");
//             console.error("Error details:", error);
//             alert(`Failed to generate interview: ${error instanceof Error ? error.message : "Unknown error"}`);
//             setCallStatus(CallStatus.INACTIVE);
//             setInterviewPhase("generation");
//             hasProcessedGeneration.current = false;
//         } finally {
//             setIsGenerating(false);
//         }
//     }, [interviewId, isGenerating, hasCompleteInfo]);
//
//     // Start the actual interview with generated questions
//     const startInterviewPhase = async (questionsToAsk: string[]) => {
//         console.log("=== STARTING INTERVIEW PHASE ===");
//         setCallStatus(CallStatus.CONNECTING);
//
//         const formattedQuestions = questionsToAsk
//             .map((question, index) => `${index + 1}. ${question}`)
//             .join("\n");
//
//         console.log("Formatted questions:", formattedQuestions);
//
//         try {
//             await vapi.start(interviewer, {
//                 variableValues: {
//                     questions: formattedQuestions,
//                 },
//             });
//             console.log("Interview started successfully!");
//         } catch (error) {
//             console.error("Failed to start interview:", error);
//             alert(`Failed to start the interview: ${error}`);
//             setCallStatus(CallStatus.INACTIVE);
//         }
//     };
//
//     useEffect(() => {
//         const onCallStart = () => {
//             console.log("=== CALL STARTED ===");
//             setCallStatus(CallStatus.ACTIVE);
//         };
//
//         const onCallEnd = () => {
//             console.log("=== CALL ENDED ===");
//             setCallStatus(CallStatus.FINISHED);
//         };
//
//         const onMessage = (message: any) => {
//             console.log("=== MESSAGE RECEIVED ===", message.type);
//
//             // Log the full message when we see tool-calls to debug
//             if (message.type === "tool-calls") {
//                 console.log("TOOL CALLS MESSAGE:", JSON.stringify(message, null, 2));
//             }
//
//             // Handle function calls - VAPI might send different message types
//             // Try multiple possible formats
//             if (message.type === "function-call" || message.type === "tool-calls") {
//                 console.log("Function/tool call detected!");
//                 console.log("Full message:", message);
//
//                 // Handle different possible structures
//                 let params = null;
//
//                 if (message.functionCall?.name === "generate_interview") {
//                     params = message.functionCall.parameters;
//                 } else if (message.toolCalls) {
//                     // VAPI sends tool calls as an array
//                     const generateCall = message.toolCalls.find(
//                         (call: any) => call.function?.name === "generate_interview"
//                     );
//                     if (generateCall) {
//                         // CRITICAL FIX: arguments is already an object, not a JSON string
//                         const args = generateCall.function.arguments;
//                         params = typeof args === 'string' ? JSON.parse(args) : args;
//                     }
//                 } else if (message.toolCallList) {
//                     const generateCall = message.toolCallList.find(
//                         (call: any) => call.function?.name === "generate_interview"
//                     );
//                     if (generateCall) {
//                         const args = generateCall.function.arguments;
//                         params = typeof args === 'string' ? JSON.parse(args) : args;
//                     }
//                 }
//
//                 if (params) {
//                     console.log("✅ Successfully extracted parameters:", params);
//                     setCollectedInfo(params);
//                     generateAndStartInterview(params);
//                 } else {
//                     console.warn("❌ Could not extract parameters from tool call");
//                 }
//             }
//
//             // Handle transcripts
//             if (message.type === "transcript" && message.transcriptType === "final") {
//                 console.log("Transcript:", message.role, "-", message.transcript);
//                 const newMessage = { role: message.role, content: message.transcript };
//                 setMessages((prev) => [...prev, newMessage]);
//             }
//         };
//
//         const onSpeechStart = () => {
//             setIsSpeaking(true);
//         };
//
//         const onSpeechEnd = () => {
//             setIsSpeaking(false);
//         };
//
//         const onError = (error: Error) => {
//             console.error("=== VAPI ERROR ===");
//             console.error(error);
//             setCallStatus(CallStatus.INACTIVE);
//         };
//
//         vapi.on("call-start", onCallStart);
//         vapi.on("call-end", onCallEnd);
//         vapi.on("message", onMessage);
//         vapi.on("speech-start", onSpeechStart);
//         vapi.on("speech-end", onSpeechEnd);
//         vapi.on("error", onError);
//
//         return () => {
//             vapi.off("call-start", onCallStart);
//             vapi.off("call-end", onCallEnd);
//             vapi.off("message", onMessage);
//             vapi.off("speech-start", onSpeechStart);
//             vapi.off("speech-end", onSpeechEnd);
//             vapi.off("error", onError);
//         };
//     }, [generateAndStartInterview]);
//
//     // Monitor messages for generation phase
//     useEffect(() => {
//         if (interviewPhase === "generation" && messages.length >= 10 && !hasProcessedGeneration.current) {
//             console.log("Checking if we have enough info to generate...");
//             console.log("Current message count:", messages.length);
//
//             const info = analyzeConversation(messages);
//             setCollectedInfo(info);
//
//             if (hasCompleteInfo(info)) {
//                 console.log("✅ Complete info detected, starting generation...");
//                 generateAndStartInterview(info);
//             } else {
//                 console.log("❌ Still collecting info. Current values:", {
//                     role: info.role || "not collected yet",
//                     level: info.level || "not collected yet",
//                     type: info.type || "not collected yet",
//                     techstack: info.techstack || "not collected yet",
//                     amount: info.amount || "not collected yet"
//                 });
//             }
//         }
//     }, [messages, interviewPhase, analyzeConversation, generateAndStartInterview, hasCompleteInfo]);
//
//     useEffect(() => {
//         if (messages.length > 0) {
//             setLastMessage(messages[messages.length - 1].content);
//         }
//
//         const handleGenerateFeedback = async (messages: SavedMessage[]) => {
//             if (!interviewId || !userId) {
//                 console.error("Missing interviewId or userId");
//                 router.push("/");
//                 return;
//             }
//
//             console.log("=== GENERATING FEEDBACK ===");
//
//             const { success, feedbackId: id } = await createFeedback({
//                 interviewId,
//                 userId,
//                 transcript: messages,
//                 feedbackId,
//             });
//
//             if (success && id) {
//                 console.log("Feedback created successfully!");
//                 router.push(`/interview/${interviewId}/feedback`);
//             } else {
//                 console.log("Error saving feedback");
//                 router.push("/");
//             }
//         };
//
//         // Generate feedback only for interview phase
//         if (
//             callStatus === CallStatus.FINISHED &&
//             messages.length > 0 &&
//             interviewPhase === "interview"
//         ) {
//             handleGenerateFeedback(messages);
//         }
//     }, [messages, callStatus, feedbackId, interviewId, router, userId, interviewPhase]);
//
//     const handleCall = async () => {
//         console.log("=== STARTING CALL ===");
//         console.log("Type:", type);
//         console.log("Phase:", interviewPhase);
//
//         setCallStatus(CallStatus.CONNECTING);
//         hasProcessedGeneration.current = false;
//
//         try {
//             if (type === "generate" && interviewPhase === "generation") {
//                 // Start with the interview generator
//                 console.log("Starting interview generation assistant...");
//                 await vapi.start(interviewGenerator);
//             } else {
//                 // Start with predefined questions (custom interview)
//                 const formattedQuestions = questions && questions.length > 0
//                     ? questions.map((q, i) => `${i + 1}. ${q}`).join("\n")
//                     : "1. Tell me about yourself\n2. What are your strengths?\n3. Why do you want this position?";
//
//                 console.log("Starting interview with predefined questions");
//                 await vapi.start(interviewer, {
//                     variableValues: {
//                         questions: formattedQuestions,
//                     },
//                 });
//             }
//         } catch (error) {
//             console.error("Failed to start call:", error);
//             alert(`Failed to start: ${error}`);
//             setCallStatus(CallStatus.INACTIVE);
//         }
//     };
//
//     const handleDisconnect = () => {
//         console.log("=== DISCONNECTING ===");
//         setCallStatus(CallStatus.FINISHED);
//         vapi.stop();
//     };
//
//     return (
//         <>
//             <div className="call-view">
//                 <div className="card-interviewer">
//                     <div className="avatar">
//                         <Image
//                             src="/ai-avatar.png"
//                             alt="profile-image"
//                             width={65}
//                             height={54}
//                             className="object-cover"
//                         />
//                         {isSpeaking && <span className="animate-speak" />}
//                     </div>
//                     <h3>
//                         {interviewPhase === "generation"
//                             ? "AI Interview Generator"
//                             : "AI Interviewer"}
//                     </h3>
//                 </div>
//
//                 <div className="card-border">
//                     <div className="card-content">
//                         <Image
//                             src={profileImage || "/sejan.jpg"}
//                             alt="profile-image"
//                             width={120}
//                             height={120}
//                             className="rounded-full object-cover size-[120px]"
//                         />
//                         <h3>{userName}</h3>
//                     </div>
//                 </div>
//             </div>
//
//             {isGenerating && (
//                 <div className="w-full flex flex-col items-center gap-4">
//                     <p className="text-primary-200 animate-pulse text-lg font-semibold">
//                         Generating your personalized interview questions...
//                     </p>
//                     <p className="text-sm text-gray-400">
//                         Creating {collectedInfo.amount || 7} questions for {collectedInfo.level} {collectedInfo.role}
//                     </p>
//                 </div>
//             )}
//
//             {messages.length > 0 && !isGenerating && (
//                 <div className="transcript-border">
//                     <div className="transcript">
//                         <p
//                             key={lastMessage}
//                             className={cn(
//                                 "transition-opacity duration-500 opacity-0",
//                                 "animate-fadeIn opacity-100"
//                             )}
//                         >
//                             {lastMessage}
//                         </p>
//                     </div>
//                 </div>
//             )}
//
//             <div className="w-full flex justify-center">
//                 {callStatus !== "ACTIVE" ? (
//                     <button
//                         className="relative btn-call"
//                         onClick={handleCall}
//                         disabled={callStatus === CallStatus.CONNECTING || isGenerating}
//                     >
//                         <span
//                             className={cn(
//                                 "absolute animate-ping rounded-full opacity-75 bg-green-500 inset-0",
//                                 callStatus !== "CONNECTING" && !isGenerating && "hidden"
//                             )}
//                         />
//
//                         <span className="relative">
//                             {isGenerating
//                                 ? "Generating..."
//                                 : callStatus === "INACTIVE" || callStatus === "FINISHED"
//                                     ? interviewPhase === "generation"
//                                         ? "Start Interview Setup"
//                                         : "Start Interview"
//                                     : "Connecting..."}
//                         </span>
//                     </button>
//                 ) : (
//                     <button className="btn-disconnect" onClick={handleDisconnect}>
//                         {interviewPhase === "generation" ? "Cancel Setup" : "End Interview"}
//                     </button>
//                 )}
//             </div>
//         </>
//     );
// };
//
// export default Agent;


"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer, interviewGenerator } from "@/constants";
import { createFeedback, updateInterviewWithQuestions } from "@/lib/actions/general.action";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

interface CollectedInfo {
    role?: string;
    level?: string;
    type?: string;
    techstack?: string;
    amount?: string;
}

const Agent = ({
                   userName,
                   userId,
                   interviewId,
                   feedbackId,
                   type,
                   questions,
                   profileImage,
               }: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");
    const [interviewPhase, setInterviewPhase] = useState<"generation" | "interview">(
        type === "generate" ? "generation" : "interview"
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({});
    const hasProcessedGeneration = useRef(false);

    const hasGeneratedFeedback = useRef(false);

    // Analyze messages to extract interview parameters
    const analyzeConversation = useCallback((messages: SavedMessage[]) => {
        console.log("=== ANALYZING CONVERSATION ===");
        console.log("Total messages:", messages.length);

        const info: CollectedInfo = {};

        for (let i = 0; i < messages.length - 1; i++) {
            const currentMsg = messages[i];
            const nextMsg = messages[i + 1];

            if (currentMsg.role === "assistant" && nextMsg.role === "user") {
                const question = currentMsg.content.toLowerCase();
                const answer = nextMsg.content.trim();

                // More flexible pattern matching
                if ((question.includes("role") || question.includes("position") || question.includes("job")) && !info.role) {
                    info.role = answer;
                    console.log("Found role:", answer);
                }
                else if ((question.includes("level") || question.includes("experience") || question.includes("seniority")) && !info.level) {
                    const levelMatch = answer.match(/\b(junior|mid|middle|senior|entry|lead|staff)\b/i);
                    if (levelMatch) {
                        let level = levelMatch[1].toLowerCase();
                        if (level === "middle") level = "mid";
                        info.level = level;
                        console.log("Found level:", info.level);
                    } else if (answer.toLowerCase().includes("junior")) {
                        info.level = "junior";
                    } else if (answer.toLowerCase().includes("senior")) {
                        info.level = "senior";
                    } else if (answer.toLowerCase().includes("mid")) {
                        info.level = "mid";
                    }
                }
                else if ((question.includes("type of interview") || question.includes("kind of interview") || (question.includes("interview") && question.includes("prefer"))) && !info.type) {
                    const typeMatch = answer.match(/\b(technical|behavioral|mixed|both)\b/i);
                    if (typeMatch) {
                        let type = typeMatch[1].toLowerCase();
                        if (type === "both") type = "mixed";
                        info.type = type;
                        console.log("Found type:", info.type);
                    }
                }
                else if ((question.includes("technolog") || question.includes("stack") || question.includes("language") || question.includes("framework")) && !info.techstack) {
                    info.techstack = answer;
                    console.log("Found tech stack:", answer);
                }
                else if ((question.includes("how many") || question.includes("number") || question.includes("questions")) && !info.amount) {
                    const amountMatch = answer.match(/\b(\d+)\b/);
                    if (amountMatch) {
                        info.amount = amountMatch[1];
                        console.log("Found amount:", info.amount);
                    }
                }
            }
        }

        console.log("Final extracted info:", info);
        return info;
    }, []);

    // Check if we have complete info - now shows actual values
    const hasCompleteInfo = useCallback((info: CollectedInfo) => {
        const isComplete = !!(
            info.role &&
            info.level &&
            info.type &&
            info.techstack &&
            info.amount
        );

        console.log("Info completeness check:", {
            role: info.role || "❌ MISSING",
            level: info.level || "❌ MISSING",
            type: info.type || "❌ MISSING",
            techstack: info.techstack || "❌ MISSING",
            amount: info.amount || "❌ MISSING",
            isComplete
        });

        return isComplete;
    }, []);

    // Handle question generation
    const generateAndStartInterview = useCallback(async (info: CollectedInfo) => {
        if (isGenerating || hasProcessedGeneration.current) {
            console.log("Already processing generation, skipping...");
            return;
        }

        if (!hasCompleteInfo(info)) {
            console.log("Incomplete info, waiting for more responses...");
            return;
        }

        console.log("=== GENERATING INTERVIEW ===");
        console.log("Using info:", info);

        hasProcessedGeneration.current = true;
        setIsGenerating(true);

        try {
            // Stop the current call
            console.log("Stopping generation call...");
            vapi.stop();
            setCallStatus(CallStatus.FINISHED);

            // Show generating message
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate questions using AI
            console.log("Calling API to generate questions...");
            const response = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: info.role,
                    level: info.level,
                    type: info.type,
                    techstack: info.techstack,
                    amount: parseInt(info.amount!) || 7,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate questions");
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (!data.success || !data.questions || data.questions.length === 0) {
                throw new Error("No questions were generated");
            }

            console.log("Generated questions:", data.questions);

            // Update interview in database
            console.log("Updating interview in database...");
            const updated = await updateInterviewWithQuestions({
                interviewId,
                role: info.role!,
                level: info.level!,
                type: info.type!,
                techstack: info.techstack!.split(",").map((t: string) => t.trim()),
                questions: data.questions,
            });

            if (!updated) {
                throw new Error("Failed to update interview in database");
            }

            console.log("Interview updated successfully!");

            // Switch to interview phase
            setInterviewPhase("interview");
            // DON'T clear messages - let the new interview add to them
            // OR clear them AFTER the phase switch so the useEffect doesn't trigger prematurely
            console.log("📋 Keeping generation messages:", messages.length);

            // Start the interview after a brief delay
            console.log("Starting interview phase in 3 seconds...");
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Clear messages right before starting the new interview
            setMessages([]);
            console.log("🗑️ Cleared generation messages, starting fresh interview");

            await startInterviewPhase(data.questions);

        } catch (error) {
            console.error("=== ERROR GENERATING INTERVIEW ===");
            console.error("Error details:", error);
            alert(`Failed to generate interview: ${error instanceof Error ? error.message : "Unknown error"}`);
            setCallStatus(CallStatus.INACTIVE);
            setInterviewPhase("generation");
            hasProcessedGeneration.current = false;
        } finally {
            setIsGenerating(false);
        }
    }, [interviewId, isGenerating, hasCompleteInfo]);

    // Start the actual interview with generated questions
    const startInterviewPhase = async (questionsToAsk: string[]) => {
        console.log("=== STARTING INTERVIEW PHASE ===");
        console.log("📝 Questions to ask:", questionsToAsk);

        setCallStatus(CallStatus.CONNECTING);
        setInterviewPhase("interview"); // Make sure this is set!
        console.log("✅ Interview phase set to: interview");

        const formattedQuestions = questionsToAsk
            .map((question, index) => `${index + 1}. ${question}`)
            .join("\n");

        console.log("Formatted questions:", formattedQuestions);

        try {
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
            console.log("✅ Interview started successfully!");
        } catch (error) {
            console.error("❌ Failed to start interview:", error);
            alert(`Failed to start the interview: ${error}`);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    useEffect(() => {
        const onCallStart = () => {
            console.log("=== CALL STARTED ===");
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            console.log("=== CALL ENDED ===");
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: any) => {
            console.log("=== MESSAGE RECEIVED ===", message.type);

            // Log the full message when we see tool-calls to debug
            if (message.type === "tool-calls") {
                console.log("TOOL CALLS MESSAGE:", JSON.stringify(message, null, 2));
            }

            // Handle function calls - VAPI might send different message types
            // Try multiple possible formats
            if (message.type === "function-call" || message.type === "tool-calls") {
                console.log("Function/tool call detected!");
                console.log("Full message:", message);

                // Handle different possible structures
                let params = null;

                if (message.functionCall?.name === "generate_interview") {
                    params = message.functionCall.parameters;
                } else if (message.toolCalls) {
                    // VAPI sends tool calls as an array
                    const generateCall = message.toolCalls.find(
                        (call: any) => call.function?.name === "generate_interview"
                    );
                    if (generateCall) {
                        // CRITICAL FIX: arguments is already an object, not a JSON string
                        const args = generateCall.function.arguments;
                        params = typeof args === 'string' ? JSON.parse(args) : args;
                    }
                } else if (message.toolCallList) {
                    const generateCall = message.toolCallList.find(
                        (call: any) => call.function?.name === "generate_interview"
                    );
                    if (generateCall) {
                        const args = generateCall.function.arguments;
                        params = typeof args === 'string' ? JSON.parse(args) : args;
                    }
                }

                if (params) {
                    console.log("✅ Successfully extracted parameters:", params);
                    setCollectedInfo(params);
                    generateAndStartInterview(params);
                } else {
                    console.warn("❌ Could not extract parameters from tool call");
                }
            }

            // Handle transcripts
            if (message.type === "transcript" && message.transcriptType === "final") {
                console.log("Transcript:", message.role, "-", message.transcript);
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => {
            setIsSpeaking(true);
        };

        const onSpeechEnd = () => {
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.error("=== VAPI ERROR ===");
            console.error(error);
            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, [generateAndStartInterview]);

    // Monitor messages for generation phase
    useEffect(() => {
        if (interviewPhase === "generation" && messages.length >= 10 && !hasProcessedGeneration.current) {
            console.log("Checking if we have enough info to generate...");
            console.log("Current message count:", messages.length);

            const info = analyzeConversation(messages);
            setCollectedInfo(info);

            if (hasCompleteInfo(info)) {
                console.log("✅ Complete info detected, starting generation...");
                generateAndStartInterview(info);
            } else {
                console.log("❌ Still collecting info. Current values:", {
                    role: info.role || "not collected yet",
                    level: info.level || "not collected yet",
                    type: info.type || "not collected yet",
                    techstack: info.techstack || "not collected yet",
                    amount: info.amount || "not collected yet"
                });
            }
        }
    }, [messages, interviewPhase, analyzeConversation, generateAndStartInterview, hasCompleteInfo]);

    hasGeneratedFeedback.current = false;

// 3. Replace the feedback useEffect (around line 340) with this:

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async (messages: SavedMessage[]) => {
            if (!interviewId || !userId) {
                console.error("Missing interviewId or userId");
                router.push("/");
                return;
            }

            console.log("=== GENERATING FEEDBACK ===");
            console.log("Messages count:", messages.length);

            try {
                const { success, feedbackId: id } = await createFeedback({
                    interviewId,
                    userId,
                    transcript: messages,
                    feedbackId,
                });

                if (success && id) {
                    console.log("✅ Feedback created successfully!");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    router.push(`/interview/${interviewId}/feedback`);
                } else {
                    console.error("❌ Error saving feedback");
                    alert("Failed to generate feedback. Please try again.");
                    router.push("/");
                }
            } catch (error) {
                console.error("❌ Exception while creating feedback:", error);
                alert("An error occurred while generating feedback.");
                router.push("/");
            }
        };

        // FIXED CONDITIONS: More strict checking with duplicate prevention
        if (
            callStatus === CallStatus.FINISHED &&
            messages.length > 0 &&
            interviewPhase === "interview" &&
            !isGenerating && // Don't generate if still in generation process
            !hasGeneratedFeedback.current && // Prevent duplicate generation
            (type !== "generate" || hasProcessedGeneration.current) // For generated interviews, ensure generation is complete
        ) {
            console.log("🔍 All conditions met for feedback generation");
            hasGeneratedFeedback.current = true; // Mark as generated
            handleGenerateFeedback(messages);
        }
    }, [messages, callStatus, feedbackId, interviewId, router, userId, interviewPhase, isGenerating, type]);

    const handleCall = async () => {
        console.log("=== STARTING CALL ===");
        console.log("Type:", type);
        console.log("Phase:", interviewPhase);

        setCallStatus(CallStatus.CONNECTING);
        hasProcessedGeneration.current = false;

        try {
            if (type === "generate" && interviewPhase === "generation") {
                // Start with the interview generator
                console.log("Starting interview generation assistant...");
                await vapi.start(interviewGenerator);
            } else {
                // Start with predefined questions (custom interview)
                const formattedQuestions = questions && questions.length > 0
                    ? questions.map((q, i) => `${i + 1}. ${q}`).join("\n")
                    : "1. Tell me about yourself\n2. What are your strengths?\n3. Why do you want this position?";

                console.log("Starting interview with predefined questions");
                await vapi.start(interviewer, {
                    variableValues: {
                        questions: formattedQuestions,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to start call:", error);
            alert(`Failed to start: ${error}`);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = () => {
        console.log("=== DISCONNECTING ===");
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/r2.png"
                            alt="profile-image"
                            width={100}
                            height={100}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>
                        {interviewPhase === "generation"
                            ? "AI Interview Generator"
                            : "AI Interviewer"}
                    </h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src={profileImage || "/sejan.jpg"}
                            alt="profile-image"
                            width={120}
                            height={120}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {isGenerating && (
                <div className="w-full flex flex-col items-center gap-4">
                    <p className="text-primary-200 animate-pulse text-lg font-semibold">
                        Generating your personalized interview questions...
                    </p>
                    <p className="text-sm text-gray-400">
                        Creating {collectedInfo.amount || 7} questions for {collectedInfo.level} {collectedInfo.role}
                    </p>
                </div>
            )}

            {messages.length > 0 && !isGenerating && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-8">
                {callStatus !== "ACTIVE" ? (
                    <button
                        className="relative btn-call"
                        onClick={handleCall}
                        disabled={callStatus === CallStatus.CONNECTING || isGenerating}
                    >
                        <span
                            className={cn(
                                "absolute animate-ping rounded-full opacity-75 bg-green-500 inset-0",
                                callStatus !== "CONNECTING" && !isGenerating && "hidden"
                            )}
                        />

                        <span className="relative">
                            {isGenerating
                                ? "Generating..."
                                : callStatus === "INACTIVE" || callStatus === "FINISHED"
                                    ? interviewPhase === "generation"
                                        ? "Start Interview Setup"
                                        : "Start Interview"
                                    : "Connecting..."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        {interviewPhase === "generation" ? "Cancel Setup" : "End Interview"}
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;