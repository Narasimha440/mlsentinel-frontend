import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { cn } from "../../lib/cn";

const FLIP: Transition = { type: "spring", stiffness: 280, damping: 30 };

type Props = {
  words: string[];
  /** ms each word stays on screen */
  interval?: number;
  className?: string;
};

export function FlipWords({ words, interval = 2600, className }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const word = words[index];

  return (
    <span className={cn("relative inline-grid overflow-visible align-bottom", className)}>
      {/* Invisible copies of every word reserve the widest footprint,
          so the surrounding heading never reflows during swaps. */}
      {words.map((w) => (
        <span key={w} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {w}
        </span>
      ))}

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          className="col-start-1 row-start-1 whitespace-nowrap text-accent"
          initial={{ y: "70%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-70%", opacity: 0, filter: "blur(8px)", transition: { duration: 0.25, ease: "easeIn" } }}
          transition={FLIP}
        >
          {/* Per-character stagger: each letter flips up a beat after the last */}
          {word.split("").map((char, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block"
              initial={{ y: "60%", opacity: 0, filter: "blur(6px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              transition={{ ...FLIP, delay: i * 0.025 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}