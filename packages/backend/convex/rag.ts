import { openai } from "@ai-sdk/openai";
import { RAG } from "@convex-dev/rag";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-large"),
  embeddingDimension: 3072,
});

// Ingestion is internal-only: a public action would let anyone overwrite the indexed documents.
// Run via packages/backend/scripts/ingest.ts with a deploy key.
export const ingestOfferingPlan = internalAction({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    await rag.add(ctx, {
      namespace: "condo-docs",
      key: "offering-plan",
      title: "Offering Plan - The 1399 Park Avenue Condominium",
      text,
    });
    return { success: true };
  },
});

export const ingestRules = internalAction({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    await rag.add(ctx, {
      namespace: "condo-docs",
      key: "rules",
      title: "Rules and Regulations - 1399 Park Avenue Condominium",
      text,
    });
    return { success: true };
  },
});

export const searchDocuments = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    // Each search costs an embedding call, so only signed-in users may search.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (query.length > 4000) throw new Error("Query too long");

    const { text, results } = await rag.search(ctx, {
      namespace: "condo-docs",
      query,
      limit: 10,
      chunkContext: { before: 2, after: 1 },
    });
    return { text, resultCount: results.length };
  },
});
