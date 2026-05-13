import { MembershipRole, SessionEventType, SessionStatus, TeamInviteStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { getRoomLimit, getUserLimit, isSubscriptionActive } from "@/lib/plans";

export async function getActiveMembershipForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user?.activeVenueId) {
    return null;
  }

  return db.membership.findUnique({
    where: {
      userId_venueId: {
        userId,
        venueId: user.activeVenueId,
      },
    },
    include: {
      venue: {
        include: {
          rooms: true,
          subscriptions: true,
          memberships: {
            include: {
              user: true,
            },
          },
          invites: {
            where: {
              status: TeamInviteStatus.PENDING,
            },
          },
        },
      },
      user: true,
    },
  });
}

export async function getVenueSubscription(venueId: string) {
  return db.subscription.findUnique({
    where: { venueId },
  });
}

export async function canCreateRoom(venueId: string) {
  const subscription = await getVenueSubscription(venueId);
  const roomCount = await db.room.count({ where: { venueId } });
  const activePlan = subscription && isSubscriptionActive(subscription.status) ? subscription.plan : "STARTER";
  return roomCount < getRoomLimit(activePlan);
}

export async function canInviteUser(venueId: string) {
  const subscription = await getVenueSubscription(venueId);
  const venue = await db.venue.findUnique({
    where: { id: venueId },
    include: {
      memberships: true,
      invites: {
        where: { status: TeamInviteStatus.PENDING },
      },
    },
  });

  if (!venue) {
    return false;
  }

  const activePlan = subscription && isSubscriptionActive(subscription.status) ? subscription.plan : "STARTER";
  return venue.memberships.length + venue.invites.length < getUserLimit(activePlan);
}

export function buildHandoffSummary(args: {
  roomName: string;
  teamName: string;
  status: SessionStatus;
  currentStage: string;
  handoffNotes: string;
  events: Array<{
    type: SessionEventType;
    createdAt: Date;
    payloadJson: unknown;
  }>;
}) {
  const recentItems = args.events
    .slice(-5)
    .map((event) => {
      const details =
        typeof event.payloadJson === "object" && event.payloadJson && "label" in event.payloadJson
          ? `: ${String(event.payloadJson.label)}`
          : "";
      return `${event.type.replaceAll("_", " ").toLowerCase()}${details}`;
    })
    .join(", ");

  return [
    `${args.teamName} is currently ${args.status.toLowerCase()} in ${args.roomName}.`,
    `Current stage: ${args.currentStage}.`,
    recentItems ? `Recent actions: ${recentItems}.` : "Recent actions: none logged yet.",
    args.handoffNotes ? `Operator notes: ${args.handoffNotes}` : "Operator notes: none.",
  ].join(" ");
}

export function roleLabel(role: MembershipRole) {
  return role === MembershipRole.OWNER ? "Owner" : "Staff";
}
