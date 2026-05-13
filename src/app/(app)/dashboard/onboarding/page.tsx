import { redirect } from "next/navigation";

import { completeOnboardingAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth-helpers";
import { getActiveMembershipForUser } from "@/lib/dashboard";

export default async function OnboardingPage() {
  const session = await requireUser();
  const membership = await getActiveMembershipForUser(session.user.id);

  if (membership) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Onboarding"
        title="Create the first venue and room."
        description="Set up a live-ready control board in one step. We’ll seed a default template and reset checklist automatically."
      />

      <Card className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form action={completeOnboardingAction} className="space-y-4">
          <Field label="Venue name" hint="This is the workspace shared by your owners and staff.">
            <Input name="venueName" placeholder="Midnight Heist Escape" required />
          </Field>
          <Field label="First room" hint="Create the room your staff will actually operate.">
            <Input name="roomName" placeholder="Vault 77" required />
          </Field>
          <Field label="Session length (minutes)" hint="Use the standard live duration for this room.">
            <Input name="durationMinutes" type="number" min={30} max={180} defaultValue={60} required />
          </Field>
          <Field label="Initial operator notes" hint="Add quirks, cue warnings, or reset reminders later from the room page.">
            <Textarea
              name="notes"
              rows={4}
              placeholder="Example: Stage 2 music cue triggers when the second drawer opens."
            />
          </Field>
          <SubmitButton pendingLabel="Creating venue...">Create venue and room</SubmitButton>
        </form>

        <div className="rounded-[28px] bg-[var(--color-panel-solid)] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/45">What gets seeded</p>
          <div className="mt-5 space-y-4">
            {[
              "A default runbook with a starter hint and a timed cue.",
              "A reset checklist so staff can log the room turn immediately.",
              "A 14-day trial subscription state with plan-limit enforcement.",
              "An authenticated venue context so shared dashboard pages work right away.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
