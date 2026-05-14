import {
  addTemplateCueAction,
  addTemplateHintAction,
  deleteTemplateAction,
  deleteTemplateCueAction,
  deleteTemplateHintAction,
  duplicateTemplateAction,
  updateTemplateAction,
} from "@/app/(app)/dashboard/actions";
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

export default async function TemplateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { venueId } = await requireMembership();
  const { templateId } = await params;
  const query = await searchParams;
  const [template, rooms, subscription] = await Promise.all([
    db.roomTemplate.findFirst({
      where: {
        id: templateId,
        room: {
          venueId,
        },
      },
      include: {
        room: true,
        hints: {
          orderBy: { order: "asc" },
        },
        cues: {
          orderBy: { order: "asc" },
        },
      },
    }),
    db.room.findMany({
      where: { venueId },
      orderBy: { name: "asc" },
    }),
    db.subscription.findUnique({
      where: { venueId },
    }),
  ]);

  if (!template) {
    return <div>Template not found.</div>;
  }

  const hasAdvancedAccess = subscription?.plan === "DESIGNER";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Template Detail"
        title={template.name}
        description={`Reusable runbook for ${template.room.name}. Maintain hints, cues, and default behavior here.`}
      />

      {query.status === "duplicated" ? (
        <Card className="border border-[var(--color-success)]/20 bg-[var(--color-success)]/8 text-sm text-[var(--color-ink)]">
          Template duplicated successfully.
        </Card>
      ) : null}
      {query.error === "advanced-plan-required" ? (
        <Card className="border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/8 text-sm text-[var(--color-ink)]">
          Duplicate and export are unlocked on the Designer / Multi-Operator plan.
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Template settings</h2>
          <form action={updateTemplateAction} className="space-y-4">
            <input type="hidden" name="templateId" value={template.id} />
            <Field label="Template name">
              <Input name="name" defaultValue={template.name} required />
            </Field>
            <Field label="Summary">
              <Textarea name="summary" rows={4} defaultValue={template.summary} />
            </Field>
            <label className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={template.isDefault}
                className="h-4 w-4 rounded border-[var(--color-line)]"
              />
              Mark as default template
            </label>
            <div className="flex flex-wrap gap-3">
              <SubmitButton pendingLabel="Saving template...">Save changes</SubmitButton>
            </div>
          </form>
          <form action={deleteTemplateAction}>
            <input type="hidden" name="templateId" value={template.id} />
            <SubmitButton variant="danger" pendingLabel="Deleting template...">
              Delete template
            </SubmitButton>
          </form>
          <div className="space-y-3 border-t border-[var(--color-line)] pt-4">
            <h3 className="text-lg font-semibold text-[var(--color-ink)]">Designer tools</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Duplicate this template to another room or export the runbook as JSON for external backup.
            </p>
            {hasAdvancedAccess ? (
              <>
                <form action={duplicateTemplateAction} className="space-y-3">
                  <input type="hidden" name="templateId" value={template.id} />
                  <Field label="Duplicate to room">
                    <Select name="roomId" defaultValue={template.roomId}>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <SubmitButton variant="secondary" pendingLabel="Duplicating template...">
                    Duplicate template
                  </SubmitButton>
                </form>
                <a
                  href={`/api/templates/${template.id}/export`}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
                >
                  Export JSON
                </a>
              </>
            ) : (
              <p className="text-sm text-[var(--color-ink-muted)]">
                Upgrade to Designer / Multi-Operator to duplicate templates between rooms and export JSON backups.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Hint library</h2>
              <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                {template.hints.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {template.hints.map((hint) => (
                <div key={hint.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">{hint.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                        {hint.stageName} • {hint.hintType.replaceAll("_", " ")}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{hint.content}</p>
                    </div>
                    <form action={deleteTemplateHintAction}>
                      <input type="hidden" name="templateId" value={template.id} />
                      <input type="hidden" name="hintId" value={hint.id} />
                      <SubmitButton variant="ghost" pendingLabel="Removing...">
                        Remove
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <form action={addTemplateHintAction} className="space-y-3 border-t border-[var(--color-line)] pt-4">
              <input type="hidden" name="templateId" value={template.id} />
              <Field label="Stage name">
                <Input name="stageName" placeholder="Midgame" required />
              </Field>
              <Field label="Hint label">
                <Input name="label" placeholder="Redirect the team back to the cipher wall" required />
              </Field>
              <Field label="Hint type">
                <Select name="hintType" defaultValue="NUDGE">
                  <option value="NUDGE">Nudge</option>
                  <option value="DIRECT_CLUE">Direct clue</option>
                  <option value="SOLVE_ASSIST">Solve assist</option>
                </Select>
              </Field>
              <Field label="Hint content">
                <Textarea name="content" rows={4} required />
              </Field>
              <SubmitButton variant="secondary" pendingLabel="Adding hint...">
                Add hint
              </SubmitButton>
            </form>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Cue list</h2>
              <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                {template.cues.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {template.cues.map((cue) => (
                <div key={cue.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">{cue.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
                        {cue.stageName} • minute {cue.offsetMinutes}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{cue.instructions}</p>
                    </div>
                    <form action={deleteTemplateCueAction}>
                      <input type="hidden" name="templateId" value={template.id} />
                      <input type="hidden" name="cueId" value={cue.id} />
                      <SubmitButton variant="ghost" pendingLabel="Removing...">
                        Remove
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <form action={addTemplateCueAction} className="space-y-3 border-t border-[var(--color-line)] pt-4">
              <input type="hidden" name="templateId" value={template.id} />
              <Field label="Stage name">
                <Input name="stageName" placeholder="Finale" required />
              </Field>
              <Field label="Cue label">
                <Input name="label" placeholder="Victory stinger" required />
              </Field>
              <Field label="Offset minute">
                <Input name="offsetMinutes" type="number" defaultValue={0} required />
              </Field>
              <Field label="Instructions">
                <Textarea name="instructions" rows={4} required />
              </Field>
              <SubmitButton variant="secondary" pendingLabel="Adding cue...">
                Add cue
              </SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
