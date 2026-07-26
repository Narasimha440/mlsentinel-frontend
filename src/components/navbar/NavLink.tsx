import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent",
        className
      )}
    >
      {children}
    </a>
  );
}