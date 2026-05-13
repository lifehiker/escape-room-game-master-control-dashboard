import { MarketingPageShell } from "@/components/marketing/page-shell";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingPageShell>{children}</MarketingPageShell>;
}
