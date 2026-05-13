import { redirect } from "next/navigation";
import { MembershipRole } from "@prisma/client";

import { getAuthSession } from "@/auth";
import { db } from "@/lib/db";

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  return session;
}

export async function requireMembership(role?: MembershipRole) {
  const session = await requireUser();

  if (!session.user.activeVenueId) {
    redirect("/dashboard/onboarding");
  }

  const membership = await db.membership.findUnique({
    where: {
      userId_venueId: {
        userId: session.user.id,
        venueId: session.user.activeVenueId,
      },
    },
    include: {
      venue: true,
      user: true,
    },
  });

  if (!membership) {
    redirect("/dashboard/onboarding");
  }

  if (role && membership.role !== role) {
    redirect("/dashboard");
  }

  return {
    session,
    membership,
    venueId: membership.venueId,
  };
}
