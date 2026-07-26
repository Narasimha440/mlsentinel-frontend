import type { ReactNode } from "react";

// Native scrolling keeps sticky sections dependable and lets Framer Motion own
// the scroll-driven product story without competing scroll transforms.
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
