export default function SpreadsheetVsSoftwarePage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Spreadsheets vs Escape Room Control Software for Live Game Management</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
        Spreadsheets can track room setup, but they fail during live execution. Operators need a single control board where the timer, next cue, prewritten hints, staff notes, and reset workflow stay visible together.
      </p>
    </article>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Spreadsheets vs Escape Room Control Software",
  description:
    "Compare spreadsheets against dedicated escape room control software for live timers, hints, cues, and reset accountability.",
  path: "/blog/spreadsheet-vs-escape-room-control-software",
  keywords: ["spreadsheets vs escape room control software", "escape room live management"],
});
