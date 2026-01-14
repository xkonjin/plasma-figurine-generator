import posthog from "posthog-js";

const APP_NAME = "Plasma Figurine Generator";

export const initPostHog = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: false,
        maskInputFn: (text, element) => {
          if (element?.getAttribute("type") === "email") {
            return text;
          }
          return text;
        },
      },
      loaded: (posthog) => {
        // Register app name as a super property so it's included in all events
        posthog.register({
          app: APP_NAME,
          app_version: "1.0.0",
        });
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
    });
  }
  return posthog;
};

export { posthog };
