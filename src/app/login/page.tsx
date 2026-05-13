import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";
import { hasGoogleAuth } from "@/lib/env";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="grid w-full max-w-5xl gap-8 p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="rounded-[28px] bg-[var(--color-panel-solid)] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Master Control</p>
          <h1 className="mt-4 text-4xl font-semibold">Run your live rooms from one browser tab.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Sign in to manage hints, timers, event logs, reset runs, and staff handoffs. This build ships with
            seeded local demo accounts so you can validate the full workflow without external credentials.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Live sessions", "Start, pause, resume, and close sessions with persistent timing."],
              ["Template library", "Store hints, cues, and reset steps per room."],
              ["Shared access", "Owners and staff work from the same venue data."],
              ["Safe fallbacks", "Billing and invites stay usable when Stripe or email creds are missing."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
            Sign in
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">Access the dashboard</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Use the local demo credentials below, or enable Google OAuth for live sign-in.
          </p>
          <div className="mt-8">
            <LoginForm hasGoogle={hasGoogleAuth()} />
          </div>
        </div>
      </Card>
    </div>
  );
}
