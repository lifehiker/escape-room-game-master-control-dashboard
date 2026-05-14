export default function GameMasterSoftwarePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Escape Room Game Master Software</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
        Run one or many custom rooms from a clean game master dashboard with timers, session notes, media cues, and reset logs in one place.
      </p>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Escape Room Game Master Software",
  description:
    "Replace spreadsheets and timer hacks with escape room game master software for cues, hints, handoffs, and reset logs.",
  path: "/escape-room-game-master-software",
  keywords: ["escape room game master software", "escape room operator dashboard"],
});
