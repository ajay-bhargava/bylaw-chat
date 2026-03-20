import { openai } from "@ai-sdk/openai";
import { RAG } from "@convex-dev/rag";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { action } from "./_generated/server";

const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-large"),
  embeddingDimension: 3072,
});

export const ingestOfferingPlan = action({
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

export const searchOfferingPlan = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const { text, results } = await rag.search(ctx, {
      namespace: "condo-docs",
      query,
      limit: 10,
      chunkContext: { before: 2, after: 1 },
    });
    return { text, resultCount: results.length };
  },
});
