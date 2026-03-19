"use node";

import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { httpAction } from "./_generated/server";
import { BYLAWS_CONTENT } from "./bylaws-content";

const systemPrompt = `You are a helpful assistant that answers questions about the bylaws of The 1399 Park Avenue Condominium.

Below are the full bylaws for reference. When answering questions:
1. Always cite the specific Article and Section numbers
2. Include exact quoted text from the bylaws wrapped in this format: [[cite: Article X, Section X.X | exact quoted text from bylaws]]
3. If the answer spans multiple sections, include multiple citations
4. Be accurate and thorough in your answers

BYLAWS:
${BYLAWS_CONTENT}`;

export const chat = httpAction(async (_ctx, request) => {
  const { messages } = await request.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages,
    system: systemPrompt,
  });

  return result.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

export const chatOptions = httpAction(async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
});
