"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Check, Terminal } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const codeLines = [
  {
    number: 1,
    content: (
      <>
        <span className="text-[#C084FC]">from</span>{" "}
        <span className="text-[#60A5FA]">mlsentinel</span>{" "}
        <span className="text-[#C084FC]">import</span>{" "}
        <span className="text-[#F8FAFC]">MLDoc</span>
      </>
    ),
  },

  {
    number: 2,
    content: <>&nbsp;</>,
  },

  {
    number: 3,
    content: (
      <>
        <span className="text-[#60A5FA]">client</span>{" "}
        <span className="text-[#CBD5E1]">=</span>{" "}
        <span className="text-[#FACC15]">MLDoc</span>
        <span className="text-[#CBD5E1]">(</span>
        <span className="text-[#86EFAC]">
          "YOUR_API_KEY"
        </span>
        <span className="text-[#CBD5E1]">)</span>
      </>
    ),
  },

  {
    number: 4,
    content: <>&nbsp;</>,
  },

  {
    number: 5,
    content: (
      <>
        <span className="text-[#60A5FA]">metrics</span>{" "}
        <span className="text-[#CBD5E1]">=</span>{" "}
        <span className="text-[#CBD5E1]">{"{"}</span>
      </>
    ),
  },

  {
    number: 6,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#86EFAC]">
          "accuracy"
        </span>
        <span className="text-[#CBD5E1]">:</span>{" "}
        <span className="text-[#FBBF24]">0.95</span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 7,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#86EFAC]">
          "precision"
        </span>
        <span className="text-[#CBD5E1]">:</span>{" "}
        <span className="text-[#FBBF24]">0.94</span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 8,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#86EFAC]">
          "recall"
        </span>
        <span className="text-[#CBD5E1]">:</span>{" "}
        <span className="text-[#FBBF24]">0.93</span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 9,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#86EFAC]">
          "f1_score"
        </span>
        <span className="text-[#CBD5E1]">:</span>{" "}
        <span className="text-[#FBBF24]">0.935</span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 10,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#86EFAC]">
          "roc_auc"
        </span>
        <span className="text-[#CBD5E1]">:</span>{" "}
        <span className="text-[#FBBF24]">0.98</span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 11,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#86EFAC]">
          "val_loss"
        </span>
        <span className="text-[#CBD5E1]">:</span>{" "}
        <span className="text-[#FBBF24]">0.18</span>
      </>
    ),
  },

  {
    number: 12,
    content: (
      <>
        <span className="text-[#CBD5E1]">{"}"}</span>
      </>
    ),
  },

  {
    number: 13,
    content: <>&nbsp;</>,
  },

  {
    number: 14,
    content: (
      <>
        <span className="text-[#60A5FA]">client</span>
        <span className="text-[#CBD5E1]">.</span>
        <span className="text-[#F8FAFC]">
          auto_report
        </span>
        <span className="text-[#CBD5E1]">(</span>
      </>
    ),
  },

  {
    number: 15,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#93C5FD]">
          project
        </span>
        <span className="text-[#CBD5E1]">=</span>
        <span className="text-[#86EFAC]">
          "Spam Detector"
        </span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 16,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#93C5FD]">
          model
        </span>
        <span className="text-[#CBD5E1]">=</span>
        <span className="text-[#86EFAC]">
          "Random Forest"
        </span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 17,
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-[#93C5FD]">
          metrics
        </span>
        <span className="text-[#CBD5E1]">=</span>
        <span className="text-[#F8FAFC]">
          metrics
        </span>
        <span className="text-[#CBD5E1]">,</span>
      </>
    ),
  },

  {
    number: 18,
    content: (
      <>
        <span className="text-[#CBD5E1]">)</span>
      </>
    ),
  },
];

export default function SDKSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const editor = editorRef.current;

    if (!section || !content || !editor) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          end: "top 25%",
          scrub: 1,
        },
      });

      /*
       * Left content comes in slightly from the left.
       */
      tl.fromTo(
        content,
        {
          opacity: 0,
          x: -50,
        },
        {
          opacity: 1,
          x: 0,
          ease: "power3.out",
        },
        0
      );

      /*
       * Editor comes from the right and slightly upward.
       */
      tl.fromTo(
        editor,
        {
          opacity: 0,
          x: 80,
          y: 30,
          rotateY: -6,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotateY: 0,
          ease: "power3.out",
        },
        0.08
      );

      /*
       * Individual code lines reveal after the editor.
       */
      tl.fromTo(
        lineRefs.current,
        {
          opacity: 0,
          x: 12,
        },
        {
          opacity: 1,
          x: 0,
          stagger: 0.025,
          ease: "power2.out",
        },
        0.22
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
        text-[#0F172A]

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
          gap-16
          px-6

          sm:px-8

          lg:grid-cols-[0.82fr_1.18fr]
          lg:gap-20
          lg:px-10
        "
      >
        {/* ==================================================
            LEFT CONTENT
        =================================================== */}

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
            PYTHON SDK
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
            One SDK call.
            <br />
            That's it.
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
            Integrate model monitoring into your existing
            workflow without rebuilding your ML pipeline.
          </p>

          <div className="mt-9 space-y-4">
            <Feature text="Validate locally before sending" />
            <Feature text="Send reports securely" />
            <Feature text="Track every model run" />
          </div>

          <a
            href="/docs"
            className="
              mt-10
              inline-flex
              items-center
              gap-2
              text-[16px]
              font-semibold
              text-[#2563EB]
              transition-transform
              duration-200
              hover:translate-x-1
            "
          >
            Read the documentation
            <ArrowUpRight size={18} strokeWidth={2} />
          </a>
        </div>

        {/* ==================================================
            CODE EDITOR
        =================================================== */}

        <div
          ref={editorRef}
          className="
            relative
            w-full
            overflow-hidden
            rounded-[18px]
            border
            border-[#1E293B]
            bg-[#0F172A]
            shadow-[0_30px_80px_rgba(15,23,42,0.16)]
            will-change-transform
          "
        >
          {/* Editor header */}

          <div
            className="
              flex
              h-[58px]
              items-center
              border-b
              border-[#253247]
              bg-[#111C30]
              px-5
            "
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#64748B]" />
              <span className="h-3 w-3 rounded-full bg-[#64748B]" />
              <span className="h-3 w-3 rounded-full bg-[#64748B]" />
            </div>

            <div
              className="
                ml-5
                flex
                items-center
                gap-2
                text-[13px]
                font-medium
                text-[#94A3B8]
              "
            >
              <Terminal size={15} />
              monitor.py
            </div>
          </div>

          {/* Code */}

          <div
            className="
              overflow-x-auto
              px-4
              py-6

              sm:px-6
              sm:py-7

              lg:px-7
              lg:py-8
            "
          >
            <pre
              className="
                m-0
                min-w-[620px]
                font-mono
                text-[13px]
                leading-[1.85]
                sm:text-[14px]
                lg:text-[14px]
              "
            >
              {codeLines.map((line, index) => (
                <div
                  key={line.number}
                  ref={(element) => {
                    lineRefs.current[index] = element;
                  }}
                  className="
                    flex
                    min-h-[26px]
                    whitespace-pre
                  "
                >
                  <span
                    className="
                      mr-6
                      w-6
                      shrink-0
                      select-none
                      text-right
                      text-[#475569]
                    "
                  >
                    {line.number}
                  </span>

                  <code>{line.content}</code>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURE
============================================================ */

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          text-[#2563EB]
        "
      >
        <Check size={18} strokeWidth={2.4} />
      </span>

      <span
        className="
          text-[16px]
          font-medium
          text-[#334155]
        "
      >
        {text}
      </span>
    </div>
  );
}