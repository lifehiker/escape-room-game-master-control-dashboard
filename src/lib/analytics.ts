export type AnalyticsProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: AnalyticsProps }) => void;
    gtag?: (command: "event", eventName: string, params?: AnalyticsProps) => void;
  }
}

export function trackEvent(eventName: string, props?: AnalyticsProps) {
  if (typeof window === "undefined") {
    return;
  }

  window.plausible?.(eventName, props ? { props } : undefined);
  window.gtag?.("event", eventName, props);
}
