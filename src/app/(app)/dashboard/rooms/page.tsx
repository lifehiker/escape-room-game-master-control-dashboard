import Link from "next/link";

import { createRoomAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getPlanDisplay } from "@/lib/plans";
import { formatMinutes } from "@/lib/utils";

export default async function RoomsPage() {
  const { venueId } = await requireMembership();
  const [rooms, subscription] = await Promise.all([
    db.room.findMany({
      where: { venueId },
      include: {
        templates: true,
        sessions: {
          take: 1,
          orderBy: { startedAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.subscription.findUnique({ where: { venueId } }),
  ]);

  const plan = getPlanDisplay(subscription?.plan ?? "STARTER");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rooms"
        title="Configure rooms and operator notes."
        description="Every room gets its own templates, reset checklist, session history, and plan-limit enforcement."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Room library</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Plan: {plan.name} • Room limit {Number.isFinite(plan.roomLimit) ? plan.roomLimit : "unlimited"}
              </p>
            </div>
            <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">{rooms.length} rooms</Badge>
          </div>
          <div className="space-y-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/dashboard/rooms/${room.id}`} className="block rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{room.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {formatMinutes(room.durationMinutes)} • {room.templates.length} templates
                    </p>
                  </div>
                  <Badge className="border-transparent bg-[var(--color-accent)]/12 text-[var(--color-accent)]">
                    {room.sessions[0]?.status.toLowerCase() ?? "ready"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{room.description || room.staffNotes}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Add room</h2>
          <form action={createRoomAction} className="space-y-4">
            <Field label="Room name">
              <Input name="name" placeholder="Cipher Cellar" required />
            </Field>
            <Field label="Duration (minutes)">
              <Input name="durationMinutes" type="number" min={30} max={180} defaultValue={60} required />
            </Field>
            <Field label="Description">
              <Textarea name="description" rows={4} placeholder="Operational summary for the room and its experience." />
            </Field>
            <Field label="Staff notes">
              <Textarea name="staffNotes" rows={4} placeholder="Reset warnings, cue reminders, or known puzzle quirks." />
            </Field>
            <SubmitButton pendingLabel="Creating room...">Create room</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
