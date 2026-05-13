import { Badge } from "@/components/ui/badge";

export function DemoShot({
  title = "Live Session Command Board",
  subtitle = "A browser-first console for hints, timer cues, handoffs, and resets.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(180deg,#fffdfa_0%,#f4ede2_100%)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-line)] px-6 py-4">
        <div className="flex items-center gap-3">
          <Badge className="border-black/10 bg-black/5 text-[var(--color-ink)]">Sandbox snapshot</Badge>
          <p className="text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 p-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[28px] bg-[var(--color-panel-solid)] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Room in progress</p>
              <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Remaining</p>
              <p className="mt-1 font-mono text-2xl font-semibold">18:42</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["Current stage", "Vault reveal"],
              ["Next cue", "Music swell at 18m"],
              ["Hints used", "1 direct clue"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/6 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[24px] border border-white/8 bg-white/4 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Event log</p>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Hint sent: Check the ledger numbers against the wall grid.</span>
                <span className="text-white/50">31:15</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Cue fired: Music swell once the vault case opens.</span>
                <span className="text-white/50">41:02</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Note added: Decoder drawer needs a faster reset.</span>
                <span className="text-white/50">42:18</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white/85 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Cue checklist</p>
            <div className="mt-4 space-y-3">
              {["Start briefing video", "Raise soundtrack intensity", "Prep victory stinger"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] px-4 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-xs font-semibold text-[var(--color-accent)]">
                    {index + 1}
                  </div>
                  <span className="text-sm text-[var(--color-ink)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--color-line)] bg-white/85 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">Reset status</p>
            <div className="mt-4 space-y-3">
              {[
                "Relock vault box",
                "Reload UV stencil",
                "Restage final crank",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
                  <div className="h-5 w-5 rounded-md border border-[var(--color-line)] bg-[var(--color-success)]/10" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
