import Link from "next/link";

import { createTemplateAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export default async function TemplatesPage() {
  const { venueId } = await requireMembership();
  const [rooms, templates] = await Promise.all([
    db.room.findMany({
      where: { venueId },
      orderBy: { name: "asc" },
    }),
    db.roomTemplate.findMany({
      where: {
        room: { venueId },
      },
      include: {
        room: true,
        hints: true,
        cues: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Templates"
        title="Build reusable room runbooks."
        description="Templates store stage-specific hints, timed cues, and the default run mode for each room."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Template library</h2>
            <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
              {templates.length} templates
            </Badge>
          </div>
          <div className="space-y-3">
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/dashboard/templates/${template.id}`}
                className="block rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{template.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {template.room.name} • {template.hints.length} hints • {template.cues.length} cues
                    </p>
                  </div>
                  {template.isDefault ? (
                    <Badge className="border-transparent bg-[var(--color-success)]/12 text-[var(--color-success)]">
                      Default
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{template.summary}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">New template</h2>
          <form action={createTemplateAction} className="space-y-4">
            <Field label="Room">
              <Select name="roomId" required defaultValue={rooms[0]?.id}>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Template name">
              <Input name="name" placeholder="Weeknight runbook" required />
            </Field>
            <Field label="Summary">
              <Textarea name="summary" rows={4} placeholder="What this template changes or optimizes." />
            </Field>
            <label className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
              <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-[var(--color-line)]" />
              Make this the default template for the room
            </label>
            <SubmitButton pendingLabel="Creating template...">Create template</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
