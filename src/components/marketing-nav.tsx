import Link from "next/link";

import { CtaLink } from "@/components/marketing/cta-link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[rgba(252,247,239,0.88)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-panel-solid)] text-sm font-bold uppercase tracking-[0.3em] text-white">
            MC
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Escape Room SaaS</p>
            <p className="text-lg font-semibold text-[var(--color-ink)]">Master Control</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[var(--color-ink-muted)] md:flex">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/templates">Templates</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/demo">Sandbox Demo</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[var(--color-ink-muted)]">
            Sign in
          </Link>
          <CtaLink href="/dashboard">Start trial</CtaLink>
        </div>
      </div>
    </header>
  );
}
