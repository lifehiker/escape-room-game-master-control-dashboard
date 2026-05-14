import { PLAN_DETAILS } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { CtaLink } from "@/components/marketing/cta-link";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Pricing</p>
        <h1 className="mt-4 text-5xl font-semibold text-[var(--color-ink)]">Subscription pricing for live room operations.</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
          No permanent free plan. Start with a 14-day trial, validate the workflow on a real room, then keep the room and team limits that match your venue.
        </p>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {Object.values(PLAN_DETAILS).map((plan) => (
          <Card key={plan.name} className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">{plan.name}</p>
              <h2 className="mt-2 text-4xl font-semibold text-[var(--color-ink)]">{plan.price}/mo</h2>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{plan.tagline}</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--color-ink-muted)]">
              <p>Rooms: {Number.isFinite(plan.roomLimit) ? plan.roomLimit : "Unlimited"}</p>
              <p>Users: {Number.isFinite(plan.userLimit) ? plan.userLimit : "Unlimited"}</p>
              <p>Trial: 14 days</p>
            </div>
            <CtaLink href="/dashboard" className="w-full">
              Start trial
            </CtaLink>
          </Card>
        ))}
      </div>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Compare Starter, Venue, and Designer pricing for browser-based escape room control software with a 14-day trial.",
  path: "/pricing",
  keywords: ["escape room software pricing", "escape room control software pricing"],
});
