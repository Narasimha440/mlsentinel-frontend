"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const codeLines = [
  {
    number: "1",
    content: (
      <>
        <span className="kw">from</span>{" "}
        <span className="module">mlsentinel</span>{" "}
        <span className="kw">import</span>{" "}
        <span className="plain">MLDoc</span>
      </>
    ),
  },
  {
    number: "2",
    content: <>&nbsp;</>,
  },
  {
    number: "3",
    content: (
      <>
        <span className="plain">client</span>{" "}
        <span className="op">=</span>{" "}
        <span className="class-name">MLDoc</span>
        <span className="plain">(</span>
        <span className="string">"YOUR_API_KEY"</span>
        <span className="plain">)</span>
      </>
    ),
  },
  {
    number: "4",
    content: <>&nbsp;</>,
  },
  {
    number: "5",
    content: (
      <>
        <span className="plain">metrics</span>{" "}
        <span className="op">=</span>{" "}
        <span className="plain">{"{"}</span>
      </>
    ),
  },
  {
    number: "6",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="string">"accuracy"</span>
        <span className="plain">:</span>{" "}
        <span className="number">0.95</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "7",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="string">"precision"</span>
        <span className="plain">:</span>{" "}
        <span className="number">0.94</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "8",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="string">"recall"</span>
        <span className="plain">:</span>{" "}
        <span className="number">0.93</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "9",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="string">"f1_score"</span>
        <span className="plain">:</span>{" "}
        <span className="number">0.935</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "10",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="string">"roc_auc"</span>
        <span className="plain">:</span>{" "}
        <span className="number">0.98</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "11",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="string">"val_loss"</span>
        <span className="plain">:</span>{" "}
        <span className="number">0.18</span>
      </>
    ),
  },
  {
    number: "12",
    content: (
      <>
        <span className="plain">{"}"}</span>
      </>
    ),
  },
  {
    number: "13",
    content: <>&nbsp;</>,
  },
  {
    number: "14",
    content: (
      <>
        <span className="plain">client</span>
        <span className="op">.</span>
        <span className="method">auto_report</span>
        <span className="plain">(</span>
      </>
    ),
  },
  {
    number: "15",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="property">project</span>
        <span className="plain">=</span>
        <span className="string">"Spam Detector"</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "16",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="property">model</span>
        <span className="plain">=</span>
        <span className="string">"Random Forest"</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "17",
    content: (
      <>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="property">metrics</span>
        <span className="plain">=</span>
        <span className="plain">metrics</span>
        <span className="plain">,</span>
      </>
    ),
  },
  {
    number: "18",
    content: (
      <>
        <span className="plain">)</span>
      </>
    ),
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track) return;

    const ctx = gsap.context(() => {
      const svgPaths =
        gsap.utils.toArray<SVGPathElement>(".signal-path");

      const signalDots =
        gsap.utils.toArray<SVGCircleElement>(".signal-dot");

      /*
       * =====================================================
       * HORIZONTAL DISTANCE
       * =====================================================
       */

      const getDistance = () => {
        return Math.max(
          track.scrollWidth - viewport.offsetWidth,
          0
        );
      };

      /*
       * =====================================================
       * HORIZONTAL SCROLL
       *
       * IMPORTANT:
       *
       * There is ONLY ONE ScrollTrigger controlling
       * the horizontal section.
       * =====================================================
       */

      const readingGap = 400;

      const horizontalTween = gsap.timeline({
        scrollTrigger: {
          trigger: viewport,

          start: "top 100px",

          end: () => {
            const distance = getDistance();

            return `+=${distance + readingGap}`;
          },

          scrub: 1,

          pin: true,

          anticipatePin: 1,

          invalidateOnRefresh: true,

          /*
           * Uncomment temporarily if you need to debug
           *
           * markers: true,
           */
        },
      });

      horizontalTween.to(track, {
        x: () => -getDistance(),

        duration: 1,

        ease: "none",
      });

      /*
       * =====================================================
       * SVG SIGNAL LINE
       * =====================================================
       */

      svgPaths.forEach((path) => {
        const length = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,

          duration: 2.2,

          ease: "none",

          scrollTrigger: {
            trigger: ".evaluation-scene",

            start: "left 75%",

            end: "right 40%",

            scrub: 1,

            invalidateOnRefresh: true,
          },
        });
      });

      /*
       * =====================================================
       * SVG SIGNAL DOTS
       * =====================================================
       */

      gsap.fromTo(
        signalDots,
        {
          scale: 0,

          transformOrigin: "center",
        },
        {
          scale: 1,

          stagger: 0.18,

          duration: 0.5,

          ease: "back.out(1.8)",

          scrollTrigger: {
            trigger: ".evaluation-scene",

            start: "left 75%",

            once: true,

            invalidateOnRefresh: true,
          },
        }
      );

      /*
       * =====================================================
       * METRIC BARS
       * =====================================================
       */

      gsap.fromTo(
        ".metric-bar-fill",
        {
          scaleX: 0,
        },
        {
          scaleX: 1,

          transformOrigin: "left center",

          duration: 1.2,

          stagger: 0.12,

          ease: "power2.out",

          scrollTrigger: {
            trigger: ".monitoring-scene",

            start: "left 75%",

            once: true,

            invalidateOnRefresh: true,
          },
        }
      );

      /*
       * =====================================================
       * DETECTION PULSE
       * =====================================================
       */

      gsap.fromTo(
        ".detection-marker",
        {
          opacity: 0,

          scale: 0.7,
        },
        {
          opacity: 1,

          scale: 1,

          duration: 0.7,

          ease: "back.out(1.7)",

          scrollTrigger: {
            trigger: ".detection-scene",

            start: "left 75%",

            once: true,

            invalidateOnRefresh: true,
          },
        }
      );

      /*
       * =====================================================
       * ALERT NOTIFICATION
       * =====================================================
       */

      gsap.fromTo(
        ".alert-notification",
        {
          opacity: 0,

          y: 20,
        },
        {
          opacity: 1,

          y: 0,

          duration: 0.7,

          ease: "power3.out",

          scrollTrigger: {
            trigger: ".alert-scene",

            start: "left 75%",

            once: true,

            invalidateOnRefresh: true,
          },
        }
      );

      /*
       * =====================================================
       * REFRESH
       * =====================================================
       */

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        how-it-works
        relative
        w-full
        overflow-hidden
        bg-[#0F1720]
        text-white
      "
    >
      {/* =====================================================
          INTRO
      ===================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1240px]
          px-6
          pt-28
          sm:px-8
          lg:px-10
          lg:pt-32
        "
      >
        <div className="max-w-[780px]">
          <p
            className="
              mb-5
              text-[13px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#60A5FA]
            "
          >
            HOW IT WORKS
          </p>

          <h2
            className="
              text-[48px]
              font-semibold
              leading-[0.98]
              tracking-[-0.055em]
              text-[#F8FAFC]
              sm:text-[58px]
              lg:text-[72px]
            "
          >
            From model run
            <br />
            to useful signal.
          </h2>

          <p
            className="
              mt-7
              max-w-[720px]
              text-[18px]
              font-medium
              leading-[1.7]
              text-[#94A3B8]
              sm:text-[19px]
              lg:text-[20px]
            "
          >
            Send your model metrics. MLSentinel evaluates the
            run, tracks health over time, and tells you when
            something changes.
          </p>
        </div>
      </div>

      {/* =====================================================
          HORIZONTAL EXPERIENCE
      ===================================================== */}

      <div
        ref={viewportRef}
        className="
          relative
          mt-20
          flex
          h-[620px]
          w-full
          items-center
          overflow-hidden
          sm:mt-24
          lg:mt-28
        "
      >
        <div
          ref={trackRef}
          className="
            flex
            w-max
            items-center
            gap-8
            px-6
            pr-16
            will-change-transform
            sm:gap-10
            sm:px-8
            lg:gap-12
            lg:px-10
          "
        >
          {/* =====================================================
              01 — MODEL
          ====================================================== */}

          <div className="workflow-scene workflow-model">
            <div className="scene-label">01</div>

            <div className="scene-content">
              <div className="scene-kicker">MODEL</div>

              <h3>Create your model.</h3>

              <p>
                Connect the model you already run in production.
              </p>

              <div className="model-interface">
                <div className="interface-row">
                  <span>Model</span>
                  <strong>Spam Detector</strong>
                </div>

                <div className="interface-row">
                  <span>Algorithm</span>
                  <strong>Random Forest</strong>
                </div>

                <div className="interface-row">
                  <span>Environment</span>

                  <span className="status">
                    <i />
                    Production
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              02 — SDK
          ====================================================== */}

          <div className="workflow-scene workflow-sdk">
            <div className="scene-label">02</div>

            <div className="scene-content">
              <div className="scene-kicker">SDK</div>

              <h3>Send metrics with one call.</h3>

              <p>
                Add MLSentinel to your existing Python workflow.
              </p>

              <div className="code-editor">
                <div className="editor-top">
                  <div className="editor-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <span>test.py</span>
                </div>

                <div className="code-body">
                  {codeLines.map((line) => (
                    <div
                      className="code-line"
                      key={line.number}
                    >
                      <span className="line-number">
                        {line.number}
                      </span>

                      <code>{line.content}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              03 — EVALUATION
          ====================================================== */}

          <div
            className="
              workflow-scene
              workflow-evaluation
              evaluation-scene
            "
          >
            <div className="scene-label">03</div>

            <div className="scene-content">
              <div className="scene-kicker">EVALUATION</div>

              <h3>Turn metrics into a signal.</h3>

              <p>
                MLSentinel evaluates every run before tracking its
                health.
              </p>

              <div className="analysis-engine">
                <svg
                  viewBox="0 0 700 260"
                  className="signal-svg"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    className="signal-path"
                    d="
                      M20 130
                      C100 130 105 55 180 55
                      C255 55 250 205 330 205
                      C410 205 405 65 490 65
                      C575 65 575 130 680 130
                    "
                    stroke="#334155"
                    strokeWidth="2"
                  />

                  <path
                    className="signal-path"
                    d="
                      M20 130
                      C100 130 105 55 180 55
                      C255 55 250 205 330 205
                      C410 205 405 65 490 65
                      C575 65 575 130 680 130
                    "
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />

                  <circle
                    className="signal-dot"
                    cx="20"
                    cy="130"
                    r="7"
                    fill="#3B82F6"
                  />

                  <circle
                    className="signal-dot"
                    cx="180"
                    cy="55"
                    r="7"
                    fill="#3B82F6"
                  />

                  <circle
                    className="signal-dot"
                    cx="330"
                    cy="205"
                    r="7"
                    fill="#3B82F6"
                  />

                  <circle
                    className="signal-dot"
                    cx="490"
                    cy="65"
                    r="7"
                    fill="#3B82F6"
                  />

                  <circle
                    className="signal-dot"
                    cx="680"
                    cy="130"
                    r="7"
                    fill="#22C55E"
                  />
                </svg>

                <div className="engine-box">
                  <div className="engine-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3" />
                      <path d="M12 19v3" />
                      <path d="M2 12h3" />
                      <path d="M19 12h3" />
                      <path d="m4.9 4.9 2.1 2.1" />
                      <path d="m17 17 2.1 2.1" />
                      <path d="m19.1 4.9-2.1 2.1" />
                      <path d="m7 17-2.1 2.1" />
                    </svg>
                  </div>

                  <span>Analysis engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              04 — MONITORING
          ====================================================== */}

          <div
            className="
              workflow-scene
              workflow-monitoring
              monitoring-scene
            "
          >
            <div className="scene-label">04</div>

            <div className="scene-content">
              <div className="scene-kicker">MONITORING</div>

              <h3>Keep model health visible.</h3>

              <p>
                Track the metrics that matter as your model runs.
              </p>

              <div className="monitor-panel">
                <div className="monitor-header">
                  <span>Model health</span>

                  <strong>96.05%</strong>
                </div>

                <div className="metric-bars">
                  <MetricBar
                    label="Accuracy"
                    value="95%"
                  />

                  <MetricBar
                    label="Precision"
                    value="94%"
                  />

                  <MetricBar
                    label="Recall"
                    value="93%"
                  />

                  <MetricBar
                    label="F1 score"
                    value="93.5%"
                  />
                </div>

                <svg
                  className="mini-chart"
                  viewBox="0 0 650 150"
                  fill="none"
                >
                  <path
                    d="M0 115 C80 100 110 105 160 82 C220 55 250 95 300 70 C355 43 390 80 440 58 C500 32 540 65 650 22"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />

                  <path
                    d="M0 115 C80 100 110 105 160 82 C220 55 250 95 300 70 C355 43 390 80 440 58 C500 32 540 65 650 22"
                    stroke="#3B82F6"
                    strokeWidth="7"
                    opacity="0.06"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* =====================================================
              05 — DETECTION
          ====================================================== */}

          <div
            className="
              workflow-scene
              workflow-detection
              detection-scene
            "
          >
            <div className="scene-label">05</div>

            <div className="scene-content">
              <div className="scene-kicker">DETECTION</div>

              <h3>Catch meaningful changes.</h3>

              <p>
                Spot regression before it becomes a production
                problem.
              </p>

              <div className="detection-panel">
                <div className="detection-row">
                  <div>
                    <span>Previous F1 score</span>
                    <strong>0.935</strong>
                  </div>

                  <span className="stable">
                    Stable
                  </span>
                </div>

                <div className="detection-line" />

                <div className="detection-row">
                  <div>
                    <span>Current F1 score</span>

                    <strong className="danger-value">
                      0.887
                    </strong>
                  </div>

                  <span className="changed">
                    Changed
                  </span>
                </div>

                <div className="detection-marker">
                  <span>− 5.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              06 — ALERT
          ====================================================== */}

          <div
            className="
              workflow-scene
              workflow-alert
              alert-scene
            "
          >
            <div className="scene-label">06</div>

            <div className="scene-content">
              <div className="scene-kicker">ALERT</div>

              <h3>Know when to act.</h3>

              <p>
                Get a clear signal when your model needs attention.
              </p>

              <div className="alert-notification">
                <div className="alert-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </div>

                <div className="alert-copy">
                  <strong>
                    Model needs attention
                  </strong>

                  <span>
                    F1 score dropped by 5.1% in the latest run.
                  </span>

                  <button type="button">
                    View details
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FINAL GAP
      ===================================================== */}

      <div className="h-24 lg:h-32" />

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`
        .workflow-scene {
          position: relative;
          width: 620px;
          height: 430px;
          flex-shrink: 0;
          overflow: hidden;

          border: 1px solid #263241;
          border-radius: 24px;

          background: #151d28;

          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .scene-label {
          position: absolute;
          top: 24px;
          right: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          border: 1px solid #334155;
          border-radius: 50%;

          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .scene-content {
          padding: 42px;
        }

        .scene-kicker {
          margin-bottom: 12px;

          color: #60a5fa;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.18em;
        }

        .scene-content h3 {
          margin: 0;

          color: #f8fafc;

          font-size: 34px;
          line-height: 1.05;
          letter-spacing: -0.04em;
          font-weight: 600;
        }

        .scene-content > p {
          max-width: 470px;
          margin: 15px 0 0;

          color: #94a3b8;

          font-size: 15px;
          line-height: 1.6;
        }

        /* MODEL */

        .model-interface {
          margin-top: 34px;

          border: 1px solid #263241;
          border-radius: 14px;

          background: #111923;
          overflow: hidden;
        }

        .interface-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 15px 18px;

          border-bottom: 1px solid #263241;

          font-size: 13px;
        }

        .interface-row:last-child {
          border-bottom: 0;
        }

        .interface-row > span:first-child {
          color: #64748b;
        }

        .interface-row strong {
          color: #e2e8f0;
          font-weight: 500;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #cbd5e1;
        }

        .status i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
        }

        /* SDK */

        .code-editor {
          margin-top: 27px;

          height: 275px;

          overflow: hidden;

          border: 1px solid #263241;
          border-radius: 14px;

          background: #0b1118;

          font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;
        }

        .editor-top {
          display: flex;
          align-items: center;
          gap: 14px;

          height: 42px;

          padding: 0 15px;

          border-bottom: 1px solid #263241;

          color: #64748b;

          font-size: 12px;
        }

        .editor-dots {
          display: flex;
          gap: 6px;
        }

        .editor-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #475569;
        }

        .code-body {
          padding: 15px 0;
        }

        .code-line {
          display: flex;

          min-height: 17px;

          padding-right: 15px;

          font-size: 11px;
          line-height: 1.55;
          white-space: nowrap;
        }

        .line-number {
          width: 42px;
          flex-shrink: 0;

          padding-right: 12px;

          text-align: right;

          color: #475569;

          user-select: none;
        }

        .code-line code {
          color: #cbd5e1;
        }

        .kw {
          color: #60a5fa;
        }

        .module {
          color: #c084fc;
        }

        .class-name,
        .method {
          color: #f8fafc;
        }

        .string {
          color: #4ade80;
        }

        .number {
          color: #fbbf24;
        }

        .property {
          color: #93c5fd;
        }

        .op,
        .plain {
          color: #cbd5e1;
        }

        /* EVALUATION */

        .analysis-engine {
          position: relative;

          margin-top: 28px;

          height: 245px;

          border: 1px solid #263241;
          border-radius: 14px;

          background: #111923;
        }

        .signal-svg {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;
        }

        .engine-box {
          position: absolute;
          top: 50%;
          left: 50%;

          display: flex;
          align-items: center;
          gap: 10px;

          transform: translate(-50%, -50%);

          padding: 12px 16px;

          border: 1px solid #334155;
          border-radius: 10px;

          background: #151d28;

          color: #cbd5e1;

          font-size: 12px;
          font-weight: 600;

          white-space: nowrap;
        }

        .engine-icon {
          display: grid;
          place-items: center;

          width: 26px;
          height: 26px;

          color: #60a5fa;
        }

        /* MONITORING */

        .monitor-panel {
          margin-top: 28px;

          padding: 22px;

          border: 1px solid #263241;
          border-radius: 14px;

          background: #111923;
        }

        .monitor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #94a3b8;

          font-size: 12px;
        }

        .monitor-header strong {
          color: #f8fafc;
          font-size: 20px;
        }

        .metric-bars {
          display: grid;
          gap: 12px;

          margin-top: 22px;
        }

        .metric-row {
          display: grid;
          grid-template-columns: 90px 1fr 45px;
          align-items: center;
          gap: 10px;

          color: #64748b;
          font-size: 11px;
        }

        .metric-track {
          height: 5px;

          overflow: hidden;

          border-radius: 999px;

          background: #263241;
        }

        .metric-bar-fill {
          width: 100%;
          height: 100%;

          border-radius: inherit;

          background: #3b82f6;
        }

        .metric-row strong {
          color: #cbd5e1;
          font-size: 11px;
          text-align: right;
        }

        .mini-chart {
          width: 100%;
          height: 70px;

          margin-top: 20px;
        }

        /* DETECTION */

        .detection-panel {
          position: relative;

          margin-top: 28px;

          padding: 20px;

          border: 1px solid #263241;
          border-radius: 14px;

          background: #111923;
        }

        .detection-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .detection-row div {
          display: grid;
          gap: 6px;
        }

        .detection-row span {
          color: #64748b;
          font-size: 11px;
        }

        .detection-row strong {
          color: #e2e8f0;
          font-size: 20px;
        }

        .danger-value {
          color: #f87171 !important;
        }

        .stable,
        .changed {
          padding: 5px 8px;

          border-radius: 6px;

          font-size: 10px !important;
          font-weight: 600;
        }

        .stable {
          color: #4ade80 !important;
          background: rgba(34, 197, 94, 0.08);
        }

        .changed {
          color: #f87171 !important;
          background: rgba(239, 68, 68, 0.08);
        }

        .detection-line {
          height: 1px;

          margin: 20px 0;

          background: #263241;
        }

        .detection-marker {
          position: absolute;
          right: 20px;
          bottom: 18px;

          padding: 6px 9px;

          border: 1px solid #7f1d1d;
          border-radius: 6px;

          background: #2a1518;

          color: #f87171;

          font-size: 11px;
          font-weight: 600;
        }

        /* ALERT */

        .alert-notification {
          display: flex;
          gap: 16px;

          margin-top: 30px;

          padding: 22px;

          border: 1px solid #3f3a2f;
          border-radius: 14px;

          background: #151a20;
        }

        .alert-icon {
          display: grid;
          place-items: center;

          width: 42px;
          height: 42px;
          flex-shrink: 0;

          border: 1px solid #92400e;
          border-radius: 10px;

          color: #f59e0b;
          background: #211b13;
        }

        .alert-icon svg {
          width: 20px;
          height: 20px;
        }

        .alert-copy {
          display: grid;
          gap: 7px;
        }

        .alert-copy strong {
          color: #f1f5f9;
          font-size: 14px;
        }

        .alert-copy span {
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.5;
        }

        .alert-copy button {
          width: fit-content;

          margin-top: 7px;

          border: 0;

          background: transparent;

          color: #60a5fa;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;
        }

        .alert-copy button span {
          margin-left: 6px;
          color: #60a5fa;
        }

        @media (max-width: 700px) {
          .workflow-scene {
            width: 88vw;
            height: 440px;
          }

          .scene-content {
            padding: 32px;
          }

          .scene-content h3 {
            font-size: 28px;
          }

          .code-editor {
            height: 290px;
          }

          .code-line {
            font-size: 9px;
          }

          .line-number {
            width: 34px;
          }
        }
      `}</style>
    </section>
  );
}

function MetricBar({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric-row">
      <span>{label}</span>

      <div className="metric-track">
        <div className="metric-bar-fill" />
      </div>

      <strong>{value}</strong>
    </div>
  );
}