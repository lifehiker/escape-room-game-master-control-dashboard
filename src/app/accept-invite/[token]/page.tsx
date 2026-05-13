import { acceptInviteAction } from "@/app/(app)/dashboard/actions";
import { getAuthSession } from "@/auth";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await db.teamInvite.findUnique({
    where: { token },
    include: {
      venue: true,
    },
  });
  const session = await getAuthSession();

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-xl">
          <p className="text-lg font-semibold text-[var(--color-ink)]">Invite not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="max-w-2xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">Team invite</p>
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Join {invite.venue.name}</h1>
        <p className="text-sm leading-7 text-[var(--color-ink-muted)]">
          This invite grants {invite.role.toLowerCase()} access to the venue’s templates, session logs, and reset workflows.
        </p>
        {session?.user?.id ? (
          <form
            action={async () => {
              "use server";
              await acceptInviteAction(token);
            }}
          >
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Accept invite
            </button>
          </form>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/accept-invite/${token}`)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in to accept
          </Link>
        )}
      </Card>
    </div>
  );
}
