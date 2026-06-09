import Link from "next/link";

import { generateHandoffSummaryAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { venueId } = await requireMembership();
  const params = await searchParams;
  const roomId = typeof params.roomId === "string" ? params.roomId : "";
  const startDate = typeof params.startDate === "string" ? params.startDate : "";
  const endDate = typeof params.endDate === "string" ? params.endDate : "";
  const rooms = await db.room.findMany({
    where: { venueId },
    orderBy: { name: "asc" },
  });
  const startDateValue = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
  const endDateValue = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;
  const sessions = await db.gameSession.findMany({
    where: {
      room: { venueId },
      ...(roomId ? { roomId } : {}),
      ...(startDateValue || endDateValue
        ? {
            startedAt: {
              ...(startDateValue ? { gte: startDateValue } : {}),
              ...(endDateValue ? { lte: endDateValue } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      teamName: true,
      status: true,
      startedAt: true,
      handoffNotes: true,
      room: { select: { name: true } },
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

      <Card className="space-y-4">
        <form method="get" className="grid gap-4 border-b border-[var(--color-line)] pb-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="roomId">
              Room
            </label>
            <select
              id="roomId"
              name="roomId"
              defaultValue={roomId}
              className="min-h-11 w-full rounded-2xl border border-[var(--color-line)] bg-white/90 px-4 py-2 text-sm text-[var(--color-ink)] outline-none"
            >
              <option value="">All rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="startDate">
              Start date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={startDate}
              className="min-h-11 w-full rounded-2xl border border-[var(--color-line)] bg-white/90 px-4 py-2 text-sm text-[var(--color-ink)] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="endDate">
              End date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={endDate}
              className="min-h-11 w-full rounded-2xl border border-[var(--color-line)] bg-white/90 px-4 py-2 text-sm text-[var(--color-ink)] outline-none"
            />
          </div>
          <div className="flex items-end gap-3">
            <SubmitButton variant="secondary" pendingLabel="Filtering...">
              Apply filters
            </SubmitButton>
            <Link href="/dashboard/history" className="text-sm font-semibold text-[var(--color-accent)]">
              Clear
            </Link>
          </div>
        </form>
        {sessions.length ? (
          sessions.map((session) => (
            <div key={session.id} className="rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Link href={`/dashboard/sessions/${session.id}`} className="font-semibold text-[var(--color-ink)]">
                    {session.teamName}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {session.room.name} • {session.status.toLowerCase()} • {formatDateTime(session.startedAt)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                    {session.handoffNotes || "No handoff summary yet."}
                  </p>
                </div>
                <form action={generateHandoffSummaryAction}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <SubmitButton variant="secondary" pendingLabel="Generating...">
                    Generate handoff summary
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)]">No sessions match the selected room/date filters.</p>
        )}
      </Card>
    </div>
  );
}
