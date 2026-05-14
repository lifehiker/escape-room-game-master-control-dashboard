"use client";

import { SessionProvider } from "next-auth/react";

import { AnalyticsProvider } from "@/components/analytics-provider";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AnalyticsProvider />
      {children}
    </SessionProvider>
  );
}
