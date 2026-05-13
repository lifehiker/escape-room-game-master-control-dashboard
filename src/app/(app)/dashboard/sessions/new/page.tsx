import { startSessionAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export default async function NewSessionPage() {
  const { venueId } = await requireMembership();
  const rooms = await db.room.findMany({
    where: { venueId },
    include: {
      templates: {
        orderBy: { isDefault: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const firstRoom = rooms[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Start Session"
        title="Launch a live room control board."
        description="Pick the room, choose the active runbook, and name the player team before the countdown begins."
      />

      <Card className="max-w-3xl">
        <form action={startSessionAction} className="space-y-4">
          <Field label="Room">
            <Select name="roomId" defaultValue={firstRoom?.id} required>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Template">
            <Select name="templateId" defaultValue={firstRoom?.templates[0]?.id} required>
              {rooms.flatMap((room) =>
                room.templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {room.name}: {template.name}
                  </option>
                )),
              )}
            </Select>
          </Field>
          <Field label="Team name">
            <Input name="teamName" placeholder="Blue Canary" required />
          </Field>
          <Field label="Current stage">
            <Input name="currentStage" defaultValue="Arrival" required />
          </Field>
          <SubmitButton pendingLabel="Starting session...">Start session</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
