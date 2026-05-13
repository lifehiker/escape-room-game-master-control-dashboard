export const demoCredentials = [
  {
    label: "Owner demo",
    email: "owner@midnight-heist.test",
    password: "demo-owner-123",
  },
  {
    label: "Staff demo",
    email: "staff@midnight-heist.test",
    password: "demo-staff-123",
  },
] as const;

export const templateLibrary = [
  {
    slug: "horror-room-control-template",
    title: "Horror Room Control Template",
    summary: "Timed scares, atmospheric cues, and escalation notes for a 75-minute possession storyline.",
  },
  {
    slug: "detective-room-hint-flow",
    title: "Detective Room Hint Flow",
    summary: "Evidence-led hints and dead-end recovery steps for clue-dense mystery rooms.",
  },
] as const;
