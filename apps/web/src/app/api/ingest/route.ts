import { api } from "@bylaw-chat/backend/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

import { OFFERING_PLAN_CONTENT } from "@/lib/offering_plan_content";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  await convex.action(api.rag.ingestOfferingPlan, {
    text: OFFERING_PLAN_CONTENT,
  });

  return Response.json({ success: true });
}
