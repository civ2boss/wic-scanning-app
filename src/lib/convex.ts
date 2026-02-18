import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("PUBLIC_CONVEX_URL environment variable is not set. Please add it to your .env file.");
}

export const convex = new ConvexReactClient(convexUrl);

