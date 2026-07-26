import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useScrolled } from "../../hooks/useScrolled";
import { SPRING, enter } from "../../lib/motion";
import { cn } from "../../lib/cn";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { LoginLink } from "./LoginLink";
import { GetStartedButton } from "./GetStartedButton";
import { MenuToggle } from "./MenuToggle";

export function Navbar() {
  const floating = useScrolled(120);
  // One flag drives both the mobile dropdown (docked) and the expanded pill (floating).
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Full links are visible when docked, or when the floating pill is expanded.
  const showFull = !floating || open;

  return (
    <MotionConfig transition={SPRING}>
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 flex",
          floating ? "justify-end pr-6 max-md:pr-4" : "justify-center"
        )}
      >
        <motion.nav
          layout
          animate={{ borderRadius: floating ? 28 : 0 }}
          className={cn(
            "pointer-events-auto overflow-hidden",
            floating
              ? "mt-4 border border-black/5 bg-white/85 shadow-[0_8px_30px_rgba(17,24,39,0.08)] backdrop-blur-sm"
              : "mt-6 w-full bg-white"
          )}
        >
          {/* ONE persistent row — nothing here ever remounts wholesale.
              The CTA is anchored right via ml-auto in every state. */}
          <motion.div
            layout
            className={cn(
              "flex items-center",
              floating
                ? "gap-5 p-2.5 pl-4"
                : "mx-auto h-20 w-full max-w-[1280px] px-8 max-md:px-5"
            )}
          >
            {/* Hamburger — only lives in the floating pill (desktop) or docked mobile */}
            <AnimatePresence mode="popLayout" initial={false}>
              {floating && (
                <motion.div
                  key="toggle"
                  layout="position"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
                >
                  <MenuToggle open={open} onClick={toggle} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={false}>
              {showFull && (
                <motion.div key="logo" layout="position" {...enter(0.05)}>
                  <Logo compact={floating} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={false}>
              {showFull && (
                <motion.div
                  key="doc"
                  layout="position"
                  {...enter(0.12)}
                  className={cn(!floating && "ml-14 max-md:hidden lg:ml-[88px]", floating && "ml-3")}
                >
                  <NavLink href="/docs">Documentation</NavLink>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right cluster — ml-auto pins it right in EVERY state */}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {showFull && (
                  <motion.div key="login" layout="position" {...enter(0.18)}>
                    <LoginLink className={cn(!floating && "max-md:hidden")} />
                  </motion.div>
                )}
              </AnimatePresence>

              <GetStartedButton floating={floating} className={cn(!floating && "max-md:hidden")} />

              {!floating && (
                <MenuToggle open={open} onClick={toggle} className="md:hidden" />
              )}
            </div>
          </motion.div>

          {/* Docked mobile dropdown */}
          <AnimatePresence>
            {!floating && open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-line md:hidden"
              >
                <div className="flex flex-col gap-1 px-5 py-4">
                  <NavLink href="/docs" className="py-2.5">
                    Documentation
                  </NavLink>
                  <LoginLink className="px-0 py-2.5 hover:bg-transparent" />
                  <GetStartedButton className="mt-2 w-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>
    </MotionConfig>
  );
}
