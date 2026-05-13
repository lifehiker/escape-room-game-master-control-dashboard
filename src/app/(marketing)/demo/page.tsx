import { DemoShot } from "@/components/marketing/demo-shot";
import { CtaLink } from "@/components/marketing/cta-link";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Sandbox Demo</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-muted)]">
        Explore the product shape without signing up. The seeded demo accounts on `/login` give you the full interactive dashboard, while this page previews the live control surface in a safe public snapshot.
      </p>
      <div className="mt-10">
        <DemoShot />
      </div>
      <div className="mt-8">
        <CtaLink href="/login">Open demo credentials</CtaLink>
      </div>
    </div>
  );
}
