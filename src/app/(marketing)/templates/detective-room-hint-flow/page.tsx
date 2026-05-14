import { DemoShot } from "@/components/marketing/demo-shot";

export default function DetectiveTemplatePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Detective Room Hint Flow</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-muted)]">
        Use staged nudge logic, evidence recovery prompts, and solve-assist checkpoints to keep clue-heavy mystery rooms moving without breaking immersion.
      </p>
      <div className="mt-10">
        <DemoShot title="Detective clue board" subtitle="Evidence-led hints and cue timing for dense multi-step puzzle chains." />
      </div>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Detective Room Hint Flow",
  description:
    "Reference a detective-room hint flow for clue-dense games, dead-end recovery, and clean operator handoffs.",
  path: "/templates/detective-room-hint-flow",
  keywords: ["detective room hint flow", "escape room hint flow"],
});
