"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  Code2,
  ChartNoAxesCombined,
  ShieldCheck,
  SearchCheck,
  Bell,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Your model",
    description: "Run your model as usual.",
    image: "/images/how-model.png",
    icon: Activity,
  },
  {
    number: "02",
    title: "SDK",
    description: "Send metrics with MLSentinel.",
    image: "/images/how-sdk.png",
    icon: Code2,
  },
  {
    number: "03",
    title: "Evaluation",
    description: "Validate and analyze every run.",
    image: "/images/how-evaluation.png",
    icon: ChartNoAxesCombined,
  },
  {
    number: "04",
    title: "Health",
    description: "Track model health over time.",
    image: "/images/how-health.png",
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Detection",
    description: "Detect meaningful changes in your metrics.",
    image: "/images/how-detection.png",
    icon: SearchCheck,
  },
  {
    number: "06",
    title: "Alert",
    description: "Know when a model needs attention.",
    image: "/images/how-alert.png",
    icon: Bell,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scrollArea = scrollAreaRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;

    if (!section || !scrollArea || !sticky || !track) {
      return;
    }

    const ctx = gsap.context(() => {
      const getDistance = () => {
        return Math.max(
          0,
          track.scrollWidth - window.innerWidth + 80
        );
      };

      /*
       * The vertical space available for the horizontal
       * animation.
       *
       * We intentionally do NOT use GSAP pinning.
       */

      const getScrollDistance = () => {
        return getDistance() + window.innerHeight;
      };

      /*
       * Make the scroll area tall enough for the complete
       * horizontal animation.
       */

      const updateHeight = () => {
        scrollArea.style.height =
          `${getScrollDistance()}px`;
      };

      updateHeight();

      /*
       * Horizontal animation.
       *
       * No pin here.
       */

      gsap.to(track, {
        x: () => -getDistance(),

        ease: "none",

        scrollTrigger: {
          trigger: scrollArea,

          start: "top top",

          end: () =>
            `+=${getScrollDistance()}`,

          scrub: 1,

          invalidateOnRefresh: true,

          markers: false,
        },
      });

      /*
       * Refresh after images have loaded because image
       * dimensions affect track.scrollWidth.
       *
       * Debounced into a single rAF-batched refresh so that
       * N images loading doesn't trigger N separate
       * ScrollTrigger.refresh() calls mid-scroll.
       */

      const images = Array.from(
        track.querySelectorAll("img")
      );

      let refreshQueued = false;

      const queueRefresh = () => {
        if (refreshQueued) return;
        refreshQueued = true;

        requestAnimationFrame(() => {
          updateHeight();
          ScrollTrigger.refresh();
          refreshQueued = false;
        });
      };

      images.forEach((image) => {
        if (!image.complete) {
          image.addEventListener(
            "load",
            queueRefresh
          );
        }
      });

      /*
       * Recalculate on resize.
       */

      const handleResize = () => {
        queueRefresh();
      };

      window.addEventListener(
        "resize",
        handleResize
      );

      /*
       * Initial refresh.
       */

      requestAnimationFrame(() => {
        updateHeight();
        ScrollTrigger.refresh();
      });

      return () => {
        images.forEach((image) => {
          image.removeEventListener(
            "load",
            queueRefresh
          );
        });

        window.removeEventListener(
          "resize",
          handleResize
        );
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
        bg-[#F8FAFC]
        [overflow-anchor:none]
      "
    >
      {/* =================================================
          INTRO
      ================================================= */}

      <div
        className="
          mx-auto
          max-w-[1240px]
          px-6
          py-24
          lg:px-8
          lg:py-28
        "
      >
        <div className="max-w-[760px]">

          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#2563EB]
            "
          >
            How it works
          </p>

          <h2
            className="
              mt-5
              text-[clamp(44px,5vw,68px)]
              font-semibold
              leading-[0.98]
              tracking-[-0.055em]
              text-[#0F172A]
            "
          >
            From model run
            <br />
            to useful signal.
          </h2>

          <p
            className="
              mt-7
              max-w-[700px]
              text-lg
              font-medium
              leading-8
              text-[#64748B]
            "
          >
            Send your model metrics. MLSentinel evaluates the
            run, tracks health over time, and tells you when
            something changes.
          </p>

        </div>
      </div>

      {/* =================================================
          HORIZONTAL SCROLL AREA
      ================================================= */}

      <div
        ref={scrollAreaRef}
        className="
          relative
          w-full
          [overflow-anchor:none]
        "
      >

        {/* =================================================
            STICKY VIEWPORT

            This replaces ScrollTrigger pinning.
        ================================================= */}

        <div
          ref={stickyRef}
          className="
            sticky
            top-0
            flex
            h-screen
            w-full
            items-center
            overflow-hidden
            bg-[#F8FAFC]
          "
        >

          {/* =================================================
              HORIZONTAL TRACK
          ================================================= */}

          <div
            ref={trackRef}
            className="
              flex
              w-max
              gap-6
              pl-[max(24px,calc((100vw-1240px)/2))]
              pr-32
              will-change-transform
            "
          >

            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="
                    group
                    w-[78vw]
                    max-w-[500px]
                    shrink-0
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-[#DCE3EC]
                    bg-white
                    shadow-[0_16px_45px_rgba(15,23,42,0.06)]
                  "
                >

                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <div
                    className="
                      relative
                      aspect-[16/9]
                      overflow-hidden
                      border-b
                      border-[#E2E8F0]
                      bg-[#F1F5F9]
                    "
                  >

                    <img
                      src={step.image}
                      alt={step.title}
                      draggable={false}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-[1.025]
                      "
                    />

                    {/* NUMBER */}

                    <div
                      className="
                        absolute
                        left-5
                        top-5
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#BFDBFE]
                        bg-white
                        text-sm
                        font-semibold
                        text-[#2563EB]
                        shadow-sm
                      "
                    >
                      {step.number}
                    </div>

                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="p-7 md:p-8">

                    <div
                      className="
                        mb-5
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[#BFDBFE]
                        bg-white
                      "
                    >
                      <Icon
                        className="
                          h-[19px]
                          w-[19px]
                          text-[#2563EB]
                        "
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3
                      className="
                        text-2xl
                        font-semibold
                        tracking-[-0.025em]
                        text-[#0F172A]
                      "
                    >
                      {step.title}
                    </h3>

                    <p
                      className="
                        mt-3
                        max-w-[380px]
                        text-base
                        font-medium
                        leading-7
                        text-[#64748B]
                      "
                    >
                      {step.description}
                    </p>

                  </div>

                </article>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
}