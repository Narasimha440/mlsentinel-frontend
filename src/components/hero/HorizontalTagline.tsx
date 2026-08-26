"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const TAGLINE =
  "Your model changes over time. MLSentinel makes sure you know when it matters.";

export default function HorizontalTagline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;

    if (!section || !text) return;

    const ctx = gsap.context(() => {
      /*
       * Split the sentence into characters.
       *
       * This is the same basic technique used
       * by the GSAP horizontal-text demo.
       */
      const split = SplitText.create(text, {
        type: "chars,words",
        charsClass: "tagline-char",
        wordsClass: "tagline-word",
        aria: "auto",
        preseveSpaces: true,
      });

      split.words?.forEach((word) => {
        gsap.set(word, {
            marginRight: "0.22em",
        });
      });

      /*
       * Initial character state.
       */
      gsap.set(split.chars, {
        transformOrigin: "50% 50%",
      });

      /*
       * Main horizontal movement.
       *
       * The section is pinned while the sentence
       * travels from right -> left.
       */
      const horizontalTween = gsap.to(text, {
        xPercent: -100,
        ease: "none",

        scrollTrigger: {
          trigger: section,

          start: "top top",

          /*
           * Longer distance gives the user enough
           * time to actually read the sentence.
           */
          end: "+=4200",

          pin: true,
          pinSpacing: true,

          scrub: 1,

          anticipatePin: 1,

          invalidateOnRefresh: true,

          /*
           * Keep the tagline above the next section
           * while it is pinned.
           */
          onEnter: () => {
            gsap.set(section, {
              zIndex: 20,
            });
          },

          onEnterBack: () => {
            gsap.set(section, {
              zIndex: 20,
            });
          },

          onLeave: () => {
            gsap.set(section, {
              zIndex: 1,
            });
          },

          onLeaveBack: () => {
            gsap.set(section, {
              zIndex: 1,
            });
          },
        },
      });

      /*
       * CHARACTER ANIMATION
       *
       * This is the important part from the
       * GSAP horizontal text concept.
       *
       * Each character gets its own ScrollTrigger
       * based on the horizontal container animation.
       */
      split.chars.forEach((char, index) => {
        gsap.fromTo(
          char,

          {
            yPercent: index % 2 === 0 ? -80 : 80,
            rotation: index % 2 === 0 ? -8 : 8,
            opacity: 0.65,
          },

          {
            yPercent: 0,
            rotation: 0,
            opacity: 1,

            ease: "power2.out",

            scrollTrigger: {
              trigger: char,

              containerAnimation: horizontalTween,

              /*
               * Character starts animating when
               * it enters from the right.
               */
              start: "left 100%",

              /*
               * Character finishes when it reaches
               * around the center of the viewport.
               */
              end: "left 45%",

              scrub: 1,
            },
          }
        );
      });

      /*
       * Refresh after fonts/layout are ready.
       */
      const refresh = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", refresh);

      window.addEventListener("load", refresh);

      if (document.fonts) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        window.removeEventListener("resize", refresh);
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
        z-[1]
        w-full
        overflow-hidden
        bg-[#F8FAFC]
      "
    >
      <div
        className="
          relative
          flex
          h-screen
          min-h-[620px]
          w-full
          items-center
          overflow-hidden
        "
      >
        <h2
          ref={textRef}
          className="
            m-0
            block
            w-max
            whitespace-nowrap
            pl-[100vw]
            pr-[10vw]
            text-[clamp(56px,9vw,150px)]
            font-semibold
            leading-[0.95]
            tracking-[-0.065em]
            text-[#0F172A]
            will-change-transform
          "
        >
          {TAGLINE}
        </h2>
      </div>
    </section>
  );
}