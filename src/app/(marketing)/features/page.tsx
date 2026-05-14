import { DemoShot } from "@/components/marketing/demo-shot";
import { Card } from "@/components/ui/card";

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Features</p>
        <h1 className="mt-4 text-5xl font-semibold text-[var(--color-ink)]">Live control features built for actual room operations.</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
          The product is intentionally focused: room setup, templates, live sessions, event logging, handoff notes, reset runs, billing guardrails, and shared staff access.
        </p>
      </div>
      <div className="mt-10">
        <DemoShot title="Operator command center" subtitle="Everything the game master needs, without booking software overhead." />
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {[
          ["Room templates", "Pre-write hints per stage, store timed cues, and mark a default runbook for each room."],
          ["Live session timer", "Start, pause, resume, and end sessions with persisted timestamps and reload-safe timing."],
          ["Progress log", "Every hint, cue, note, solve, pause, resume, and end action is timestamped."],
          ["Handoff notes", "Staff can save operator context and generate a clean summary from recent events."],
          ["Reset checklists", "Run a per-room checklist and save a reset log with who completed it and when."],
          ["Team access", "Invite owners and staff, share a venue context, and keep everyone on the same data."],
        ].map(([title, copy]) => (
          <Card key={title}>
            <p className="text-xl font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">{copy}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Features",
  description:
    "See how Master Control handles room templates, session timing, hint delivery, event logging, reset checklists, and team handoffs.",
  path: "/features",
  keywords: ["escape room hint system", "escape room session timer", "escape room reset checklist software"],
});
