import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { createGeneratedInterview } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

const InterviewPage = async () => {
    const user = await getCurrentUser();

    // Redirect if no user
    if (!user) {
        redirect("/sign-in");
    }

    // Create interview record BEFORE rendering Agent
    const interview = await createGeneratedInterview({
        userId: user.id,
        userName: user.name,
    });

    // If interview creation failed, redirect to home
    if (!interview) {
        console.error("Failed to create interview");
        redirect("/");
    }

    console.log("Created interview with ID:", interview.id);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <h3 className="text-2xl font-bold mb-8">Interview Generation</h3>

            <Agent
                userName={user.name}
                userId={user.id}
                interviewId={interview.id}
                profileImage={user.profileURL}
                type="generate"
            />
        </div>
    );
};

export default InterviewPage;