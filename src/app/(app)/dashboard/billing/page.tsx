import { SubscriptionPlan } from "@prisma/client";

import { switchPlanAction } from "@/app/(app)/dashboard/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireMembership } from "@/lib/auth-helpers";
import { hasStripe } from "@/lib/env";
import { PLAN_DETAILS } from "@/lib/plans";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { venueId, membership } = await requireMembership();
  const params = await searchParams;
  const subscription = await db.subscription.findUnique({
    where: { venueId },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Manage trial state and plan limits."
        description="Live Stripe checkout is guarded behind credentials, but the billing UI and plan enforcement stay functional with a local-safe fallback."
      />

      {params.status ? (
        <Card className="border border-[var(--color-success)]/20 bg-[var(--color-success)]/8 text-sm text-[var(--color-ink)]">
          {String(params.status)}
        </Card>
      ) : null}

      <Card className="space-y-3">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Current plan: <span className="font-semibold text-[var(--color-ink)]">{subscription?.plan ?? "STARTER"}</span>
        </p>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Status: <span className="font-semibold text-[var(--color-ink)]">{subscription?.status ?? "TRIALING"}</span>
        </p>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Trial / period end:{" "}
          <span className="font-semibold text-[var(--color-ink)]">
            {subscription?.currentPeriodEndsAt ? formatDate(subscription.currentPeriodEndsAt) : "Not set"}
          </span>
        </p>
        <Badge className="w-fit border-transparent bg-black/6 text-[var(--color-ink-muted)]">
          {hasStripe() ? "Stripe env detected" : "Local billing fallback active"}
        </Badge>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {Object.entries(PLAN_DETAILS).map(([planKey, plan]) => (
          <Card key={planKey} className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">{plan.name}</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{plan.price}/mo</h2>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{plan.tagline}</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--color-ink-muted)]">
              <p>Rooms: {Number.isFinite(plan.roomLimit) ? plan.roomLimit : "Unlimited"}</p>
              <p>Users: {Number.isFinite(plan.userLimit) ? plan.userLimit : "Unlimited"}</p>
            </div>
            {membership.role === "OWNER" ? (
              <form action={switchPlanAction}>
                <input type="hidden" name="plan" value={planKey} />
                <SubmitButton
                  variant={subscription?.plan === planKey ? "secondary" : "primary"}
                  pendingLabel="Updating plan..."
                  className="w-full"
                >
                  {subscription?.plan === (planKey as SubscriptionPlan) ? "Current plan" : "Use this plan"}
                </SubmitButton>
              </form>
            ) : (
              <p className="text-sm text-[var(--color-ink-muted)]">Only owners can change plans.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
