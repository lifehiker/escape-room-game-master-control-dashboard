import { DemoShot } from "@/components/marketing/demo-shot";

export default function HorrorTemplatePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Horror Room Control Template</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-muted)]">
        A control template for operators who need timed scare cues, stage escalation, and stronger handoff notes between staff changes.
      </p>
      <div className="mt-10">
        <DemoShot title="Horror escalation board" subtitle="Timed cues, scare cadence, and reset confidence for atmospheric rooms." />
      </div>
    </div>
  );
}
