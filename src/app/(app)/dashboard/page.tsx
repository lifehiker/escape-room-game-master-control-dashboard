import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getPlanDisplay } from "@/lib/plans";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardHomePage() {
  const { venueId, membership } = await requireMembership();

  if (!venueId) {
    redirect("/dashboard/onboarding");
  }

  const [rooms, sessions, resets, subscription] = await Promise.all([
    db.room.findMany({
      where: { venueId },
      select: {
        id: true,
        name: true,
        description: true,
        staffNotes: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.gameSession.findMany({
      where: {
        room: {
          venueId,
        },
      },
      select: {
        id: true,
        teamName: true,
        status: true,
        startedAt: true,
        roomId: true,
        room: { select: { name: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    db.resetRun.findMany({
      where: {
        room: {
          venueId,
        },
      },
      select: {
        id: true,
        createdAt: true,
        room: { select: { name: true } },
        completedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.subscription.findUnique({
      where: { venueId },
      select: { plan: true },
    }),
  ]);

  const activeSessions = sessions.filter((session) => session.status !== "ENDED");
  const plan = getPlanDisplay(subscription?.plan ?? "STARTER");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Run ${membership.venue.name} without the spreadsheet pileup.`}
        description="Track active sessions, prep resets, and keep every operator on the same control surface."
        actions={
          <>
            <Link
              href="/dashboard/sessions/new"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Start session
            </Link>
            <Link
              href="/dashboard/onboarding"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white/70 px-4 py-2 text-sm font-semibold"
            >
              Onboarding guide
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Plan" value={plan.name} hint={plan.tagline} />
        <StatCard label="Rooms" value={String(rooms.length)} hint="Live control boards configured for this venue." />
        <StatCard
          label="Active sessions"
          value={String(activeSessions.length)}
          hint="Open control boards still in progress or paused."
        />
        <StatCard
          label="Recent resets"
          value={String(resets.length)}
          hint="Most recent reset runs saved by staff."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">
                Live board
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">Room status</h2>
            </div>
            <Link href="/dashboard/sessions" className="text-sm font-semibold text-[var(--color-accent)]">
              View all sessions
            </Link>
          </div>
          <div className="space-y-3">
            {rooms.map((room) => {
              const roomSession = activeSessions.find((session) => session.roomId === room.id);
              return (
                <div key={room.id} className="rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">{room.name}</p>
                      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{room.description || room.staffNotes}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          roomSession
                            ? "border-transparent bg-[var(--color-success)]/12 text-[var(--color-success)]"
                            : "border-transparent bg-black/6 text-[var(--color-ink-muted)]"
                        }
                      >
                        {roomSession ? roomSession.status.toLowerCase() : "idle"}
                      </Badge>
                      <Link href={`/dashboard/rooms/${room.id}`} className="text-sm font-semibold text-[var(--color-accent)]">
                        Open room
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">
              Recent reset runs
            </p>
            <div className="space-y-3">
              {resets.length ? (
                resets.map((reset) => (
                  <div key={reset.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                    <p className="font-semibold text-[var(--color-ink)]">{reset.room.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      Logged by {reset.completedBy.name ?? reset.completedBy.email} on {formatDateTime(reset.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--color-ink-muted)]">No reset runs yet.</p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">
              Recent sessions
            </p>
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="block rounded-2xl border border-[var(--color-line)] bg-white/70 p-4"
                >
                  <p className="font-semibold text-[var(--color-ink)]">{session.teamName}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {session.room.name} • {session.status.toLowerCase()} • {formatDateTime(session.startedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
