"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { env } from "@bylaw-chat/env/web";
import { type Citation, parseCitations, stripCitations } from "@/lib/citations";

import { Button } from "./ui/button";

const convexSiteUrl = env.NEXT_PUBLIC_CONVEX_URL.replace(".cloud", ".site");

interface ChatPanelProps {
  onCitationsChange: (citations: Citation[]) => void;
  onCitationClick: (index: number) => void;
}

export default function ChatPanel({ onCitationsChange, onCitationClick }: ChatPanelProps) {
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: convexSiteUrl + "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract citations from the latest assistant message
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) {
      onCitationsChange([]);
      return;
    }
    const fullText = lastAssistant.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    const citations = parseCitations(fullText);
    onCitationsChange(citations);
  }, [messages, onCitationsChange]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;
    sendMessage({ text });
    input.value = "";
  }

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Ask a question about the bylaws
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "assistant"
                ? renderAssistantMessage(
                    message.parts
                      .filter((p) => p.type === "text")
                      .map((p) => p.text)
                      .join(""),
                    onCitationClick,
                  )
                : message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </span>
                    ) : null,
                  )}
            </div>
          </div>
        ))}
        {error && (
          <div className="flex justify-center">
            <div className="text-sm text-destructive">
              Error: {error.message}
              <Button variant="link" size="sm" onClick={() => regenerate()}>
                Retry
              </Button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          name="message"
          placeholder="Ask about the bylaws..."
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isLoading}
          autoComplete="off"
        />
        {isLoading ? (
          <Button type="button" variant="outline" size="icon" onClick={() => stop()}>
            ■
          </Button>
        ) : (
          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}

function renderAssistantMessage(
  text: string,
  onCitationClick: (index: number) => void,
) {
  const CITATION_REGEX = /\[\[cite:\s*([^|]+)\|\s*([^\]]+)\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let citationIndex = 0;
  let match;

  while ((match = CITATION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }
    const section = match[1].trim();
    const idx = citationIndex;
    parts.push(
      <button
        key={`cite-${idx}`}
        type="button"
        onClick={() => onCitationClick(idx)}
        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors mx-0.5"
      >
        📖 {section}
      </button>,
    );
    citationIndex++;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {text.slice(lastIndex)}
      </span>,
    );
  }

  return parts;
}
