import { buildMetadata } from "@/lib/seo";
import { CtaLink } from "@/components/marketing/cta-link";
import { DemoShot } from "@/components/marketing/demo-shot";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Escape Room Control Software",
  description:
    "Browser-based escape room control software for game masters. Run hints, timers, reset logs, and staff handoffs from one dashboard.",
  path: "/",
  keywords: ["escape room control software", "escape room game master dashboard", "escape room live ops software"],
});

export default function HomePage() {
  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge className="border-black/10 bg-black/5 text-[var(--color-ink)]">
              Escape room control software
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-[var(--color-ink)] lg:text-7xl">
              Run hints, timers, resets, and handoffs from one live dashboard.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-ink-muted)]">
              Master Control is browser-based escape room game master software for operators who still juggle
              spreadsheets, timers, cue sheets, and paper reset logs during live sessions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/dashboard" eventName="cta_trial_start" eventProps={{ location: "home_hero" }}>
                Start 14-day trial
              </CtaLink>
              <CtaLink href="/demo" variant="secondary" eventName="cta_demo_open" eventProps={{ location: "home_hero" }}>
                Open sandbox demo
              </CtaLink>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Templates", "Reusable room stages, hints, and cues"],
                ["Live ops", "Pause, resume, and log every operator action"],
                ["Reset logs", "Track resets with timestamps and staff attribution"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <p className="font-semibold text-[var(--color-ink)]">{title}</p>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <DemoShot />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["Venue + room setup", "Create a venue, define rooms, store durations, notes, and default runbooks."],
            ["Operator workflow", "Send hints, fire cues, pause timers, and keep the log clean during shift handoffs."],
            ["Subscription guardrails", "Plan-based room limits plus local-safe billing fallbacks when Stripe is unavailable."],
          ].map(([title, copy]) => (
            <Card key={title}>
              <p className="text-lg font-semibold text-[var(--color-ink)]">{title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">{copy}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
