# Static PWA Frontend with Convex Backend Separation

We build and deploy the Astro frontend as a purely static Progressive Web App (`output: "static"`) rather than using the `@astrojs/vercel` server adapter. Because all product catalog scraping and synchronization run in scheduled Convex Actions and all household state lives on the device, the web tier requires no server-rendered routes or Vercel serverless functions, eliminating cold starts and allowing the entire application shell to be cached offline by the service worker.
