"use client";

import { useChat } from "@ai-sdk/react";
import { api } from "@bylaw-chat/backend/convex/_generated/api";
import { TextStreamChatTransport } from "ai";
import { useMutation } from "convex/react";
import { SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import Markdown from "react-markdown";

import type { DocumentId } from "@/lib/section-pages";

import { Button } from "./ui/button";

interface ChatPanelProps {
  onCitationClick?: (section: string, document: DocumentId) => void;
}

export default function ChatPanel({ onCitationClick }: ChatPanelProps) {
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport,
  });

  const saveChatMessage = useMutation(api.chatMessages.save);
  const prevStatusRef = useRef(status);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save to Convex when streaming completes
  useEffect(() => {
    if (prevStatusRef.current === "streaming" && status === "ready") {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastUser && lastAssistant) {
        const userText = lastUser.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("");
        const assistantText = lastAssistant.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("");
        saveChatMessage({ userMessage: userText, assistantMessage: assistantText });
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, saveChatMessage]);

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
              Ask a question about the bylaws or offering plan
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
          placeholder="Ask about the bylaws or offering plan..."
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

const VALID_DOCUMENTS = new Set(["bylaws", "offering-plan"]);

function renderAssistantMessage(
  text: string,
  onCitationClick?: (section: string, document: DocumentId) => void,
) {
  // Match both 3-part [[cite: doc | section | text]] and 2-part [[cite: section | text]]
  const CITATION_REGEX = /\[\[cite:\s*([^|\]]+)\|\s*([^|\]]+)(?:\|\s*([^\]]+))?\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = CITATION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <div key={`text-${lastIndex}`} className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown>{text.slice(lastIndex, match.index)}</Markdown>
        </div>,
      );
    }

    let document: DocumentId;
    let section: string;
    let quotedText: string;

    if (match[3]) {
      // 3-part format: doc | section | text
      const doc = match[1].trim().toLowerCase();
      document = VALID_DOCUMENTS.has(doc) ? (doc as DocumentId) : "bylaws";
      section = match[2].trim();
      quotedText = match[3].trim();
    } else {
      // 2-part format: section | text (default to bylaws)
      document = "bylaws";
      section = match[1].trim();
      quotedText = match[2].trim();
    }

    const icon = document === "offering-plan" ? "📋 Offering Plan" : "📖 Bylaws";

    parts.push(
      <button
        key={`cite-${lastIndex}-${match.index}`}
        type="button"
        onClick={() => onCitationClick?.(section, document)}
        className="my-1.5 block w-full cursor-pointer rounded border-l-2 border-primary/40 bg-primary/5 px-2.5 py-1.5 text-left hover:bg-primary/10 transition-colors"
      >
        <span className="text-xs font-medium text-primary">{icon}: {section}</span>
        <span className="mt-0.5 block text-xs italic text-muted-foreground">
          &ldquo;{quotedText}&rdquo;
        </span>
      </button>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <div key={`text-${lastIndex}`} className="prose prose-sm dark:prose-invert max-w-none">
        <Markdown>{text.slice(lastIndex)}</Markdown>
      </div>,
    );
  }

  return parts;
}
