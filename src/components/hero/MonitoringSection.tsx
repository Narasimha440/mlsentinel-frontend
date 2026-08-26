"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function ScrollParagraph() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const paragraph = paragraphRef.current;

    if (!section || !paragraph) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(paragraph, {
        type: "lines",
        mask: "lines",
        autoSplit: true,

        onSplit(self) {
          // Make sure every newly-created line
          // starts from the same position.
          gsap.set(self.lines, {
            yPercent: 110,
            opacity: 0,
          });

          // The animation is NOT scrubbed.
          // Once the section enters the viewport,
          // the animation plays independently of scroll speed.
          return gsap.to(self.lines, {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",

            scrollTrigger: {
              trigger: section,
              start: "top 80%",

              // Play the animation when entering.
              // It is not controlled by scroll position.
              toggleActions: "play none none reverse",

              // Helps ScrollTrigger handle very fast scrolling.
              fastScrollEnd: true,
            },
          });
        },
      });

      // Refresh after SplitText has calculated the lines.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        split.revert();
      };
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        overflow-hidden
        bg-white
        px-6
        py-32
        sm:py-40
        lg:px-8
        lg:py-48
      "
    >
      <div className="mx-auto max-w-[1240px]">
        <div
          className="
            mx-auto
            max-w-[1050px]
            border-t
            border-[#E2E8F0]
            pt-10
            sm:pt-14
          "
        >
          {/* Small label */}

          <div className="mb-10 flex items-center gap-4">
            <span
              className="
                h-px
                w-8
                bg-[#2563EB]
              "
            />

            <span
              className="
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#2563EB]
              "
            >
              Built for production
            </span>
          </div>

          {/* Animated paragraph */}

          <div className="overflow-hidden">
            <p
              ref={paragraphRef}
              className="
                text-[34px]
                font-medium
                leading-[1.18]
                tracking-[-0.035em]
                text-[#0F172A]

                sm:text-[44px]

                md:text-[52px]

                lg:text-[60px]
              "
            >
              MLSentinel helps you understand what happens
              after your model goes into production — from
              changing metrics and model health to the signals
              that tell you when something needs attention.
            </p>
          </div>

          {/* Small supporting line */}

          <div
            className="
              mt-10
              max-w-[620px]
              text-[15px]
              font-medium
              leading-7
              text-[#64748B]
            "
          >
            Monitor continuously. Understand changes early.
            Act with confidence.
          </div>
        </div>
      </div>
    </section>
  );
}