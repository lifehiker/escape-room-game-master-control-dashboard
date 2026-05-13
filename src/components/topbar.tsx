import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/sign-out-button";

export function Topbar({
  name,
  role,
}: {
  name?: string | null;
  role?: string | null;
}) {
  return (
    <div className="panel flex items-center justify-between rounded-[28px] px-5 py-4 text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Live Operations</p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">Control dashboard</h1>
          {role ? <Badge className="border-white/10 bg-white/10 text-white/80">{role}</Badge> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm text-white/90">{name ?? "Team member"}</p>
          <Link href="/dashboard/settings/team" className="text-xs text-white/50 hover:text-white/80">
            Manage team access
          </Link>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
