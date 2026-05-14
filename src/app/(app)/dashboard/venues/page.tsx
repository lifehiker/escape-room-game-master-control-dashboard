import { MembershipRole } from "@prisma/client";

import { createVenueAction, switchActiveVenueAction, updateVenueAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { roleLabel } from "@/lib/dashboard";

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await requireUser();
  const memberships = await db.membership.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      venue: {
        include: {
          rooms: true,
          memberships: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const active = memberships.find((membership) => membership.venueId === session.user.activeVenueId) ?? memberships[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Venue Control"
        title="Manage active venue context."
        description="Switch between venues you belong to and update the currently active venue’s display name."
      />

      {params.error === "venue-limit" ? (
        <Card className="border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/8 text-sm text-[var(--color-ink)]">
          Additional venues require the Designer / Multi-Operator plan.
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">My venues</h2>
          <div className="space-y-3">
            {memberships.map((membership) => (
              <div key={membership.id} className="rounded-[24px] border border-[var(--color-line)] bg-white/75 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{membership.venue.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {membership.venue.rooms.length} rooms • {membership.venue.memberships.length} team members
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                      {roleLabel(membership.role)}
                    </Badge>
                    {session.user.activeVenueId === membership.venueId ? (
                      <Badge className="border-transparent bg-[var(--color-success)]/12 text-[var(--color-success)]">
                        Active
                      </Badge>
                    ) : (
                      <form action={switchActiveVenueAction}>
                        <input type="hidden" name="venueId" value={membership.venueId} />
                        <SubmitButton variant="secondary" pendingLabel="Switching...">
                          Switch
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Update active venue</h2>
          {active?.role === MembershipRole.OWNER ? (
            <form action={updateVenueAction} className="space-y-4">
              <Field label="Venue name">
                <Input name="name" defaultValue={active.venue.name} required />
              </Field>
              <SubmitButton pendingLabel="Saving venue...">Save changes</SubmitButton>
            </form>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Only venue owners can rename the venue. You can still switch the active venue context from the list.
            </p>
          )}
        </Card>

        <Card className="space-y-4 xl:col-span-2">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Create another venue</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Starter and Venue plans stay single-venue. Designer / Multi-Operator supports additional venue workspaces.
            </p>
          </div>
          <form action={createVenueAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Venue name">
              <Input name="venueName" placeholder="North Annex Escape" required />
            </Field>
            <Field label="Starter room">
              <Input name="roomName" placeholder="Signal Room" required />
            </Field>
            <Field label="Session length (minutes)">
              <Input name="durationMinutes" type="number" min={30} max={180} defaultValue={60} required />
            </Field>
            <Field label="Operator notes">
              <Input name="notes" placeholder="Optional setup notes for the first room." />
            </Field>
            <div className="md:col-span-2">
              <SubmitButton pendingLabel="Creating venue...">Create venue workspace</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
