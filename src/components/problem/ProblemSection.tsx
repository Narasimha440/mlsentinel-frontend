import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProblemStory } from "./ProblemStory";

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const leadOpacity = useTransform(scrollYProgress, [0, 0.08, 0.9, 1], [1, 1, 1, 0.55]);

  return (
    <section ref={sectionRef} className="relative h-[420vh] bg-white" aria-labelledby="problem-heading">
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden px-6 py-24 lg:px-10">
        <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-12 lg:grid-cols-[40fr_60fr] lg:gap-16">
          <motion.div style={{ opacity: leadOpacity }} className="max-w-[460px] lg:pb-4">
            <p className="text-sm font-medium text-blue-600">The Hidden Problem</p>
            <h2 id="problem-heading" className="font-display mt-5 text-5xl font-semibold leading-[1.06] tracking-tight text-gray-900 sm:text-6xl">Your model doesn&apos;t fail overnight.</h2>
            <p className="mt-7 text-base font-medium leading-relaxed text-gray-500">Machine learning models silently drift as production data evolves.</p>
            <p className="mt-5 text-base font-medium leading-relaxed text-gray-500">Most teams only discover the issue after users begin experiencing failures.</p>
            <p className="mt-5 text-base font-medium leading-relaxed text-gray-500">MLSentinel continuously monitors deployed models, detects drift early, identifies the root cause, and recommends what to do next.</p>
          </motion.div>
          <ProblemStory progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
