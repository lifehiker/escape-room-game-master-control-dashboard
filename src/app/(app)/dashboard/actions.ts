"use server";

import { MembershipRole, SessionEventType, SessionStatus, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMembership, requireUser } from "@/lib/auth-helpers";
import { buildHandoffSummary, canCreateRoom, canCreateVenue, canInviteUser, venueSupportsAdvancedTemplates } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { hasResend, hasStripe } from "@/lib/env";
import { getRoomLimit } from "@/lib/plans";
import { slugify } from "@/lib/utils";

async function ensureTemplateAndResetSeed(roomId: string) {
  const existingTemplate = await db.roomTemplate.findFirst({
    where: { roomId },
  });

  if (!existingTemplate) {
    await db.roomTemplate.create({
      data: {
        roomId,
        name: "Default Runbook",
        summary: "Starter template generated during onboarding.",
        isDefault: true,
        hints: {
          create: [
            {
              stageName: "Arrival",
              label: "Open with a nudge",
              content: "Guide the team back to the first locked object before escalating.",
              order: 1,
            },
          ],
        },
        cues: {
          create: [
            {
              stageName: "Midgame",
              label: "Checkpoint cue",
              instructions: "Confirm soundtrack or in-room effect at the midpoint.",
              offsetMinutes: 20,
              order: 1,
            },
          ],
        },
      },
    });
  }

  const resetCount = await db.resetChecklistItem.count({
    where: { roomId },
  });

  if (!resetCount) {
    await db.resetChecklistItem.createMany({
      data: [
        {
          roomId,
          label: "Reset core props",
          details: "Return starting props to their locked positions.",
          order: 1,
        },
        {
          roomId,
          label: "Verify puzzle chain",
          details: "Confirm the first two progression steps are solvable.",
          order: 2,
        },
      ],
    });
  }
}

export async function completeOnboardingAction(formData: FormData) {
  const session = await requireUser();
  const venueName = String(formData.get("venueName") ?? "").trim();
  const roomName = String(formData.get("roomName") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!venueName || !roomName) {
    redirect("/dashboard/onboarding?error=missing-fields");
  }

  const venue = await db.venue.create({
    data: {
      name: venueName,
      slug: `${slugify(venueName)}-${randomBytes(2).toString("hex")}`,
      createdById: session.user.id,
    },
  });

  await db.membership.create({
    data: {
      venueId: venue.id,
      userId: session.user.id,
      role: MembershipRole.OWNER,
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: {
      activeVenueId: venue.id,
    },
  });

  const room = await db.room.create({
    data: {
      venueId: venue.id,
      name: roomName,
      slug: slugify(roomName),
      durationMinutes,
      description: "Your first room control board.",
      staffNotes: notes || "Use this note field for handoff details, puzzle quirks, and reset reminders.",
    },
  });

  await ensureTemplateAndResetSeed(room.id);

  await db.subscription.create({
    data: {
      venueId: venue.id,
      plan: SubscriptionPlan.STARTER,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      currentPeriodEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  redirect("/dashboard");
}

export async function createVenueAction(formData: FormData) {
  const session = await requireUser();
  const venueName = String(formData.get("venueName") ?? "").trim();
  const roomName = String(formData.get("roomName") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!venueName || !roomName) {
    redirect("/dashboard/venues?error=missing-fields");
  }

  if (!(await canCreateVenue(session.user.id))) {
    redirect("/dashboard/venues?error=venue-limit");
  }

  const venue = await db.venue.create({
    data: {
      name: venueName,
      slug: `${slugify(venueName)}-${randomBytes(2).toString("hex")}`,
      createdById: session.user.id,
    },
  });

  await db.membership.create({
    data: {
      venueId: venue.id,
      userId: session.user.id,
      role: MembershipRole.OWNER,
    },
  });

  const room = await db.room.create({
    data: {
      venueId: venue.id,
      name: roomName,
      slug: `${slugify(roomName)}-${randomBytes(2).toString("hex")}`,
      durationMinutes,
      description: "Starter room for the new venue workspace.",
      staffNotes: notes || "Add shift handoff notes, cue reminders, and reset risks here.",
    },
  });

  await ensureTemplateAndResetSeed(room.id);

  await db.subscription.create({
    data: {
      venueId: venue.id,
      plan: SubscriptionPlan.STARTER,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      currentPeriodEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { activeVenueId: venue.id },
  });

  revalidatePath("/dashboard/venues");
  redirect("/dashboard");
}

export async function switchActiveVenueAction(formData: FormData) {
  const session = await requireUser();
  const venueId = String(formData.get("venueId") ?? "");
  const membership = await db.membership.findUnique({
    where: {
      userId_venueId: {
        userId: session.user.id,
        venueId,
      },
    },
  });

  if (!membership) {
    redirect("/dashboard/venues?error=venue-access");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { activeVenueId: venueId },
  });

  redirect("/dashboard/venues");
}

export async function updateVenueAction(formData: FormData) {
  const { venueId } = await requireMembership(MembershipRole.OWNER);
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/dashboard/venues?error=missing-name");
  }

  await db.venue.update({
    where: { id: venueId },
    data: { name },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/venues");
}

export async function createRoomAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const name = String(formData.get("name") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    redirect("/dashboard/rooms?error=missing-name");
  }

  const allowed = await canCreateRoom(venueId);

  if (!allowed) {
    const roomLimit = getRoomLimit(
      (
        await db.subscription.findUnique({
          where: { venueId },
        })
      )?.plan ?? SubscriptionPlan.STARTER,
    );

    redirect(`/dashboard/rooms?error=room-limit&limit=${roomLimit}`);
  }

  const room = await db.room.create({
    data: {
      venueId,
      name,
      slug: `${slugify(name)}-${randomBytes(2).toString("hex")}`,
      durationMinutes,
      description,
      staffNotes: String(formData.get("staffNotes") ?? "").trim(),
    },
  });

  await ensureTemplateAndResetSeed(room.id);
  revalidatePath("/dashboard/rooms");
  redirect(`/dashboard/rooms/${room.id}`);
}

export async function updateRoomAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const roomId = String(formData.get("roomId") ?? "");

  const room = await db.room.findFirst({
    where: { id: roomId, venueId },
  });

  if (!room) {
    redirect("/dashboard/rooms?error=room-not-found");
  }

  const name = String(formData.get("name") ?? "").trim();

  await db.room.update({
    where: { id: roomId },
    data: {
      name,
      slug: `${slugify(name)}-${room.slug.split("-").slice(-1)[0]}`,
      durationMinutes: Number(formData.get("durationMinutes") ?? room.durationMinutes),
      description: String(formData.get("description") ?? ""),
      staffNotes: String(formData.get("staffNotes") ?? ""),
    },
  });

  revalidatePath("/dashboard/rooms");
  revalidatePath(`/dashboard/rooms/${roomId}`);
}

export async function deleteRoomAction(formData: FormData) {
  const { venueId } = await requireMembership(MembershipRole.OWNER);
  const roomId = String(formData.get("roomId") ?? "");

  await db.room.deleteMany({
    where: {
      id: roomId,
      venueId,
    },
  });

  revalidatePath("/dashboard/rooms");
  redirect("/dashboard/rooms");
}

export async function createTemplateAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const roomId = String(formData.get("roomId") ?? "");
  const room = await db.room.findFirst({ where: { id: roomId, venueId } });

  if (!room) {
    redirect("/dashboard/templates?error=room-not-found");
  }

  const isDefault = Boolean(formData.get("isDefault"));

  if (isDefault) {
    await db.roomTemplate.updateMany({
      where: {
        roomId,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const template = await db.roomTemplate.create({
    data: {
      roomId,
      name: String(formData.get("name") ?? "New Template"),
      summary: String(formData.get("summary") ?? ""),
      isDefault,
    },
  });

  revalidatePath("/dashboard/templates");
  redirect(`/dashboard/templates/${template.id}`);
}

export async function updateTemplateAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const templateId = String(formData.get("templateId") ?? "");
  const template = await db.roomTemplate.findFirst({
    where: {
      id: templateId,
      room: {
        venueId,
      },
    },
    include: {
      room: true,
    },
  });

  if (!template) {
    redirect("/dashboard/templates?error=template-not-found");
  }

  const isDefault = Boolean(formData.get("isDefault"));

  if (isDefault) {
    await db.roomTemplate.updateMany({
      where: {
        roomId: template.roomId,
      },
      data: {
        isDefault: false,
      },
    });
  }

  await db.roomTemplate.update({
    where: { id: templateId },
    data: {
      name: String(formData.get("name") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      isDefault,
    },
  });

  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${templateId}`);
}

export async function deleteTemplateAction(formData: FormData) {
  const { venueId } = await requireMembership(MembershipRole.OWNER);
  const templateId = String(formData.get("templateId") ?? "");
  const template = await db.roomTemplate.findFirst({
    where: {
      id: templateId,
      room: {
        venueId,
      },
    },
    include: {
      room: {
        include: {
          templates: {
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });

  if (!template) {
    redirect("/dashboard/templates?error=template-not-found");
  }

  await db.roomTemplate.deleteMany({
    where: {
      id: templateId,
      room: {
        venueId,
      },
    },
  });

  if (template.isDefault) {
    const fallbackTemplate = template.room.templates.find((entry) => entry.id !== template.id);

    if (fallbackTemplate) {
      await db.roomTemplate.update({
        where: { id: fallbackTemplate.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/rooms/${template.roomId}`);
  redirect("/dashboard/templates");
}

export async function duplicateTemplateAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const templateId = String(formData.get("templateId") ?? "");
  const roomId = String(formData.get("roomId") ?? "");

  if (!(await venueSupportsAdvancedTemplates(venueId))) {
    redirect(`/dashboard/templates/${templateId}?error=advanced-plan-required`);
  }

  const source = await db.roomTemplate.findFirst({
    where: {
      id: templateId,
      room: {
        venueId,
      },
    },
    include: {
      hints: {
        orderBy: { order: "asc" },
      },
      cues: {
        orderBy: { order: "asc" },
      },
      room: true,
    },
  });

  if (!source) {
    redirect("/dashboard/templates?error=template-not-found");
  }

  const targetRoom = await db.room.findFirst({
    where: {
      id: roomId || source.roomId,
      venueId,
    },
  });

  if (!targetRoom) {
    redirect(`/dashboard/templates/${templateId}?error=room-not-found`);
  }

  const duplicate = await db.roomTemplate.create({
    data: {
      roomId: targetRoom.id,
      name: `${source.name} Copy`,
      summary: source.summary,
      isDefault: false,
      hints: {
        create: source.hints.map((hint) => ({
          stageName: hint.stageName,
          label: hint.label,
          content: hint.content,
          order: hint.order,
          hintType: hint.hintType,
        })),
      },
      cues: {
        create: source.cues.map((cue) => ({
          stageName: cue.stageName,
          label: cue.label,
          instructions: cue.instructions,
          offsetMinutes: cue.offsetMinutes,
          order: cue.order,
        })),
      },
    },
  });

  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/rooms/${targetRoom.id}`);
  redirect(`/dashboard/templates/${duplicate.id}?status=duplicated`);
}

export async function addTemplateHintAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const templateId = String(formData.get("templateId") ?? "");
  const template = await db.roomTemplate.findFirst({
    where: {
      id: templateId,
      room: {
        venueId,
      },
    },
    include: {
      hints: true,
    },
  });

  if (!template) {
    redirect("/dashboard/templates?error=template-not-found");
  }

  await db.templateHint.create({
    data: {
      templateId,
      stageName: String(formData.get("stageName") ?? "General"),
      label: String(formData.get("label") ?? ""),
      content: String(formData.get("content") ?? ""),
      hintType: (String(formData.get("hintType") ?? "NUDGE") as "NUDGE" | "DIRECT_CLUE" | "SOLVE_ASSIST"),
      order: template.hints.length + 1,
    },
  });

  revalidatePath(`/dashboard/templates/${templateId}`);
}

export async function deleteTemplateHintAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const hintId = String(formData.get("hintId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");

  await db.templateHint.deleteMany({
    where: {
      id: hintId,
      template: {
        room: {
          venueId,
        },
      },
    },
  });

  revalidatePath(`/dashboard/templates/${templateId}`);
}

export async function addTemplateCueAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const templateId = String(formData.get("templateId") ?? "");
  const template = await db.roomTemplate.findFirst({
    where: {
      id: templateId,
      room: {
        venueId,
      },
    },
    include: {
      cues: true,
    },
  });

  if (!template) {
    redirect("/dashboard/templates?error=template-not-found");
  }

  await db.templateCue.create({
    data: {
      templateId,
      stageName: String(formData.get("stageName") ?? "General"),
      label: String(formData.get("label") ?? ""),
      instructions: String(formData.get("instructions") ?? ""),
      offsetMinutes: Number(formData.get("offsetMinutes") ?? 0),
      order: template.cues.length + 1,
    },
  });

  revalidatePath(`/dashboard/templates/${templateId}`);
}

export async function deleteTemplateCueAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const cueId = String(formData.get("cueId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");

  await db.templateCue.deleteMany({
    where: {
      id: cueId,
      template: {
        room: {
          venueId,
        },
      },
    },
  });

  revalidatePath(`/dashboard/templates/${templateId}`);
}

export async function addResetChecklistItemAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const roomId = String(formData.get("roomId") ?? "");
  const room = await db.room.findFirst({
    where: { id: roomId, venueId },
    include: { resetItems: true },
  });

  if (!room) {
    redirect("/dashboard/resets?error=room-not-found");
  }

  await db.resetChecklistItem.create({
    data: {
      roomId,
      label: String(formData.get("label") ?? ""),
      details: String(formData.get("details") ?? ""),
      order: room.resetItems.length + 1,
    },
  });

  revalidatePath(`/dashboard/resets/${roomId}`);
  revalidatePath(`/dashboard/rooms/${roomId}`);
}

export async function deleteResetChecklistItemAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const roomId = String(formData.get("roomId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");

  await db.resetChecklistItem.deleteMany({
    where: {
      id: itemId,
      room: {
        venueId,
      },
    },
  });

  revalidatePath(`/dashboard/resets/${roomId}`);
  revalidatePath(`/dashboard/rooms/${roomId}`);
}

export async function startSessionAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const roomId = String(formData.get("roomId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const room = await db.room.findFirst({
    where: { id: roomId, venueId },
  });

  const template = await db.roomTemplate.findFirst({
    where: { id: templateId, roomId },
  });

  if (!room || !template) {
    redirect("/dashboard/sessions/new?error=invalid-selection");
  }

  const gameSession = await db.gameSession.create({
    data: {
      roomId,
      templateId,
      startedById: session.user.id,
      teamName: String(formData.get("teamName") ?? "Walk-in Team"),
      status: SessionStatus.ACTIVE,
      currentStage: String(formData.get("currentStage") ?? "Arrival"),
      durationMinutes: room.durationMinutes,
    },
  });

  await db.sessionEvent.create({
    data: {
      sessionId: gameSession.id,
      type: SessionEventType.SESSION_STARTED,
      createdById: session.user.id,
    },
  });

  redirect(`/dashboard/sessions/${gameSession.id}`);
}

async function getManagedSession(sessionId: string, userId: string, venueId: string) {
  return db.gameSession.findFirst({
    where: {
      id: sessionId,
      room: {
        venueId,
      },
    },
    include: {
      room: true,
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function pauseSessionAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const current = await getManagedSession(sessionId, session.user.id, venueId);

  if (!current || current.status !== SessionStatus.ACTIVE) {
    redirect(`/dashboard/sessions/${sessionId}?error=not-active`);
  }

  await db.gameSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.PAUSED,
      pausedAt: new Date(),
    },
  });

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.SESSION_PAUSED,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function resumeSessionAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const current = await getManagedSession(sessionId, session.user.id, venueId);

  if (!current || current.status !== SessionStatus.PAUSED || !current.pausedAt) {
    redirect(`/dashboard/sessions/${sessionId}?error=not-paused`);
  }

  const additionalPaused = Math.max(0, Math.floor((Date.now() - current.pausedAt.getTime()) / 1000));

  await db.gameSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.ACTIVE,
      pausedAt: null,
      pausedTotalSeconds: current.pausedTotalSeconds + additionalPaused,
    },
  });

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.SESSION_RESUMED,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function endSessionAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const current = await getManagedSession(sessionId, session.user.id, venueId);

  if (!current) {
    redirect("/dashboard/sessions?error=session-not-found");
  }

  const additionalPaused =
    current.status === SessionStatus.PAUSED && current.pausedAt
      ? Math.max(0, Math.floor((Date.now() - current.pausedAt.getTime()) / 1000))
      : 0;

  await db.gameSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.ENDED,
      pausedAt: null,
      pausedTotalSeconds: current.pausedTotalSeconds + additionalPaused,
      endedAt: new Date(),
    },
  });

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.SESSION_ENDED,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/dashboard/history");
}

export async function logHintAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const type = String(formData.get("hintType") ?? "NUDGE");
  const managed = await getManagedSession(sessionId, session.user.id, venueId);

  if (!managed) {
    redirect("/dashboard/sessions?error=session-not-found");
  }

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.HINT_SENT,
      createdById: session.user.id,
      payloadJson: {
        label,
        hintType: type,
      },
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function logCueFiredAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const managed = await getManagedSession(sessionId, session.user.id, venueId);

  if (!managed) {
    redirect("/dashboard/sessions?error=session-not-found");
  }

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.CUE_FIRED,
      createdById: session.user.id,
      payloadJson: { label },
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function logPuzzleSolvedAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const managed = await getManagedSession(sessionId, session.user.id, venueId);

  if (!managed) {
    redirect("/dashboard/sessions?error=session-not-found");
  }

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.PUZZLE_SOLVED,
      createdById: session.user.id,
      payloadJson: { label },
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function addSessionNoteAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const managed = await getManagedSession(sessionId, session.user.id, venueId);

  if (!managed || !body) {
    redirect(`/dashboard/sessions/${sessionId}?error=missing-note`);
  }

  await db.sessionNote.create({
    data: {
      sessionId,
      body,
      createdById: session.user.id,
    },
  });

  await db.sessionEvent.create({
    data: {
      sessionId,
      type: SessionEventType.NOTE_ADDED,
      createdById: session.user.id,
      payloadJson: { label: body.slice(0, 60) },
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function updateSessionStageAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const currentStage = String(formData.get("currentStage") ?? "").trim();

  await db.gameSession.updateMany({
    where: {
      id: sessionId,
      room: {
        venueId,
      },
    },
    data: {
      currentStage,
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function updateSessionHandoffNotesAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const handoffNotes = String(formData.get("handoffNotes") ?? "");

  await db.gameSession.updateMany({
    where: {
      id: sessionId,
      room: {
        venueId,
      },
    },
    data: {
      handoffNotes,
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
}

export async function saveResetRunAction(formData: FormData) {
  const { venueId, session } = await requireMembership();
  const roomId = String(formData.get("roomId") ?? "");
  const room = await db.room.findFirst({
    where: { id: roomId, venueId },
    include: {
      resetItems: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!room) {
    redirect("/dashboard/resets?error=room-not-found");
  }

  const resetRun = await db.resetRun.create({
    data: {
      roomId,
      completedById: session.user.id,
      items: {
        create: room.resetItems.map((item) => ({
          checklistItemId: item.id,
          completed: formData.get(`item-${item.id}`) === "on",
          completedAt: formData.get(`item-${item.id}`) === "on" ? new Date() : null,
        })),
      },
    },
  });

  await db.sessionEvent.createMany({
    data: [
      {
        sessionId:
          (
            await db.gameSession.findFirst({
              where: {
                roomId,
                status: SessionStatus.ACTIVE,
              },
              select: { id: true },
            })
          )?.id ?? "",
        type: SessionEventType.RESET_COMPLETED,
        createdById: session.user.id,
      },
    ].filter((event) => event.sessionId),
  });

  revalidatePath("/dashboard/resets");
  redirect(`/dashboard/resets/${roomId}?saved=${resetRun.id}`);
}

export async function createTeamInviteAction(formData: FormData) {
  const { venueId, session } = await requireMembership(MembershipRole.OWNER);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "STAFF") as MembershipRole;

  if (!(await canInviteUser(venueId))) {
    redirect("/dashboard/settings/team?error=user-limit");
  }

  const invite = await db.teamInvite.upsert({
    where: {
      venueId_email: {
        venueId,
        email,
      },
    },
    update: {
      role,
      token: randomBytes(16).toString("hex"),
      status: "PENDING",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      createdById: session.user.id,
    },
    create: {
      venueId,
      email,
      role,
      token: randomBytes(16).toString("hex"),
      status: "PENDING",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      createdById: session.user.id,
    },
  });

  if (hasResend()) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const inviteUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/accept-invite/${invite.token}`;

    await resend.emails.send({
      from: "Master Control <noreply@updates.mastercontrol-demo.local>",
      to: email,
      subject: "You’ve been invited to Master Control",
      text: `Open this link to join the venue: ${inviteUrl}`,
    });

    redirect("/dashboard/settings/team?status=invite-sent");
  }

  redirect("/dashboard/settings/team?status=invite-local");
}

export async function acceptInviteAction(token: string) {
  const session = await requireUser();
  const invite = await db.teamInvite.findUnique({
    where: { token },
  });

  if (!invite || invite.expiresAt < new Date()) {
    redirect("/login?error=invite-expired");
  }

  await db.membership.upsert({
    where: {
      userId_venueId: {
        userId: session.user.id,
        venueId: invite.venueId,
      },
    },
    update: {
      role: invite.role,
    },
    create: {
      userId: session.user.id,
      venueId: invite.venueId,
      role: invite.role,
    },
  });

  await db.teamInvite.update({
    where: { token },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      acceptedById: session.user.id,
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { activeVenueId: invite.venueId },
  });

  redirect("/dashboard");
}

export async function switchPlanAction(formData: FormData) {
  const { venueId } = await requireMembership(MembershipRole.OWNER);
  const plan = String(formData.get("plan") ?? "STARTER") as SubscriptionPlan;

  if (hasStripe()) {
    redirect("/dashboard/billing?status=stripe-needs-live-config");
  }

  await db.subscription.upsert({
    where: { venueId },
    update: {
      plan,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      currentPeriodEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
    create: {
      venueId,
      plan,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      currentPeriodEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/rooms");
  redirect("/dashboard/billing?status=mock-plan-updated");
}

export async function generateHandoffSummaryAction(formData: FormData) {
  const { venueId } = await requireMembership();
  const sessionId = String(formData.get("sessionId") ?? "");
  const current = await db.gameSession.findFirst({
    where: {
      id: sessionId,
      room: {
        venueId,
      },
    },
    include: {
      room: true,
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!current) {
    redirect("/dashboard/history?error=session-not-found");
  }

  const summary = buildHandoffSummary({
    roomName: current.room.name,
    teamName: current.teamName,
    status: current.status,
    currentStage: current.currentStage,
    handoffNotes: current.handoffNotes,
    events: current.events,
  });

  await db.gameSession.update({
    where: { id: sessionId },
    data: {
      handoffNotes: summary,
    },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/dashboard/history");
}
