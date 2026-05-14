import { NextResponse } from "next/server";

import { getAuthSession } from "@/auth";
import { db } from "@/lib/db";
import { venueSupportsAdvancedTemplates } from "@/lib/dashboard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const session = await getAuthSession();

  if (!session?.user?.id || !session.user.activeVenueId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await params;
  const membership = await db.membership.findUnique({
    where: {
      userId_venueId: {
        userId: session.user.id,
        venueId: session.user.activeVenueId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!(await venueSupportsAdvancedTemplates(session.user.activeVenueId))) {
    return NextResponse.json({ error: "Advanced plan required" }, { status: 403 });
  }

  const template = await db.roomTemplate.findFirst({
    where: {
      id: templateId,
      room: {
        venueId: session.user.activeVenueId,
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
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        venueId: session.user.activeVenueId,
        room: {
          id: template.room.id,
          name: template.room.name,
          durationMinutes: template.room.durationMinutes,
        },
        template: {
          name: template.name,
          summary: template.summary,
          isDefault: template.isDefault,
          hints: template.hints,
          cues: template.cues,
        },
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${template.room.slug}-${template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json"`,
      },
    },
  );
}
