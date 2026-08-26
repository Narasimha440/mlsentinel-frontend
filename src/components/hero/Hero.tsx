"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import {
  ArrowRight,
  Check,
  Activity,
  ShieldCheck,
  Bell,
  ArrowUpRight,
} from "lucide-react";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText
);


export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heroContent = heroContentRef.current;
      const dashboard = dashboardRef.current;
      const title = titleRef.current;

      if (
        !section ||
        !heroContent ||
        !dashboard ||
        !title
      ) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      /*
      ============================================================
      HERO TITLE
      ============================================================

      This follows the animation style from the reference video:

      - Characters are individually masked.
      - Characters start below their final position.
      - Characters slide upward.
      - Each character rotates into position.
      - No fade.
      - No blur.
      - No random X movement.
      - Characters enter sequentially.
      ============================================================
      */

      const split = new SplitText(title, {
        type: "chars",
        mask: "chars",
        autoSplit: true,
        smartWrap: true,
      });

      /*
      ============================================================
      REDUCED MOTION
      ============================================================
      */

      if (reduceMotion) {
        gsap.set(split.chars, {
          yPercent: 0,
          rotation: 0,
        });

        gsap.set(
          [
            ".hero-description",
            ".hero-points",
            ".hero-actions",
          ],
          {
            opacity: 1,
            y: 0,
          }
        );

        gsap.set(dashboard, {
          opacity: 1,
          y: 0,
          scale: 1,
        });

        return () => {
          split.revert();
        };
      }

      /*
      ============================================================
      INITIAL CHARACTER POSITION
      ============================================================
      */

      gsap.set(split.chars, {
        yPercent: 120,

        /*
         * Each character has a different rotation.
         *
         * This is what gives the reference its
         * "letters falling / flipping into place"
         * appearance.
         */
        rotation: () =>
          gsap.utils.random(-90, 90),

        transformOrigin: "50% 100%",
      });

      /*
      ============================================================
      OTHER HERO ELEMENTS
      ============================================================
      */

      gsap.set(".hero-description", {
        opacity: 0,
        y: 30,
      });

      gsap.set(".hero-points", {
        opacity: 0,
        y: 25,
      });

      gsap.set(".hero-actions", {
        opacity: 0,
        y: 25,
      });

      gsap.set(dashboard, {
        opacity: 0,
        y: 80,
        scale: 0.96,
      });

      /*
      ============================================================
      HERO INTRO TIMELINE
      ============================================================
      */

      const intro = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      /*
      ------------------------------------------------------------
      TITLE
      ------------------------------------------------------------

      IMPORTANT:

      There is intentionally:

      NO opacity
      NO blur
      NO scale
      NO random X

      Only vertical movement + rotation.
      ------------------------------------------------------------
      */

      intro.to(split.chars, {
        yPercent: 0,
        rotation: 0,

        duration: 0.9,

        stagger: {
          each: 0.055,
          from: "start",
        },

        ease: "power4.out",
      });

      /*
      ------------------------------------------------------------
      DESCRIPTION
      ------------------------------------------------------------
      */

      intro.to(
        ".hero-description",
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
        },
        "-=0.45"
      );

      /*
      ------------------------------------------------------------
      FEATURE POINTS
      ------------------------------------------------------------
      */

      intro.to(
        ".hero-points",
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        },
        "-=0.35"
      );

      /*
      ------------------------------------------------------------
      BUTTONS
      ------------------------------------------------------------
      */

      intro.to(
        ".hero-actions",
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        },
        "-=0.3"
      );

      /*
      ------------------------------------------------------------
      DASHBOARD
      ------------------------------------------------------------
      */

      intro.to(
        dashboard,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.35"
      );

      /*
      ============================================================
      DASHBOARD SCROLL PARALLAX
      ============================================================
      */

      gsap.to(dashboard, {
        y: -90,
        scale: 0.985,

        scrollTrigger: {
          trigger: dashboard,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      /*
      ============================================================
      HERO CONTENT PARALLAX
      ============================================================
      */

      gsap.to(heroContent, {
        y: -50,

        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      /*
      ============================================================
      FEATURE REVEAL
      ============================================================
      */

      gsap.from(".hero-feature", {
        opacity: 0,
        y: 35,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",

        scrollTrigger: {
          trigger: ".hero-features",
          start: "top 85%",
          once: true,
        },
      });

      /*
      ============================================================
      REFRESH
      ============================================================
      */

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      /*
      ============================================================
      CLEANUP
      ============================================================
      */

      return () => {
        split.revert();
      };
    },
    {
      scope: sectionRef,
    }
  );

  return (
    <section
      ref={sectionRef}
      className="
        relative
        overflow-hidden
        bg-white
        text-[#0F172A]
      "
    >
      {/* ========================================================
          HERO CONTENT
      ======================================================== */}

      <div
        ref={heroContentRef}
        className="
          relative
          z-10
          mx-auto
          max-w-[1380px]
          px-8
          pb-20
          pt-32
          text-center
          lg:px-12
          lg:pt-40
          max-md:px-5
          max-md:pt-28
        "
      >
        {/* ======================================================
            TITLE
        ======================================================= */}

        <h1
          ref={titleRef}
          className="
            hero-title
            mx-auto
            max-w-[1050px]
            text-[clamp(52px,8vw,108px)]
            font-semibold
            leading-[0.92]
            tracking-[-0.065em]
            text-[#0F172A]
          "
        >
          Monitor your models.
          <br />

          <span className="text-[#2563EB]">
            Catch problems early.
          </span>
        </h1>

        {/* ======================================================
            DESCRIPTION
        ======================================================= */}

        <p
          className="
            hero-description
            mx-auto
            mt-8
            max-w-[680px]
            text-lg
            leading-8
            text-[#475569]
            md:text-xl
          "
        >
          MLSentinel helps you monitor machine learning
          models in production, detect changes in model
          health, and understand when something needs
          attention.
        </p>

        {/* ======================================================
            POINTS
        ======================================================= */}

        <div
          className="
            hero-points
            mx-auto
            mt-8
            flex
            flex-wrap
            items-center
            justify-center
            gap-x-7
            gap-y-3
            text-sm
            text-[#475569]
          "
        >
          <div className="flex items-center gap-2">
            <Check
              className="
                h-4
                w-4
                text-[#2563EB]
              "
              strokeWidth={2.5}
            />

            Real-time model monitoring
          </div>

          <div className="flex items-center gap-2">
            <Check
              className="
                h-4
                w-4
                text-[#2563EB]
              "
              strokeWidth={2.5}
            />

            Automatic evaluation
          </div>

          <div className="flex items-center gap-2">
            <Check
              className="
                h-4
                w-4
                text-[#2563EB]
              "
              strokeWidth={2.5}
            />

            Actionable alerts
          </div>

          <div className="flex items-center gap-2">
            <Check
              className="
                h-4
                w-4
                text-[#2563EB]
              "
              strokeWidth={2.5}
            />

            Python SDK
          </div>
        </div>

        {/* ======================================================
            CTA
        ======================================================= */}

        <div
          className="
            hero-actions
            mt-9
            flex
            flex-wrap
            items-center
            justify-center
            gap-3
          "
        >
          <a
            href="/signup"
            className="
              group
              inline-flex
              items-center
              gap-2.5
              rounded-lg
              bg-[#0F172A]
              px-7
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-[#1E293B]
              hover:shadow-md
            "
          >
            Get started

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </a>

          <a
            href="/docs"
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-[#CBD5E1]
              bg-white
              px-7
              py-3.5
              text-sm
              font-semibold
              text-[#0F172A]
              transition-all
              duration-200
              hover:border-[#94A3B8]
              hover:bg-[#F8FAFC]
            "
          >
            Read documentation

            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* ========================================================
          DASHBOARD PREVIEW
      ======================================================== */}

      <div
        ref={dashboardRef}
        className="
          relative
          z-20
          mx-auto
          max-w-[1420px]
          px-6
          pb-28
          lg:px-10
          lg:pb-36
        "
      >
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[#CBD5E1]
            bg-white
            shadow-[0_30px_100px_rgba(15,23,42,0.12)]
          "
        >
          {/* WINDOW BAR */}

          <div
            className="
              flex
              h-12
              items-center
              justify-between
              border-b
              border-[#E2E8F0]
              bg-[#F8FAFC]
              px-5
            "
          >
            <div className="flex items-center gap-1.5">
              <span
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#CBD5E1]
                "
              />

              <span
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#CBD5E1]
                "
              />

              <span
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#CBD5E1]
                "
              />
            </div>

            <div
              className="
                hidden
                rounded-md
                border
                border-[#E2E8F0]
                bg-white
                px-4
                py-1.5
                text-xs
                text-[#64748B]
                sm:block
              "
            >
              mlsentinel.dev
            </div>

            <div className="w-14" />
          </div>

          {/* DASHBOARD */}

          <div className="bg-white">
            <img
              src="/dashboard-preview.png"
              alt="MLSentinel production monitoring dashboard"
              className="
                block
                h-auto
                w-full
                select-none
                object-cover
              "
              draggable={false}
            />
          </div>
        </div>

        {/* DASHBOARD CAPTION */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-2
            px-1
            text-sm
            text-[#64748B]
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[#16A34A]
              "
            />

            Live model monitoring
          </div>

          <span>
            Your production models. One place.
          </span>
        </div>
      </div>

      {/* ========================================================
          FEATURES
      ======================================================== */}

      <div
        className="
          hero-features
          relative
          z-10
          border-y
          border-[#E2E8F0]
          bg-[#F8FAFC]
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1380px]
            md:grid-cols-3
          "
        >
          {/* FEATURE 1 */}

          <div
            className="
              hero-feature
              border-b
              border-[#E2E8F0]
              px-8
              py-10
              md:border-b-0
              md:border-r
              lg:px-12
            "
          >
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
                text-[#2563EB]
              "
            >
              <Activity className="h-5 w-5" />
            </div>

            <h3
              className="
                text-base
                font-semibold
                text-[#0F172A]
              "
            >
              Monitor model health
            </h3>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-[#64748B]
              "
            >
              Send evaluation metrics from your
              production models and keep their health
              visible over time.
            </p>
          </div>

          {/* FEATURE 2 */}

          <div
            className="
              hero-feature
              border-b
              border-[#E2E8F0]
              px-8
              py-10
              md:border-b-0
              md:border-r
              lg:px-12
            "
          >
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
                text-[#2563EB]
              "
            >
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h3
              className="
                text-base
                font-semibold
                text-[#0F172A]
              "
            >
              Detect changes
            </h3>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-[#64748B]
              "
            >
              Track accuracy, precision, recall,
              F1 score, loss, and other signals to
              catch regressions.
            </p>
          </div>

          {/* FEATURE 3 */}

          <div
            className="
              hero-feature
              px-8
              py-10
              lg:px-12
            "
          >
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
                text-[#2563EB]
              "
            >
              <Bell className="h-5 w-5" />
            </div>

            <h3
              className="
                text-base
                font-semibold
                text-[#0F172A]
              "
            >
              Know what needs attention
            </h3>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-[#64748B]
              "
            >
              Get clear alerts and recommendations
              when a model starts moving away from
              expected performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}