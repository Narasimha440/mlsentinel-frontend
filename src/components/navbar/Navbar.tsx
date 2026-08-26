"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";

import { useScrolled } from "../../hooks/useScrolled";
import { cn } from "../../lib/cn";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { LoginLink } from "./LoginLink";
import { GetStartedButton } from "./GetStartedButton";
import { MenuToggle } from "./MenuToggle";

export function Navbar() {
  const floating = useScrolled(120);

  const [open, setOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const showFull = !floating || open;

  // ---------------------------------------------
  // GSAP: ONLY THE ENTIRE NAVBAR ANIMATES
  // ---------------------------------------------

  useLayoutEffect(() => {
    const nav = navRef.current;

    if (!nav) return;

    gsap.killTweensOf(nav);

    if (floating) {
      // The header starts hidden and is the only element that animates.
      gsap.fromTo(
        nav,
        {
          y: -100,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: "power3.out",
          overwrite: true,
        }
      );

      hasAnimatedRef.current = true;
    } else if (hasAnimatedRef.current) {
      gsap.to(nav, {
        y: -100,
        autoAlpha: 0,
        duration: 0.45,
        ease: "power3.in",
        overwrite: true,
      });
    }

    return () => {
      gsap.killTweensOf(nav);
    };
  }, [floating]);

  return (
    <header
      ref={navRef}
      className="
        pointer-events-none
        fixed
        inset-x-0
        top-0
        z-50
        flex
        justify-end
        pr-6
        opacity-0
        will-change-transform
        max-md:pr-4
      "
    >
      <nav
        className={cn(
          "pointer-events-auto overflow-hidden",
          floating
            ? `
              mt-4
              rounded-[28px]
              border
              border-black/5
              bg-white/85
              shadow-[0_8px_30px_rgba(17,24,39,0.08)]
              backdrop-blur-sm
            `
            : `
              mt-6
              w-full
              bg-white
            `
        )}
      >
        {/* MAIN ROW */}

        <div
          className={cn(
            "flex items-center",
            floating
              ? "gap-5 p-2.5 pl-4"
              : "mx-auto h-20 w-full max-w-[1280px] px-8 max-md:px-5"
          )}
        >
          {/* FLOATING HAMBURGER */}

          {floating && (
            <MenuToggle
              open={open}
              onClick={toggle}
            />
          )}

          {/* LOGO */}

          <div>
            <Logo compact={floating} />
          </div>

          {/* DOCUMENTATION */}

          {showFull && (
            <div
              className={cn(
                !floating &&
                  "ml-14 max-md:hidden lg:ml-[88px]",
                floating && "ml-3"
              )}
            >
              <NavLink href="/docs">
                Documentation
              </NavLink>
            </div>
          )}

          {/* RIGHT CLUSTER */}

          <div className="ml-auto flex shrink-0 items-center gap-2">

            {/* LOGIN */}

            {showFull && (
              <LoginLink
                className={cn(
                  !floating && "max-md:hidden"
                )}
              />
            )}

            {/* GET STARTED — NO ANIMATION */}

            <GetStartedButton
              floating={floating}
              className={cn(
                !floating && "max-md:hidden"
              )}
            />

            {/* MOBILE MENU */}

            {!floating && (
              <MenuToggle
                open={open}
                onClick={toggle}
                className="md:hidden"
              />
            )}
          </div>
        </div>

        {/* MOBILE DROPDOWN */}

        <AnimatePresence>
          {!floating && open && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              className="
                overflow-hidden
                border-t
                border-line
                md:hidden
              "
            >
              <div className="flex flex-col gap-1 px-5 py-4">
                <NavLink
                  href="/docs"
                  className="py-2.5"
                >
                  Documentation
                </NavLink>

                <LoginLink
                  className="
                    px-0
                    py-2.5
                    hover:bg-transparent
                  "
                />

                <GetStartedButton
                  className="mt-2 w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}