import Link from "next/link";

import {
  addResetChecklistItemAction,
  deleteResetChecklistItemAction,
  deleteRoomAction,
  updateRoomAction,
} from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { venueId } = await requireMembership();
  const { roomId } = await params;
  const room = await db.room.findFirst({
    where: {
      id: roomId,
      venueId,
    },
    include: {
      templates: {
        orderBy: { updatedAt: "desc" },
      },
      resetItems: {
        orderBy: { order: "asc" },
      },
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!room) {
    return <div>Room not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Room Detail"
        title={room.name}
        description="Edit the room’s operator notes, review its recent sessions, and maintain its reset checklist."
        actions={
          <>
            <Link
              href={`/dashboard/resets/${room.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white/70 px-4 py-2 text-sm font-semibold"
            >
              Run reset
            </Link>
            <Link
              href="/dashboard/sessions/new"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Start session
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Room settings</h2>
          <form action={updateRoomAction} className="space-y-4">
            <input type="hidden" name="roomId" value={room.id} />
            <Field label="Room name">
              <Input name="name" defaultValue={room.name} required />
            </Field>
            <Field label="Duration (minutes)">
              <Input name="durationMinutes" type="number" min={30} max={180} defaultValue={room.durationMinutes} />
            </Field>
            <Field label="Description">
              <Textarea name="description" rows={4} defaultValue={room.description} />
            </Field>
            <Field label="Staff notes">
              <Textarea name="staffNotes" rows={5} defaultValue={room.staffNotes} />
            </Field>
            <SubmitButton pendingLabel="Saving room...">Save changes</SubmitButton>
          </form>
          <form action={deleteRoomAction}>
            <input type="hidden" name="roomId" value={room.id} />
            <SubmitButton variant="danger" pendingLabel="Deleting...">
              Delete room
            </SubmitButton>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Templates</h2>
              <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                {room.templates.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {room.templates.map((template) => (
                <Link
                  key={template.id}
                  href={`/dashboard/templates/${template.id}`}
                  className="block rounded-2xl border border-[var(--color-line)] bg-white/70 p-4"
                >
                  <p className="font-semibold text-[var(--color-ink)]">{template.name}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{template.summary}</p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Reset checklist</h2>
            <div className="space-y-3">
              {room.resetItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
                      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{item.details}</p>
                    </div>
                    <form action={deleteResetChecklistItemAction}>
                      <input type="hidden" name="roomId" value={room.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <SubmitButton variant="ghost" pendingLabel="Removing...">
                        Remove
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <form action={addResetChecklistItemAction} className="space-y-3 border-t border-[var(--color-line)] pt-4">
              <input type="hidden" name="roomId" value={room.id} />
              <Field label="New checklist item">
                <Input name="label" placeholder="Reload projector scene" required />
              </Field>
              <Field label="Details">
                <Textarea name="details" rows={3} placeholder="Include the exact reset instruction operators should follow." />
              </Field>
              <SubmitButton variant="secondary" pendingLabel="Adding item...">
                Add checklist item
              </SubmitButton>
            </form>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Recent sessions</h2>
            <div className="space-y-3">
              {room.sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="block rounded-2xl border border-[var(--color-line)] bg-white/70 p-4"
                >
                  <p className="font-semibold text-[var(--color-ink)]">{session.teamName}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {session.status.toLowerCase()} • {formatDateTime(session.startedAt)}
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
