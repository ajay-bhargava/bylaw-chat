import { anthropic } from "@ai-sdk/anthropic";
import { api } from "@bylaw-chat/backend/convex/_generated/api";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { ConvexHttpClient } from "convex/browser";

import { BYLAWS_CONTENT } from "@/lib/bylaws_content";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function buildSystemPrompt(retrievedContext: string) {
  return `You answer questions about The 1399 Park Avenue Condominium using three documents: the Bylaws, the Offering Plan, and the Rules and Regulations.

Rules:
- Answer in 1-3 short sentences of plain English. No legalese, no filler, no preamble.
- Get straight to the point. Say what the documents require, allow, or prohibit.
- After your answer, add 1-2 citations (only the most relevant). Format: [[cite: bylaws | Article X, Section X.X | exact quoted text]] or [[cite: offering-plan | Section Name | exact quoted text]] or [[cite: rules | Article X, Section X.X | exact quoted text]]
- The first part identifies the document (bylaws, offering-plan, or rules), the second part identifies the section, and the third part is the exact quoted text.
- Do not repeat the question. Do not say "according to the bylaws" or "the offering plan states."
- When questions span multiple documents, cross-reference and cite from all relevant ones.

BYLAWS:
${BYLAWS_CONTENT}

OFFERING PLAN & RULES AND REGULATIONS (relevant excerpts retrieved via semantic search):
${retrievedContext}`;
}

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  let query = "";
  if (lastUserMessage) {
    const parts = lastUserMessage.parts as Array<{ type: string; text?: string }>;
    query = parts
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text!)
      .join(" ");
  }

  const { text: retrievedContext } = query.trim()
    ? await convex.action(api.rag.searchDocuments, { query })
    : { text: "" };

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages: await convertToModelMessages(messages),
    system: buildSystemPrompt(retrievedContext),
  });

  return result.toTextStreamResponse();
}
