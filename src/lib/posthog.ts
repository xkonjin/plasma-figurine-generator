import posthog from "posthog-js";

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
          // Don't mask email inputs for better debugging
          if (element?.getAttribute("type") === "email") {
            return text;
          }
          return text;
        },
      },
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
    });
  }
  return posthog;
};

export { posthog };
