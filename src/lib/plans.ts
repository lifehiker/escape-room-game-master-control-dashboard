import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export const PLAN_DETAILS = {
  STARTER: {
    name: "Starter",
    price: "$29",
    roomLimit: 1,
    userLimit: 3,
    tagline: "Run one live room with the essentials.",
  },
  VENUE: {
    name: "Venue",
    price: "$59",
    roomLimit: 5,
    userLimit: 10,
    tagline: "The operational sweet spot for active venues.",
  },
  DESIGNER: {
    name: "Designer / Multi-Operator",
    price: "$99",
    roomLimit: Number.POSITIVE_INFINITY,
    userLimit: Number.POSITIVE_INFINITY,
    tagline: "Unlimited rooms and advanced template reuse.",
  },
} as const;

export function getRoomLimit(plan: SubscriptionPlan) {
  return PLAN_DETAILS[plan].roomLimit;
}

export function getUserLimit(plan: SubscriptionPlan) {
  return PLAN_DETAILS[plan].userLimit;
}

export function getPlanDisplay(plan: SubscriptionPlan) {
  return PLAN_DETAILS[plan];
}

export function isSubscriptionActive(status: SubscriptionStatus) {
  return status === "ACTIVE" || status === "TRIALING";
}
