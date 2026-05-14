export default function ControlPanelPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Escape Room Control Panel</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
        A browser-first control panel for live room execution: view the countdown, trigger the next cue, log hints, store staff notes, and hand the session to the next operator without losing context.
      </p>
    </div>
  );
}
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Escape Room Control Panel",
  description:
    "Operate multi-step rooms from a browser-based escape room control panel with live timers, cues, notes, and reset workflows.",
  path: "/escape-room-control-panel",
  keywords: ["escape room control panel", "escape room session management tool"],
});
