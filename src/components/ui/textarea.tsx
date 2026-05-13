import { TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-3xl border border-[var(--color-line)] bg-white/90 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(201,107,59,0.15)]",
        className,
      )}
      {...props}
    />
  );
});
