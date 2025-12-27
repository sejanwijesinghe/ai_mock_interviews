"use client"; // This fixes the 'client-only' error

export default function TechMarquee() {
    const icons = ["React", "Next.js", "Node.js", "Python", "TypeScript", "AWS", "Docker"];

    return (
        <div className="marquee-container">
            <div className="marquee-content">
                {/* Render twice for seamless loop */}
                {[...icons, ...icons].map((tech, i) => (
                    <span key={i} className="mx-8 text-2xl font-bold text-gray-400">
            {tech}
          </span>
                ))}
            </div>

            <style jsx>{`
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}