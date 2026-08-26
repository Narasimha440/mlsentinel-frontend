import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = {
  floating?: boolean;
  className?: string;
};

export function GetStartedButton({ floating = false, className, }: Props) {
  return (
    <a
      href="/signup"
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-white transition-none hover:bg-black",
        className
      )}
    >
      <span>Get Started</span>

      {floating && (
        <span className="ml-2 flex items-center">
          <ArrowRight
            className="h-4 w-4"
            strokeWidth={2.5}
          />
        </span>
      )}
    </a>
  );
}