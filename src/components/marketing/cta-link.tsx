import Link from "next/link";

import { cn } from "@/lib/utils";

export function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-[var(--color-accent)] text-white shadow-lg shadow-[rgba(201,107,59,0.22)] hover:bg-[var(--color-accent-soft)]"
          : "border border-[var(--color-line)] bg-white/70 text-[var(--color-ink)] hover:bg-white",
        className,
      )}
    >
      {children}
    </Link>
  );
}
