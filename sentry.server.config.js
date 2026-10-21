import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://ed8b338dcd5f83cd09cc5e79f7848c3b@o224644.ingest.us.sentry.io/4512295549075456",
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
});
