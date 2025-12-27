// app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
    try {
        const { role, level, type, techstack, amount } = await request.json();

        console.log("Generating questions for:", { role, level, type, techstack, amount });

        const prompt = `Generate exactly ${amount} interview questions for a ${level} ${role} position.

Interview Type: ${type}
Technologies/Skills: ${techstack}

Requirements:
- Generate ${amount} questions
- Questions should be relevant to the ${level} experience level
- Focus on ${type} interview style
- Consider the tech stack: ${techstack}
- Mix of behavioral and technical questions if type is "mixed"
- Return ONLY the questions, numbered 1-${amount}
- Each question on a new line
- No additional commentary or explanations

Example format:
1. [First question]
2. [Second question]
3. [Third question]`;

        const { text } = await generateText({
            model: openai("gpt-4o-mini"),
            prompt,
            temperature: 0.7,
        });

        // Parse the questions from the response
        const questions = text
            .split("\n")
            .filter(line => line.trim())
            .map(line => {
                // Remove numbering if present (e.g., "1. " or "1) ")
                return line.replace(/^\d+[\.)]\s*/, "").trim();
            })
            .filter(q => q.length > 0)
            .slice(0, amount); // Ensure we don't exceed the requested amount

        console.log("Generated questions:", questions);

        if (questions.length === 0) {
            throw new Error("No questions were generated");
        }

        return NextResponse.json({
            success: true,
            questions
        });

    } catch (error) {
        console.error("Error generating questions:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to generate questions"
            },
            { status: 500 }
        );
    }
}