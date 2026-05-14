import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

const marketingRoutes = [
  "/",
  "/features",
  "/pricing",
  "/demo",
  "/templates",
  "/templates/horror-room-control-template",
  "/templates/detective-room-hint-flow",
  "/escape-room-hint-system",
  "/escape-room-game-master-software",
  "/escape-room-control-panel",
  "/escape-room-reset-checklist",
  "/blog",
  "/blog/spreadsheet-vs-escape-room-control-software",
  "/blog/how-to-run-game-master-handoffs-without-missed-clues",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return marketingRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" || path === "/pricing" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/blog") ? 0.7 : 0.8,
  }));
}
