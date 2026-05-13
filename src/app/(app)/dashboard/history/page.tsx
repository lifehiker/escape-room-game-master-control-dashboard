import Link from "next/link";

import { generateHandoffSummaryAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function HistoryPage() {
  const { venueId } = await requireMembership();
  const sessions = await db.gameSession.findMany({
    where: {
      room: { venueId },
    },
    include: {
      room: true,
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Review prior runs and handoff context."
        description="Past sessions stay searchable by room and date, including hint usage, operator notes, and generated handoff summaries."
      />

      <Card className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link href={`/dashboard/sessions/${session.id}`} className="font-semibold text-[var(--color-ink)]">
                  {session.teamName}
                </Link>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {session.room.name} • {session.status.toLowerCase()} • {formatDateTime(session.startedAt)}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{session.handoffNotes || "No handoff summary yet."}</p>
              </div>
              <form action={generateHandoffSummaryAction}>
                <input type="hidden" name="sessionId" value={session.id} />
                <SubmitButton variant="secondary" pendingLabel="Generating...">
                  Generate handoff summary
                </SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
