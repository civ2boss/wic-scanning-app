import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL || "https://polished-otter-130.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);

