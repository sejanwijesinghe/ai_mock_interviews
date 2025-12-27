"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        console.log("=== SERVER: Creating feedback ===");
        console.log("Interview ID:", interviewId);
        console.log("User ID:", userId);
        console.log("Transcript length:", transcript?.length);
        console.log("Existing feedback ID:", feedbackId);

        // Validate inputs
        if (!interviewId || !userId) {
            console.error("❌ Missing required parameters");
            return { success: false, error: "Missing interviewId or userId" };
        }

        if (!transcript || transcript.length === 0) {
            console.error("❌ Empty transcript");
            return { success: false, error: "Transcript is empty" };
        }

        console.log("✅ Validation passed, formatting transcript...");

        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        console.log("📝 Formatted transcript preview:");
        console.log(formattedTranscript.substring(0, 200) + "...");

        console.log("🤖 Calling OpenAI to generate feedback...");

        const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: feedbackSchema,
            prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
            system:
                "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        });

        console.log("✅ OpenAI response received");
        console.log("Total Score:", object.totalScore);
        console.log("Category Scores:", object.categoryScores?.length);
        console.log("Strengths:", object.strengths?.length);
        console.log("Areas for Improvement:", object.areasForImprovement?.length);

        const feedback = {
            interviewId: interviewId,
            userId: userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString(),
        };

        console.log("💾 Saving feedback to database...");

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection("feedback").doc(feedbackId);
            console.log("📝 Updating existing feedback:", feedbackId);
        } else {
            feedbackRef = db.collection("feedback").doc();
            console.log("🆕 Creating new feedback with ID:", feedbackRef.id);
        }

        await feedbackRef.set(feedback);
        console.log("✅ Feedback saved successfully to Firestore");

        // Finalize the interview after feedback is created
        console.log("🏁 Finalizing interview...");
        await finalizeInterview(interviewId);
        console.log("✅ Interview finalized");

        console.log("🎉 Feedback creation complete!");
        return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("❌ ERROR in createFeedback:");
        console.error("Error type:", error?.constructor?.name);
        console.error("Error message:", error instanceof Error ? error.message : "Unknown");
        console.error("Full error:", error);

        // Return more specific error info
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
            errorType: error?.constructor?.name
        };
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const interview = await db.collection("interviews").doc(id).get();

        if (!interview.exists) {
            console.log("Interview not found:", id);
            return null;
        }

        return { id: interview.id, ...interview.data() } as Interview;
    } catch (error) {
        console.error("Error getting interview:", error);
        return null;
    }
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    try {
        console.log("=== SERVER: Fetching feedback ===");
        console.log("Interview ID:", interviewId);
        console.log("User ID:", userId);

        const querySnapshot = await db
            .collection("feedback")
            .where("interviewId", "==", interviewId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            console.log("⚠️ No feedback found for this interview");
            return null;
        }

        const feedbackDoc = querySnapshot.docs[0];
        console.log("✅ Feedback found:", feedbackDoc.id);
        const feedbackData = { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
        console.log("📊 Total Score:", feedbackData.totalScore);
        return feedbackData;
    } catch (error) {
        console.error("❌ Error fetching feedback:", error);
        return null;
    }
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    try {
        console.log("Fetching latest interviews, excluding user:", userId);

        const interviews = await db
            .collection("interviews")
            .orderBy("createdAt", "desc")
            .where("finalized", "==", true)
            .where("userId", "!=", userId)
            .limit(limit)
            .get();

        console.log("Found", interviews.docs.length, "available interviews");

        return interviews.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Interview[];
    } catch (error) {
        console.error("Error fetching latest interviews:", error);
        return null;
    }
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    try {
        console.log("Fetching interviews for user:", userId);

        const interviews = await db
            .collection("interviews")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        console.log("Found", interviews.docs.length, "user interviews");

        return interviews.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Interview[];
    } catch (error) {
        console.error("Error fetching user interviews:", error);
        return null;
    }
}

// ====== NEW FUNCTIONS ADDED BELOW ======

export async function createGeneratedInterview(params: {
    userId: string;
    userName: string;
}): Promise<{ id: string } | null> {
    const { userId, userName } = params;

    try {
        console.log("Creating generated interview for user:", userId);

        const interviewRef = db.collection("interviews").doc();

        const interview = {
            userId,
            role: "General Position",
            level: "All Levels",
            type: "Mixed",
            techstack: [],
            questions: [
                "Tell me about yourself and your professional background",
                "What motivated you to pursue your current career path?",
                "What are your key strengths?",
                "Describe a challenging project you faced",
                "What are your career goals?",
            ],
            finalized: false, // Will be set to true after feedback is generated
            createdAt: new Date().toISOString(),
        };

        await interviewRef.set(interview);

        console.log("Generated interview created with ID:", interviewRef.id);

        return { id: interviewRef.id };
    } catch (error) {
        console.error("Error creating generated interview:", error);
        return null;
    }
}

export async function finalizeInterview(interviewId: string): Promise<boolean> {
    try {
        console.log("Finalizing interview:", interviewId);

        await db.collection("interviews").doc(interviewId).update({
            finalized: true,
        });

        console.log("✅ Interview finalized successfully");
        return true;
    } catch (error) {
        console.error("❌ Error finalizing interview:", error);
        console.error("Error details:", error);
        return false;
    }
}

// Optional: Function to create custom interviews (if you need this)
export async function createCustomInterview(params: {
    userId: string;
    role: string;
    type: string;
    techstack?: string[];
    questions: string[];
}): Promise<{ id: string } | null> {
    const { userId, role, type, techstack, questions } = params;

    try {
        console.log("Creating custom interview for user:", userId);

        const interviewRef = db.collection("interviews").doc();

        const interview = {
            userId,
            role,
            type,
            techstack: techstack || [],
            questions,
            finalized: true, // Custom interviews are immediately available
            createdAt: new Date().toISOString(),
        };

        await interviewRef.set(interview);

        console.log("Custom interview created with ID:", interviewRef.id);

        return { id: interviewRef.id };
    } catch (error) {
        console.error("Error creating custom interview:", error);
        return null;
    }
}


export async function updateInterviewWithQuestions(params: {
    interviewId: string;
    role: string;
    level: string;
    type: string;
    techstack: string[];
    questions: string[];
}): Promise<boolean> {
    const { interviewId, role, level, type, techstack, questions } = params;

    try {
        console.log("=== SERVER: Updating interview ===");
        console.log("Interview ID:", interviewId);
        console.log("Role:", role);
        console.log("Level:", level);
        console.log("Type:", type);
        console.log("Tech stack:", techstack);
        console.log("Questions count:", questions?.length);

        await db.collection("interviews").doc(interviewId).update({
            role,
            level,
            type,
            techstack,
            questions,
            updatedAt: new Date().toISOString(),
        });

        console.log("✅ Interview updated successfully");
        return true;
    } catch (error) {
        console.error("❌ Error updating interview:", error);
        console.error("Error details:", error);
        return false;
    }
}