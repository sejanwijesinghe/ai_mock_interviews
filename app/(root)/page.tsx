// import React from 'react';
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import Image from "next/image";
// import { dummyInterviews } from "@/constants";
// import InterviewCard from "@/components/InterviewCard";
// // Import your Marquee component (I've included the code for this below)
// import TechMarquee from "@/components/TechMarquee";
//
// const Page = () => {
//     return (
//         <div className="w-full max-w-7xl mx-auto px-4 py-6">
//             {/* 1. LOGO TOP LEFT */}
//             <header className="mb-10">
//                 <Link href="/" className="flex items-center gap-2 w-fit">
//                     <Image src="/logo.svg" alt="Logo" width={40} height={40} />
//                     <span className="text-2xl font-bold tracking-tight text-white">RepliQ</span>
//                 </Link>
//             </header>
//
//             <section className="card-cta">
//                 <div className="flex flex-col gap-6 max-w-lg">
//                     <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
//                     <p className="text-lg">
//                         Practice on real interview questions & get instant feedback
//                     </p>
//                     <Button asChild className="btn-primary max-sm:w-full">
//                         <Link href="/interview">Start an Interview</Link>
//                     </Button>
//                 </div>
//                 <Image src="/robot.png" alt="Robot" width={400} height={400} className="max-sm:hidden"/>
//             </section>
//
//             {/* 2. MARQUEE SECTION (Replacing "Take an Interview") */}
//             <section className="mt-16 overflow-hidden">
//                 <p className="text-center text-gray-500 mb-4 uppercase tracking-widest text-xs font-semibold">
//                     Supported Technologies
//                 </p>
//                 <TechMarquee />
//             </section>
//
//             {/* 3. YOUR INTERVIEWS */}
//             <section className="flex flex-col gap-6 mt-12">
//                 <h2>Your Interviews</h2>
//                 <div className="interviews-section">
//                     {dummyInterviews.map((interview) => (
//                         <InterviewCard {...interview} key={interview.id} />
//                     ))}
//                 </div>
//             </section>
//         </div>
//     )
// }
//
// export default Page;