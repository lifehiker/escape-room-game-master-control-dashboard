import {
  addSessionNoteAction,
  endSessionAction,
  logCueFiredAction,
  logHintAction,
  logPuzzleSolvedAction,
  pauseSessionAction,
  resumeSessionAction,
  updateSessionHandoffNotesAction,
  updateSessionStageAction,
} from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SessionTimer } from "@/components/dashboard/session-timer";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { venueId } = await requireMembership();
  const { sessionId } = await params;
  const gameSession = await db.gameSession.findFirst({
    where: {
      id: sessionId,
      room: { venueId },
    },
    include: {
      room: true,
      template: {
        include: {
          hints: {
            orderBy: { order: "asc" },
          },
          cues: {
            orderBy: { order: "asc" },
          },
        },
      },
      events: {
        include: {
          createdBy: true,
        },
        orderBy: { createdAt: "asc" },
      },
      notes: {
        include: {
          createdBy: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gameSession) {
    return <div>Session not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live Session"
        title={`${gameSession.teamName} in ${gameSession.room.name}`}
        description={`Template: ${gameSession.template.name}. Use the control forms below to log hints, cues, and notes with timestamps.`}
        actions={
          <>
            {gameSession.status === "ACTIVE" ? (
              <form action={pauseSessionAction}>
                <input type="hidden" name="sessionId" value={gameSession.id} />
                <SubmitButton variant="secondary" pendingLabel="Pausing...">
                  Pause session
                </SubmitButton>
              </form>
            ) : null}
            {gameSession.status === "PAUSED" ? (
              <form action={resumeSessionAction}>
                <input type="hidden" name="sessionId" value={gameSession.id} />
                <SubmitButton variant="secondary" pendingLabel="Resuming...">
                  Resume session
                </SubmitButton>
              </form>
            ) : null}
            {gameSession.status !== "ENDED" ? (
              <form action={endSessionAction}>
                <input type="hidden" name="sessionId" value={gameSession.id} />
                <SubmitButton variant="danger" pendingLabel="Ending...">
                  End session
                </SubmitButton>
              </form>
            ) : null}
          </>
        }
      />

      <SessionTimer
        status={gameSession.status}
        startedAt={gameSession.startedAt.toISOString()}
        pausedAt={gameSession.pausedAt?.toISOString() ?? null}
        pausedTotalSeconds={gameSession.pausedTotalSeconds}
        durationMinutes={gameSession.durationMinutes}
        endedAt={gameSession.endedAt?.toISOString() ?? null}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Stage and handoff</h2>
              <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                {gameSession.status.toLowerCase()}
              </Badge>
            </div>
            <form action={updateSessionStageAction} className="space-y-3">
              <input type="hidden" name="sessionId" value={gameSession.id} />
              <Field label="Current stage">
                <Input name="currentStage" defaultValue={gameSession.currentStage} />
              </Field>
              <SubmitButton variant="secondary" pendingLabel="Updating...">
                Update stage
              </SubmitButton>
            </form>
            <form action={updateSessionHandoffNotesAction} className="space-y-3">
              <input type="hidden" name="sessionId" value={gameSession.id} />
              <Field label="Handoff notes">
                <Textarea name="handoffNotes" rows={5} defaultValue={gameSession.handoffNotes} />
              </Field>
              <SubmitButton pendingLabel="Saving notes...">Save handoff notes</SubmitButton>
            </form>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Prewritten hints</h2>
            <div className="space-y-3">
              {gameSession.template.hints.map((hint) => (
                <form key={hint.id} action={logHintAction} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <input type="hidden" name="sessionId" value={gameSession.id} />
                  <input type="hidden" name="label" value={hint.label} />
                  <input type="hidden" name="hintType" value={hint.hintType} />
                  <p className="font-semibold text-[var(--color-ink)]">{hint.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                    {hint.stageName} • {hint.hintType.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{hint.content}</p>
                  <SubmitButton variant="secondary" className="mt-4" pendingLabel="Logging hint...">
                    Send and log hint
                  </SubmitButton>
                </form>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Cue checklist</h2>
            <div className="space-y-3">
              {gameSession.template.cues.map((cue) => (
                <form key={cue.id} action={logCueFiredAction} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <input type="hidden" name="sessionId" value={gameSession.id} />
                  <input type="hidden" name="label" value={cue.label} />
                  <p className="font-semibold text-[var(--color-ink)]">{cue.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                    {cue.stageName} • minute {cue.offsetMinutes}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{cue.instructions}</p>
                  <SubmitButton variant="secondary" className="mt-4" pendingLabel="Logging cue...">
                    Mark cue fired
                  </SubmitButton>
                </form>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Quick logs</h2>
            <form action={logPuzzleSolvedAction} className="space-y-3">
              <input type="hidden" name="sessionId" value={gameSession.id} />
              <Field label="Puzzle solved">
                <Input name="label" placeholder="Decoder drawer solved" required />
              </Field>
              <SubmitButton variant="secondary" pendingLabel="Logging solve...">
                Log puzzle solved
              </SubmitButton>
            </form>
            <form action={addSessionNoteAction} className="space-y-3 border-t border-[var(--color-line)] pt-4">
              <input type="hidden" name="sessionId" value={gameSession.id} />
              <Field label="Operator note">
                <Textarea name="body" rows={4} placeholder="Add a note for this run or the next shift." required />
              </Field>
              <SubmitButton pendingLabel="Saving note...">Save note</SubmitButton>
            </form>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Event log</h2>
            <div className="space-y-3">
              {gameSession.events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[var(--color-ink)]">{event.type.replaceAll("_", " ")}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                      {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                    {event.payloadJson ? JSON.stringify(event.payloadJson) : "No extra payload."}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    Logged by {event.createdBy.name ?? event.createdBy.email}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Session notes</h2>
            <div className="space-y-3">
              {gameSession.notes.length ? (
                gameSession.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                    <p className="text-sm text-[var(--color-ink)]">{note.body}</p>
                    <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                      {note.createdBy.name ?? note.createdBy.email} • {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--color-ink-muted)]">No notes yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
