"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ArrowUpRight, Mail } from "lucide-react";

import { GithubIcon } from "../icons/GithubIcon";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    const path = pathRef.current;

    if (!footer || !path) return;

    const ctx = gsap.context(() => {
      const curvedPath =
        "M0 0 C0 0 464 156 1139 156 S2278 0 2278 0 V683 H0 V0 Z";

      const flatPath =
        "M0 0 C0 0 464 0 1139 0 S2278 0 2278 0 V683 H0 V0 Z";

      // Initial curved state
      gsap.set(path, {
        attr: {
          d: curvedPath,
        },
      });

      // Footer curve animation
      ScrollTrigger.create({
        trigger: footer,
        start: "top bottom",

        onEnter: (self) => {
          const velocity = self.getVelocity();

          const variation = gsap.utils.clamp(
            -0.3,
            0.3,
            velocity / 10000
          );

          const amplitude = gsap.utils.clamp(
            1,
            1.3,
            1 + Math.abs(variation)
          );

          const period = gsap.utils.clamp(
            0.2,
            1,
            1 - Math.abs(variation)
          );

          gsap.fromTo(
            path,
            {
              morphSVG: curvedPath,
            },
            {
              morphSVG: flatPath,
              duration: 2,
              ease: `elastic.out(${amplitude}, ${period})`,
              overwrite: true,
            }
          );
        },
      });

      // Footer content reveal
      gsap.fromTo(
        ".footer-content",
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 75%",
            once: true,
          },
        }
      );

      // Footer bottom reveal
      gsap.fromTo(
        ".footer-bottom",
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 60%",
            once: true,
          },
        }
      );

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, footer);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
    >
      {/* ========================================================
          FOOTER BACKGROUND
      ======================================================== */}
      <div
        className="
          pointer-events-none absolute
          inset-x-0 bottom-0 top-[150px]
          z-0 bg-[#0F172A]
          sm:top-[170px]
          lg:top-[190px]
        "
      />

      {/* ========================================================
          CURVED SVG BUMP
      ======================================================== */}
      <div
        className="
          pointer-events-none absolute
          left-0 top-0 z-[1]
          h-[150px] w-full
          sm:h-[170px]
          lg:h-[190px]
        "
      >
        <svg
          className="block h-full w-full"
          viewBox="0 0 2278 683"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            ref={pathRef}
            d="M0 0 C0 0 464 156 1139 156 S2278 0 2278 0 V683 H0 V0 Z"
            fill="#0F172A"
          />
        </svg>
      </div>

      {/* ========================================================
          FOOTER CONTENT
      ======================================================== */}
      <div
        className="
          footer-content relative z-10 mx-auto
          max-w-[1240px]
          px-6
          pb-12
          pt-[190px]
          sm:pb-14
          sm:pt-[210px]
          lg:px-8
          lg:pb-16
          lg:pt-[230px]
        "
      >
        <div
          className="
            flex flex-col gap-14
            lg:flex-row
            lg:items-end
            lg:justify-between
            lg:gap-20
          "
        >
          {/* ====================================================
              LEFT
          ==================================================== */}
          <div className="max-w-[580px]">
            <a
              href="/"
              className="
                inline-flex items-center
                text-lg font-semibold
                tracking-[-0.02em]
                text-white
              "
            >
              MLSentinel
            </a>

            <h2
              className="
                mt-7 max-w-[620px]
                text-[40px]
                font-semibold
                leading-[1]
                tracking-[-0.045em]
                text-white
                sm:text-[48px]
                lg:text-[58px]
              "
            >
              Keep your models
              <br />
              in sight.
            </h2>

            <p
              className="
                mt-6 max-w-[520px]
                text-[16px]
                leading-7
                text-[#94A3B8]
              "
            >
              Monitor model health, understand changes, and know
              when something needs attention.
            </p>
          </div>

          {/* ====================================================
              LINKS
          ==================================================== */}
          <div
            className="
              grid grid-cols-2
              gap-x-12
              gap-y-5
              sm:grid-cols-3
              sm:gap-x-14
            "
          >
            <FooterLink
              href="/docs"
              label="Documentation"
            />

            <FooterLink
              href="https://pypi.org/project/mlsentinel/"
              label="SDK"
            />

            <FooterLink
              href="mailto:narasimhadhoni.a@gmail.com"
              label="Contact"
            />
          </div>
        </div>

        {/* ====================================================
            DIVIDER
        ==================================================== */}
        <div
          className="
            mt-16 h-px w-full
            bg-[#334155]
            sm:mt-20
          "
        />

        {/* ====================================================
            BOTTOM
        ==================================================== */}
        <div
          className="
            footer-bottom
            mt-7
            flex flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-[13px]
              font-medium
              text-[#64748B]
            "
          >
            © {new Date().getFullYear()} MLSentinel.
            All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* ==================================================
                GITHUB
            ================================================== */}
            <a
              href="https://github.com/Narasimha440/mlsentinel"
              target="_blank"
              rel="noreferrer"
              aria-label="MLSentinel GitHub"
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                border border-[#334155]
                text-[#94A3B8]
                transition-colors
                duration-200
                hover:border-[#475569]
                hover:text-white
              "
            >
              <GithubIcon />
            </a>

            {/* ==================================================
                EMAIL
            ================================================== */}
            <a
              href="mailto:narasimhadhoni.a@gmail.com"
              aria-label="Contact MLSentinel by email"
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                border border-[#334155]
                text-[#94A3B8]
                transition-colors
                duration-200
                hover:border-[#475569]
                hover:text-white
              "
            >
              <Mail className="h-4 w-4" />
            </a>

            {/* ==================================================
                BACK TO TOP
            ================================================== */}
            <a
              href="#top"
              className="
                inline-flex
                items-center
                gap-2
                text-[13px]
                font-medium
                text-[#94A3B8]
                transition-colors
                duration-200
                hover:text-white
              "
            >
              Back to top

              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="
        group
        inline-flex
        items-center
        gap-1.5
        text-[14px]
        font-medium
        text-[#CBD5E1]
        transition-colors
        duration-200
        hover:text-white
      "
    >
      {label}

      <ArrowUpRight
        className="
          h-3.5 w-3.5
          opacity-0
          transition-all
          duration-200
          group-hover:translate-x-0.5
          group-hover:-translate-y-0.5
          group-hover:opacity-100
        "
      />
    </a>
  );
}