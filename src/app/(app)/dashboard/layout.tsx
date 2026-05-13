import { roleLabel } from "@/lib/dashboard";

import { requireUser } from "@/lib/auth-helpers";
import { getActiveMembershipForUser } from "@/lib/dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const membership = await getActiveMembershipForUser(session.user.id);

  return (
    <DashboardShell
      venueName={membership?.venue.name}
      userName={membership?.user.name ?? session.user.email}
      role={membership ? roleLabel(membership.role) : null}
    >
      {children}
    </DashboardShell>
  );
}
