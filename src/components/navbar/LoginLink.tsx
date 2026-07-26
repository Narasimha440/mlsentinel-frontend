import { cn } from "../../lib/cn";

export function LoginLink({ className }: { className?: string }) {
  return (
    <a
      href="/login"
      className={cn(
        "rounded-full px-4 py-2 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-gray-100",
        className
      )}
    >
      Login
    </a>
  );
}