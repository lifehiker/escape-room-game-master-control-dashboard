import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

function mapPlanFromMetadata(value: string | null | undefined): SubscriptionPlan | null {
  if (value === "STARTER" || value === "VENUE" || value === "DESIGNER") {
    return value;
  }

  return null;
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, reason: "Stripe webhook is not configured in this environment." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ ok: false, reason: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const plan = mapPlanFromMetadata(subscription.metadata?.plan);

    await db.subscription.updateMany({
      where: {
        OR: [
          { stripeSubscriptionId: subscription.id },
          { stripeCustomerId: String(subscription.customer) },
        ],
      },
      data: {
        ...(plan ? { plan } : {}),
        stripeCustomerId: String(subscription.customer),
        stripeSubscriptionId: subscription.id,
        status: mapStripeStatus(subscription.status),
        currentPeriodEndsAt: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      },
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const plan = mapPlanFromMetadata(session.metadata?.plan);
    const venueId = session.metadata?.venueId;

    if (plan && venueId) {
      await db.subscription.upsert({
        where: { venueId },
        update: {
          plan,
          status: "ACTIVE",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
        },
        create: {
          venueId,
          plan,
          status: "ACTIVE",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
