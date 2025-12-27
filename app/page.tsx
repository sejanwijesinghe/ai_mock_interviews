import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getInterviewsByUserId } from "@/lib/actions/general.action";

// Note: Ensure TechMarquee is a "use client" component if it uses animations/styled-jsx
import TechMarquee from "@/components/TechMarquee";

async function Home() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userInterviews = await getInterviewsByUserId(user.id);
    const hasPastInterviews = userInterviews && userInterviews.length > 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Navigation / Logo Area */}
            <div className="flex justify-between items-center mb-8">
                <Link href="/" className="flex items-center">
                    <Image src="/r2.png" alt="Logo" width={80} height={80} />
                    <span className="font-bold text-xl tracking-tight">RepliQ</span>
                </Link>
            </div>

            {/* CTA Section */}
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2 className="text-3xl font-bold">Get Interview-Ready with AI-Powered Practice</h2>
                    <p className="text-lg opacity-90">
                        Practice real interview questions & get instant feedback
                    </p>

                    <Button asChild className="btn-primary max-sm:w-full w-fit">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                <Image
                    src="/l.png"
                    alt="robo-dude"
                    width={300}
                    height={300}
                    className="max-sm:hidden object-contain"
                />
            </section>

            {/* Tech Stack Marquee (Replacing "Take Interviews") */}
            <section className="mt-16 overflow-hidden">
                <h3 className="text-center text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">
                    Practice for any Stack
                </h3>
                <TechMarquee />
            </section>

            {/* Your Interviews Section */}
            <section className="flex flex-col gap-6 mt-16">
                <h2 className="text-2xl font-semibold">Your Recent Interviews</h2>

                {hasPastInterviews ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userInterviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                userId={user.id}
                                interviewId={interview.id}
                                role={interview.role}
                                type={interview.type}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-lg">
                            You haven&apos;t taken any interviews yet
                        </p>
                    </div>
                )}

            </section>
            <footer className="mt-16 py-8 border-t border-gray-200 text-center text-sm text-gray-600 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p>
                        © {new Date().getFullYear()} RepliQ. All rights reserved.
                    </p>
                    <div className="mt-2 flex justify-center gap-6">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/contact" className="hover:text-gray-900 transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default Home;