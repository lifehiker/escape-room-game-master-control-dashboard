export default function HandoffsBlogPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">How to Run Game Master Handoffs Without Missed Clues</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
        Good handoffs need more than a sticky note. The operator taking over should inherit the current stage, last hint sent, unresolved staff notes, recent cues, and reset context from one visible event log.
      </p>
    </article>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "How To Run Game Master Handoffs Without Missed Clues",
  description:
    "Set up better game master handoffs with event logs, operator notes, and reset visibility for escape room shift changes.",
  path: "/blog/how-to-run-game-master-handoffs-without-missed-clues",
  keywords: ["game master handoff software for escape rooms", "escape room staff handoff"],
});
