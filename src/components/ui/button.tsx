import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white shadow-lg shadow-[rgba(201,107,59,0.22)] hover:bg-[var(--color-accent-soft)]",
  secondary:
    "border border-[var(--color-line)] bg-white/70 text-[var(--color-ink)] hover:bg-white",
  ghost: "text-[var(--color-ink)] hover:bg-black/5",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
});
