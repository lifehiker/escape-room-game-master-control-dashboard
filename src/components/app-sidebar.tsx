import Link from "next/link";
import { Activity, Compass, DoorOpen, FileStack, History, LayoutPanelTop, Receipt, Users2, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutPanelTop },
  { href: "/dashboard/venues", label: "Venue", icon: Compass },
  { href: "/dashboard/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/dashboard/templates", label: "Templates", icon: FileStack },
  { href: "/dashboard/sessions", label: "Live Sessions", icon: Activity },
  { href: "/dashboard/resets", label: "Reset Logs", icon: Wrench },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings/team", label: "Team", icon: Users2 },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
];

export function AppSidebar({
  pathname,
  venueName,
}: {
  pathname: string;
  venueName?: string;
}) {
  return (
    <aside className="panel hidden w-72 shrink-0 rounded-[30px] p-6 text-white lg:flex lg:flex-col">
      <div className="mb-8 space-y-3">
        <Badge className="border-white/10 bg-white/10 text-white/70">Master Control</Badge>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/45">Active Venue</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{venueName ?? "Set up venue"}</h2>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white",
                isActive && "bg-white/10 text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
