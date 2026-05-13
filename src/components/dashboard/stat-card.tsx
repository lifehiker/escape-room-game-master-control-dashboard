import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">{label}</p>
      <p className="text-3xl font-semibold text-[var(--color-ink)]">{value}</p>
      <p className="text-sm text-[var(--color-ink-muted)]">{hint}</p>
    </Card>
  );
}
