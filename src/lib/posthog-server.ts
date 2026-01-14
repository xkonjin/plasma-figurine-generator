import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }
  
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1, // Flush immediately for serverless
      flushInterval: 0,
    });
  }
  
  return posthogClient;
}

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogServer();
  if (client) {
    client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        $lib: "posthog-node",
        environment: process.env.NODE_ENV,
      },
    });
    await client.shutdown();
  }
}
