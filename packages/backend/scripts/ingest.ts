/**
 * Re-ingest a document into the RAG index (admin only).
 *
 *   CONVEX_URL=https://<deployment>.convex.cloud CONVEX_DEPLOY_KEY=<key> \
 *     bun packages/backend/scripts/ingest.ts rules|offering-plan
 *
 * The ingest actions are internal, so this uses the deploy key's admin auth.
 */
import { ConvexHttpClient } from "convex/browser";

import { OFFERING_PLAN_CONTENT } from "../../../apps/web/src/lib/offering_plan_content";
import { RULES_CONTENT } from "../../../apps/web/src/lib/rules_content";
import { internal } from "../convex/_generated/api";

const doc = process.argv[2];
const url = process.env.CONVEX_URL;
const deployKey = process.env.CONVEX_DEPLOY_KEY;

if (!url || !deployKey || (doc !== "rules" && doc !== "offering-plan")) {
  console.error("Usage: CONVEX_URL=... CONVEX_DEPLOY_KEY=... bun scripts/ingest.ts rules|offering-plan");
  process.exit(1);
}

const client = new ConvexHttpClient(url);
// setAdminAuth is not in the public typings but is how admin keys call internal functions.
(client as unknown as { setAdminAuth: (key: string) => void }).setAdminAuth(deployKey);

// Internal references are typed separately; the HTTP client accepts them under admin auth.
type AnyAction = Parameters<ConvexHttpClient["action"]>[0];
const ref = (doc === "rules" ? internal.rag.ingestRules : internal.rag.ingestOfferingPlan) as unknown as AnyAction;
const text = doc === "rules" ? RULES_CONTENT : OFFERING_PLAN_CONTENT;

await client.action(ref, { text });
console.log(`Ingested ${doc}`);
