import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function SessionsPage() {
  const { venueId } = await requireMembership();
  const sessions = await db.gameSession.findMany({
    where: {
      room: { venueId },
    },
    include: {
      room: true,
      template: true,
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sessions"
        title="Monitor live and recent sessions."
        description="Open a room control board, resume a paused run, or review the latest session context."
        actions={
          <Link
            href="/dashboard/sessions/new"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Start new session
          </Link>
        }
      />

      <Card className="space-y-3">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/dashboard/sessions/${session.id}`}
            className="block rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{session.teamName}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {session.room.name} • {session.template.name} • {formatDateTime(session.startedAt)}
                </p>
              </div>
              <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                {session.status.toLowerCase()}
              </Badge>
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
