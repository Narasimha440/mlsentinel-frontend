"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SeeWhatChanged() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const image = imageRef.current;

    if (!section || !content || !image) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "top 30%",
          scrub: 1,
        },
      });

      tl.fromTo(
        content,
        {
          opacity: 0,
          x: -60,
        },
        {
          opacity: 1,
          x: 0,
          ease: "power3.out",
        },
        0
      );

      tl.fromTo(
        image,
        {
          opacity: 0,
          x: 100,
          scale: 0.94,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: "power3.out",
        },
        0.08
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        w-full
        overflow-hidden
        bg-white
        py-28
        sm:py-32
        lg:py-40
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1240px]
          items-center
          gap-14
          px-6
          sm:px-8
          lg:grid-cols-[0.72fr_1.28fr]
          lg:gap-20
          lg:px-10
        "
      >
        {/* TEXT */}

        <div
          ref={contentRef}
          className="max-w-[500px]"
        >
          <p
            className="
              mb-6
              text-[13px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#2563EB]
            "
          >
            SEE WHAT CHANGED
          </p>

          <h2
            className="
              text-[48px]
              font-semibold
              leading-[0.98]
              tracking-[-0.055em]
              text-[#0F172A]
              sm:text-[58px]
              lg:text-[68px]
            "
          >
            Know what changed.
            <br />
            Know what matters.
          </h2>

          <p
            className="
              mt-8
              max-w-[500px]
              text-[18px]
              font-medium
              leading-[1.65]
              text-[#64748B]
              lg:text-[19px]
            "
          >
            MLSentinel tracks your model runs and makes
            changes in accuracy, precision, recall, F1
            score, and validation loss easy to understand.
          </p>
        </div>

        {/* DASHBOARD */}

        <div
          ref={imageRef}
          className="
            relative
            w-full
            overflow-hidden
            rounded-[22px]
            border
            border-[#DCE3EC]
            bg-[#F8FAFC]
            shadow-[0_25px_70px_rgba(15,23,42,0.10)]
          "
        >
          <img
            src="https://raw.githubusercontent.com/Narasimha440/mlsentinel/refs/heads/main/assets/Monitoring_page.png"
            alt="MLSentinel monitoring dashboard"
            className="
              block
              h-auto
              w-full
            "
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}