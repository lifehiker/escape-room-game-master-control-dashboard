"use client";

import { useEffect, useState } from "react";

import { formatTimestamp } from "@/lib/utils";

type SessionTimerProps = {
  status: "ACTIVE" | "PAUSED" | "ENDED";
  startedAt: string;
  pausedAt?: string | null;
  pausedTotalSeconds: number;
  durationMinutes: number;
  endedAt?: string | null;
};

export function SessionTimer({
  status,
  startedAt,
  pausedAt,
  pausedTotalSeconds,
  durationMinutes,
  endedAt,
}: SessionTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "ACTIVE") {
      return;
    }

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [status]);

  const startMs = new Date(startedAt).getTime();
  const pauseMs = pausedAt ? new Date(pausedAt).getTime() : null;
  const endMs = endedAt ? new Date(endedAt).getTime() : null;

  const elapsedSeconds =
    status === "ENDED" && endMs
      ? Math.max(0, Math.floor((endMs - startMs) / 1000) - pausedTotalSeconds)
      : status === "PAUSED" && pauseMs
        ? Math.max(0, Math.floor((pauseMs - startMs) / 1000) - pausedTotalSeconds)
        : Math.max(0, Math.floor((now - startMs) / 1000) - pausedTotalSeconds);

  const remainingSeconds = Math.max(0, durationMinutes * 60 - elapsedSeconds);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[24px] bg-[var(--color-panel-solid)] px-5 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/45">Time Remaining</p>
        <p className="mt-4 font-mono text-5xl font-semibold">{formatTimestamp(remainingSeconds)}</p>
      </div>
      <div className="rounded-[24px] border border-[var(--color-line)] bg-white/70 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-ink-muted)]">
          Elapsed / Status
        </p>
        <p className="mt-4 font-mono text-4xl font-semibold text-[var(--color-ink)]">
          {formatTimestamp(elapsedSeconds)}
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{status.toLowerCase()}</p>
      </div>
    </div>
  );
}
