export default function ResetChecklistPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Escape Room Reset Checklist Software</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
        Replace paper reset sheets with room-level checklists, completion logs, and shared visibility across staff shifts.
      </p>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Escape Room Reset Checklist",
  description:
    "Track room-turn resets with a timestamped escape room reset checklist instead of paper sheets and missed handoff details.",
  path: "/escape-room-reset-checklist",
  keywords: ["escape room reset checklist", "escape room room reset checklist software"],
});
