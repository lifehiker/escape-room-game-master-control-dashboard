import { MarketingNav } from "@/components/marketing-nav";

export function MarketingPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main>{children}</main>
    </div>
  );
}
