export default function HintSystemPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Escape Room Hint System</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
        Master Control gives you a browser-based escape room hint system with prewritten nudges, direct clues, solve assists, and a timestamped event log for every operator action.
      </p>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Escape Room Hint System",
  description:
    "Run prewritten hints, escalation paths, and operator logs from a browser-based escape room hint system built for live sessions.",
  path: "/escape-room-hint-system",
  keywords: ["escape room hint system", "escape room clue software"],
});
