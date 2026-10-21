import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://ed8b338dcd5f83cd09cc5e79f7848c3b@o224644.ingest.us.sentry.io/4512295549075456",
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
  // This sets the sample rate at 10%. You may want to change it to 100% while
  // in development and then sample at a lower rate in production.
  replaysSessionSampleRate: 0.1,
  // If you're not already sampling the entire session, change the sample rate
  // to 100% when sampling sessions where errors occur.
  replaysOnErrorSampleRate: 1.0,
});
