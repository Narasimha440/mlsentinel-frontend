import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { SPRING } from "../../lib/motion";
import { FlipWords } from "./FlipWords";
import { HeroVisual } from "./visual/HeroVisual";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: {
    y: 24,
    opacity: 0,
    filter: "blur(6px)",
  },
  show: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: SPRING,
  },
};

export function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-8 pt-64 pb-40 max-md:px-5 max-md:pt-48">
      <div className="flex items-center justify-between gap-20 max-xl:gap-16 max-lg:gap-12 max-md:flex-col max-md:items-center max-md:gap-0">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl shrink-0 max-md:max-w-none max-md:text-center"
        >
          <motion.p
            variants={item}
            className="text-sm font-medium text-blue-600"
          >
            Model monitoring for production ML
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-5 text-[64px] font-semibold leading-[1.06] tracking-tight text-gray-900 max-lg:text-5xl max-md:text-4xl"
          >
            Catch model{" "}
            <FlipWords
              words={[
                "drift",
                "bias",
                "outages",
                "regressions",
                "anomalies",
              ]}
            />
            <br />
            before your users do.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600 max-md:mx-auto"
          >
            MLSentinel watches every prediction in production and alerts you the
            moment quality slips. Built for engineers, not dashboards.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex items-center gap-4 max-md:justify-center"
          >
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-7 py-4 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
            >
              Start monitoring
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </motion.a>

            <a
              href="/docs"
              className="rounded-full px-6 py-4 text-[15px] font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
            >
              Read the docs
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.35 }}
          className="-mt-8 shrink-0 max-md:mt-12 max-md:scale-90"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
