import { buildMetadata } from "@/lib/seo";
import { DemoShot } from "@/components/marketing/demo-shot";
import { CtaLink } from "@/components/marketing/cta-link";

export const metadata = buildMetadata({
  title: "Sandbox Demo",
  description:
    "Preview the Master Control interface with a public sandbox snapshot, then open the seeded demo accounts for the full escape room dashboard.",
  path: "/demo",
  keywords: ["escape room software demo", "escape room dashboard demo"],
});

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
        <CtaLink href="/login" eventName="cta_demo_credentials" eventProps={{ location: "demo_page" }}>
          Open demo credentials
        </CtaLink>
      </div>
    </div>
  );
}
