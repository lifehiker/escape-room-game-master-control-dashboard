import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "min-h-11 w-full rounded-2xl border border-[var(--color-line)] bg-white/90 px-4 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(201,107,59,0.15)]",
          className,
        )}
        {...props}
      />
    );
  },
);
