"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { CtaLink } from "@/components/marketing/cta-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoCredentials } from "@/lib/demo-data";

export function LoginForm({ hasGoogle }: { hasGoogle: boolean }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState<string>(demoCredentials[0].email);
  const [password, setPassword] = useState<string>(demoCredentials[0].password);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: next,
    });

    setLoading(false);

    if (result?.error) {
      setError("Sign-in failed. Use one of the seeded demo accounts or configure Google OAuth.");
      return;
    }

    window.location.href = result?.url ?? next;
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
        {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {hasGoogle ? (
        <Button variant="secondary" className="w-full" onClick={() => signIn("google", { callbackUrl: next })}>
          Continue with Google
        </Button>
      ) : null}

      <div className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4 text-sm text-[var(--color-ink-muted)]">
        <p className="font-semibold text-[var(--color-ink)]">Demo access</p>
        <p className="mt-2">
          Owner: <code>owner@midnight-heist.test</code> / <code>demo-owner-123</code>
        </p>
        <p className="mt-1">
          Staff: <code>staff@midnight-heist.test</code> / <code>demo-staff-123</code>
        </p>
      </div>

      <CtaLink href="/" variant="secondary" className="w-full">
        Back to site
      </CtaLink>
    </div>
  );
}
