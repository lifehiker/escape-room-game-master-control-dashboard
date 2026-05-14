const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export const siteConfig = {
  name: "Master Control",
  url: defaultUrl,
  description:
    "Browser-based escape room control software for game masters. Run hints, timers, media cues, handoffs, and reset checklists from one live dashboard.",
  email: process.env.SUPPORT_EMAIL || "support@example.com",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
