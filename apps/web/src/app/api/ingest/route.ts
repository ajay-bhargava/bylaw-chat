import { api } from "@bylaw-chat/backend/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

import { OFFERING_PLAN_CONTENT } from "@/lib/offering_plan_content";
import { RULES_CONTENT } from "@/lib/rules_content";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const doc = searchParams.get("doc");

  if (doc === "rules") {
    await convex.action(api.rag.ingestRules, {
      text: RULES_CONTENT,
    });
    return Response.json({ success: true, document: "rules" });
  }

  await convex.action(api.rag.ingestOfferingPlan, {
    text: OFFERING_PLAN_CONTENT,
  });
  return Response.json({ success: true, document: "offering-plan" });
}
