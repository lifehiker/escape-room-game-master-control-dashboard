import Link from "next/link";

import { templateLibrary } from "@/lib/demo-data";
import { Card } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Templates</p>
        <h1 className="mt-4 text-5xl font-semibold text-[var(--color-ink)]">Template library for escape room live ops.</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--color-ink-muted)]">
          Publish keyword-focused template pages while giving operators real examples of stage design, clue escalation, and reset rhythm.
        </p>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {templateLibrary.map((template) => (
          <Link key={template.slug} href={`/templates/${template.slug}`}>
            <Card className="h-full">
              <p className="text-2xl font-semibold text-[var(--color-ink)]">{template.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">{template.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
