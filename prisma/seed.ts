import bcrypt from "bcryptjs";
import path from "path";
import {
  HintType,
  MembershipRole,
  PrismaClient,
  SessionEventType,
  SessionStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 removed the `datasources` option; sqlite now goes through a driver
// adapter, matching how src/lib/db.ts builds its client.
const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: `file:${path.join(process.cwd(), "prisma/dev.db")}`,
  }),
});

async function main() {
  const ownerPasswordHash = await bcrypt.hash("demo-owner-123", 10);
  const staffPasswordHash = await bcrypt.hash("demo-staff-123", 10);

  const owner = await db.user.upsert({
    where: { email: "owner@midnight-heist.test" },
    update: {
      name: "Alex Rowan",
      passwordHash: ownerPasswordHash,
    },
    create: {
      name: "Alex Rowan",
      email: "owner@midnight-heist.test",
      passwordHash: ownerPasswordHash,
    },
  });

  const staff = await db.user.upsert({
    where: { email: "staff@midnight-heist.test" },
    update: {
      name: "Morgan Vale",
      passwordHash: staffPasswordHash,
    },
    create: {
      name: "Morgan Vale",
      email: "staff@midnight-heist.test",
      passwordHash: staffPasswordHash,
    },
  });

  const venue = await db.venue.upsert({
    where: { slug: "midnight-heist-escape" },
    update: {
      name: "Midnight Heist Escape",
    },
    create: {
      name: "Midnight Heist Escape",
      slug: "midnight-heist-escape",
      createdById: owner.id,
    },
  });

  await db.membership.upsert({
    where: {
      userId_venueId: {
        userId: owner.id,
        venueId: venue.id,
      },
    },
    update: {
      role: MembershipRole.OWNER,
    },
    create: {
      userId: owner.id,
      venueId: venue.id,
      role: MembershipRole.OWNER,
    },
  });

  await db.membership.upsert({
    where: {
      userId_venueId: {
        userId: staff.id,
        venueId: venue.id,
      },
    },
    update: {
      role: MembershipRole.STAFF,
    },
    create: {
      userId: staff.id,
      venueId: venue.id,
      role: MembershipRole.STAFF,
    },
  });

  await db.user.update({
    where: { id: owner.id },
    data: { activeVenueId: venue.id },
  });

  await db.user.update({
    where: { id: staff.id },
    data: { activeVenueId: venue.id },
  });

  const room = await db.room.upsert({
    where: {
      venueId_slug: {
        venueId: venue.id,
        slug: "vault-77",
      },
    },
    update: {
      name: "Vault 77",
      durationMinutes: 60,
      description: "A polished heist room with layered hint stages, timer cues, and reset validation.",
      staffNotes: "Keep an eye on the decoder drawer and trigger soundtrack swell at minute 18.",
    },
    create: {
      venueId: venue.id,
      name: "Vault 77",
      slug: "vault-77",
      durationMinutes: 60,
      description: "A polished heist room with layered hint stages, timer cues, and reset validation.",
      staffNotes: "Keep an eye on the decoder drawer and trigger soundtrack swell at minute 18.",
    },
  });

  const roomTwo = await db.room.upsert({
    where: {
      venueId_slug: {
        venueId: venue.id,
        slug: "the-lantern-manor",
      },
    },
    update: {
      name: "The Lantern Manor",
      durationMinutes: 75,
      description: "Atmospheric horror room with manual scare cues and detailed handoff notes.",
      staffNotes: "Stage 3 scare only after the portrait puzzle is solved.",
    },
    create: {
      venueId: venue.id,
      name: "The Lantern Manor",
      slug: "the-lantern-manor",
      durationMinutes: 75,
      description: "Atmospheric horror room with manual scare cues and detailed handoff notes.",
      staffNotes: "Stage 3 scare only after the portrait puzzle is solved.",
    },
  });

  const template = await db.roomTemplate.upsert({
    where: { id: "vault-default-template" },
    update: {
      roomId: room.id,
      name: "Vault 77 Default Runbook",
      summary: "Baseline session flow with three timed beats and a short reset.",
      isDefault: true,
    },
    create: {
      id: "vault-default-template",
      roomId: room.id,
      name: "Vault 77 Default Runbook",
      summary: "Baseline session flow with three timed beats and a short reset.",
      isDefault: true,
    },
  });

  await db.templateHint.deleteMany({ where: { templateId: template.id } });
  await db.templateCue.deleteMany({ where: { templateId: template.id } });
  await db.resetChecklistItem.deleteMany({ where: { roomId: room.id } });

  await db.templateHint.createMany({
    data: [
      {
        templateId: template.id,
        stageName: "Arrival",
        label: "Open with the obvious nudge",
        content: "Check the ledger numbers against the wall grid before opening drawers.",
        order: 1,
        hintType: HintType.NUDGE,
      },
      {
        templateId: template.id,
        stageName: "Midgame",
        label: "Redirect stuck teams",
        content: "The second lock uses shapes, not colors. Revisit the UV stencil.",
        order: 2,
        hintType: HintType.DIRECT_CLUE,
      },
      {
        templateId: template.id,
        stageName: "Finale",
        label: "Prevent dead-air at the end",
        content: "Use the spare crank to expose the final cipher if they are under five minutes.",
        order: 3,
        hintType: HintType.SOLVE_ASSIST,
      },
    ],
  });

  await db.templateCue.createMany({
    data: [
      {
        templateId: template.id,
        stageName: "Arrival",
        label: "Briefing video",
        instructions: "Start intro clip and arm countdown display.",
        offsetMinutes: 0,
        order: 1,
      },
      {
        templateId: template.id,
        stageName: "Midgame",
        label: "Music swell",
        instructions: "Increase soundtrack intensity once team opens vault case.",
        offsetMinutes: 18,
        order: 2,
      },
      {
        templateId: template.id,
        stageName: "Finale",
        label: "Victory stinger",
        instructions: "Fire celebration sound and light cue when exit door unlocks.",
        offsetMinutes: 56,
        order: 3,
      },
    ],
  });

  await db.resetChecklistItem.createMany({
    data: [
      {
        roomId: room.id,
        label: "Relock vault box",
        details: "Reset combo to 4-9-2 and tuck clue slip behind felt divider.",
        order: 1,
      },
      {
        roomId: room.id,
        label: "Reload UV stencil",
        details: "Return stencil to drawer three and test blacklight battery.",
        order: 2,
      },
      {
        roomId: room.id,
        label: "Restage final crank",
        details: "Place spare crank in false-bottom tray for solve-assist fallback.",
        order: 3,
      },
    ],
  });

  const horrorTemplate = await db.roomTemplate.upsert({
    where: { id: "lantern-default-template" },
    update: {
      roomId: roomTwo.id,
      name: "Lantern Manor Escalation Script",
      summary: "A longer room template for horror timing and atmosphere management.",
      isDefault: true,
    },
    create: {
      id: "lantern-default-template",
      roomId: roomTwo.id,
      name: "Lantern Manor Escalation Script",
      summary: "A longer room template for horror timing and atmosphere management.",
      isDefault: true,
    },
  });

  await db.templateHint.deleteMany({ where: { templateId: horrorTemplate.id } });
  await db.templateCue.deleteMany({ where: { templateId: horrorTemplate.id } });

  await db.templateHint.createMany({
    data: [
      {
        templateId: horrorTemplate.id,
        stageName: "Seance",
        label: "Keep tension without stall",
        content: "The portrait eyes line up with the séance board letters.",
        order: 1,
        hintType: HintType.NUDGE,
      },
    ],
  });

  await db.templateCue.createMany({
    data: [
      {
        templateId: horrorTemplate.id,
        stageName: "Hallway",
        label: "Lamp flicker cue",
        instructions: "Trigger hallway flicker once the brass key drops.",
        offsetMinutes: 21,
        order: 1,
      },
    ],
  });

  await db.subscription.upsert({
    where: { venueId: venue.id },
    update: {
      plan: SubscriptionPlan.VENUE,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      currentPeriodEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
    create: {
      venueId: venue.id,
      plan: SubscriptionPlan.VENUE,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      currentPeriodEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  const existingSession = await db.gameSession.findFirst({
    where: {
      roomId: room.id,
      teamName: "Blue Canary",
    },
  });

  if (!existingSession) {
    const gameSession = await db.gameSession.create({
      data: {
        roomId: room.id,
        templateId: template.id,
        startedById: owner.id,
        teamName: "Blue Canary",
        status: SessionStatus.ENDED,
        startedAt: new Date(Date.now() - 1000 * 60 * 58),
        endedAt: new Date(Date.now() - 1000 * 60 * 4),
        currentStage: "Finale",
        durationMinutes: 60,
        handoffNotes: "Strong team. Used one clue at midgame and finished with four minutes left.",
      },
    });

    await db.sessionEvent.createMany({
      data: [
        {
          sessionId: gameSession.id,
          type: SessionEventType.SESSION_STARTED,
          createdById: owner.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 58),
        },
        {
          sessionId: gameSession.id,
          type: SessionEventType.HINT_SENT,
          createdById: owner.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 29),
          payloadJson: {
            label: "Redirect stuck teams",
          },
        },
        {
          sessionId: gameSession.id,
          type: SessionEventType.CUE_FIRED,
          createdById: owner.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 18),
          payloadJson: {
            label: "Music swell",
          },
        },
        {
          sessionId: gameSession.id,
          type: SessionEventType.SESSION_ENDED,
          createdById: owner.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 4),
        },
      ],
    });

    await db.sessionNote.create({
      data: {
        sessionId: gameSession.id,
        body: "Players fixated on the UV drawer; worth revising pre-brief.",
        createdById: owner.id,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
