import { cn } from "../../lib/cn";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="/"
      aria-label="MLSentinel home"
      className={cn("flex shrink-0 items-center", compact ? "h-8 gap-2" : "h-[42px] gap-3")}
    >
      {/* <Shield
        className={cn("text-accent", compact ? "h-5 w-5" : "h-[26px] w-[26px]")}
        strokeWidth={2.25}
        fill="currentColor"
        fillOpacity={0.12}
      /> */}
      {/* <span aria-hidden="true" className={cn("w-px bg-line", compact ? "h-5" : "h-[26px]")} /> */}
      <span className={cn("font-semibold tracking-tight text-ink", compact ? "text-base" : "text-[19px]")}>
        MLSentinel
      </span>
    </a>
  );
}