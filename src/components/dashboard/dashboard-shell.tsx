"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";

export function DashboardShell({
  venueName,
  userName,
  role,
  children,
}: {
  venueName?: string;
  userName?: string | null;
  role?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1680px] gap-6 px-4 py-4 lg:px-6">
      <AppSidebar pathname={pathname} venueName={venueName} />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Topbar name={userName} role={role} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
