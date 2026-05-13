import Link from "next/link";

import { createTeamInviteAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireMembership } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { roleLabel } from "@/lib/dashboard";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { venueId, membership } = await requireMembership();
  const params = await searchParams;
  const venue = await db.venue.findUnique({
    where: { id: venueId },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
      invites: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!venue) {
    return <div>Venue not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team Access"
        title="Share the venue with owners and staff."
        description="Invites are persisted even without email credentials, so you can still test the full membership workflow locally."
      />

      {params.status ? (
        <Card className="border border-[var(--color-success)]/20 bg-[var(--color-success)]/8 text-sm text-[var(--color-ink)]">
          {params.status === "invite-sent"
            ? "Invite email sent through Resend."
            : "Resend is not configured, so the invite remains available as a local accept link below."}
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Current team</h2>
          <div className="space-y-3">
            {venue.memberships.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{entry.user.name ?? entry.user.email}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{entry.user.email}</p>
                  </div>
                  <Badge className="border-transparent bg-black/6 text-[var(--color-ink-muted)]">
                    {roleLabel(entry.role)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Invite a teammate</h2>
          {membership.role === "OWNER" ? (
            <form action={createTeamInviteAction} className="space-y-4">
              <Field label="Email">
                <Input name="email" type="email" placeholder="gm@venue.com" required />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="STAFF">
                  <option value="STAFF">Staff</option>
                  <option value="OWNER">Owner</option>
                </Select>
              </Field>
              <SubmitButton pendingLabel="Creating invite...">Create invite</SubmitButton>
            </form>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)]">Only owners can invite more users.</p>
          )}

          <div className="space-y-3 border-t border-[var(--color-line)] pt-4">
            <p className="font-semibold text-[var(--color-ink)]">Pending invites</p>
            {venue.invites.length ? (
              venue.invites.map((invite) => (
                <div key={invite.id} className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4">
                  <p className="font-semibold text-[var(--color-ink)]">{invite.email}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{roleLabel(invite.role)}</p>
                  <Link href={`/accept-invite/${invite.token}`} className="mt-3 inline-block text-sm font-semibold text-[var(--color-accent)]">
                    Local accept link
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-ink-muted)]">No pending invites.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
