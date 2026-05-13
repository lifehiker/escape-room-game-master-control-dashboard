import { addResetChecklistItemAction, saveResetRunAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function ResetRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { venueId } = await requireMembership();
  const { roomId } = await params;
  const query = await searchParams;
  const room = await db.room.findFirst({
    where: {
      id: roomId,
      venueId,
    },
    include: {
      resetItems: {
        orderBy: { order: "asc" },
      },
      resetRuns: {
        include: {
          completedBy: true,
          items: {
            include: {
              checklistItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
        eyebrow="Reset Runner"
        title={`Reset ${room.name}`}
        description="Work the checklist, save the run, and keep the latest five reset logs visible for the next staff handoff."
      />

      {query.saved ? (
        <Card className="border border-[var(--color-success)]/20 bg-[var(--color-success)]/8 text-sm text-[var(--color-ink)]">
          Reset run saved successfully.
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Run checklist</h2>
          <form action={saveResetRunAction} className="space-y-4">
            <input type="hidden" name="roomId" value={room.id} />
            <div className="space-y-3">
              {room.resetItems.map((item) => (
                <label key={item.id} className="flex gap-3 rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <input type="checkbox" name={`item-${item.id}`} className="mt-1 h-4 w-4 rounded border-[var(--color-line)]" />
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{item.details}</p>
                  </div>
                </label>
              ))}
            </div>
            <SubmitButton pendingLabel="Saving reset run...">Save reset run</SubmitButton>
          </form>

          <form action={addResetChecklistItemAction} className="space-y-3 border-t border-[var(--color-line)] pt-4">
            <input type="hidden" name="roomId" value={room.id} />
            <Field label="Add checklist item">
              <Input name="label" placeholder="Re-arm magnetic lock" required />
            </Field>
            <Field label="Details">
              <Textarea name="details" rows={3} placeholder="Add any specific test or confirmation step." />
            </Field>
            <SubmitButton variant="secondary" pendingLabel="Adding item...">
              Add item
            </SubmitButton>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Recent reset logs</h2>
          <div className="space-y-4">
            {room.resetRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                <p className="font-semibold text-[var(--color-ink)]">
                  {formatDateTime(run.createdAt)} • {run.completedBy.name ?? run.completedBy.email}
                </p>
                <div className="mt-3 space-y-2">
                  {run.items.map((item) => (
                    <div key={item.id} className="text-sm text-[var(--color-ink-muted)]">
                      {item.completed ? "Done" : "Skipped"}: {item.checklistItem.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
