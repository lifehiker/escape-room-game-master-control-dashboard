import Link from "next/link";

import { Card } from "@/components/ui/card";

const posts = [
  {
    href: "/blog/spreadsheet-vs-escape-room-control-software",
    title: "Spreadsheets vs Escape Room Control Software",
    summary: "Why live ops breaks down when timers, hints, cues, and resets are split across tools.",
  },
  {
    href: "/blog/how-to-run-game-master-handoffs-without-missed-clues",
    title: "How to Run Game Master Handoffs Without Missed Clues",
    summary: "A practical handoff system for staff changes during or between room sessions.",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-[var(--color-ink)]">Master Control Blog</h1>
      <div className="mt-10 grid gap-4">
        {posts.map((post) => (
          <Link key={post.href} href={post.href}>
            <Card>
              <p className="text-2xl font-semibold text-[var(--color-ink)]">{post.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">{post.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
