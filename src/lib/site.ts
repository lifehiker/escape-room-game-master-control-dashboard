export const siteConfig = {
  name: "Master Control",
  url: "https://mastercontrol-demo.local",
  description:
    "Browser-based escape room control software for game masters. Run hints, timers, media cues, handoffs, and reset checklists from one live dashboard.",
  email: "support@mastercontrol-demo.local",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
