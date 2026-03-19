import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { BYLAWS_CONTENT } from "@/lib/bylaws_content";

const systemPrompt = `You answer questions about the bylaws of The 1399 Park Avenue Condominium.

Rules:
- Answer in 1-3 short sentences of plain English. No legalese, no filler, no preamble.
- Get straight to the point. Say what the bylaws require, allow, or prohibit.
- After your answer, add 1-2 citations (only the most relevant). Format: [[cite: Article X, Section X.X | exact quoted text from bylaws]]
- Do not repeat the question. Do not say "according to the bylaws" or "the bylaws state."

BYLAWS:
${BYLAWS_CONTENT}`;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages: await convertToModelMessages(messages),
    system: systemPrompt,
  });

  return result.toTextStreamResponse();
}
