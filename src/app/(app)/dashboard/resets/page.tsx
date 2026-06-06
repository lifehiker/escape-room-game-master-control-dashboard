import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function ResetsPage() {
  const { venueId } = await requireMembership();
  const [rooms, resetRuns] = await Promise.all([
    db.room.findMany({
      where: { venueId },
      include: {
        resetItems: true,
      },
      orderBy: { name: "asc" },
    }),
    db.resetRun.findMany({
      where: {
        room: { venueId },
      },
      include: {
        room: { select: { name: true } },
        completedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reset Logs"
        title="Run and review room resets."
        description="Operators can work from the same checklist, then save a reset log with a timestamp and staff attribution."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Run a reset</h2>
          <div className="space-y-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/dashboard/resets/${room.id}`} className="block rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{room.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{room.resetItems.length} checklist items</p>
                  </div>
                  <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">Open</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Recent reset history</h2>
          <div className="space-y-3">
            {resetRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                <p className="font-semibold text-[var(--color-ink)]">{run.room.name}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {formatDateTime(run.createdAt)} • {run.completedBy.name ?? run.completedBy.email}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
