"use client";

import { useChat } from "@ai-sdk/react";
import { api } from "@bylaw-chat/backend/convex/_generated/api";
import { TextStreamChatTransport } from "ai";
import { useMutation } from "convex/react";
import { SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";

import type { DocumentId } from "@/lib/section-pages";

import { Button } from "./ui/button";

const STARTER_QUESTIONS = [
  "Can I sublet my unit?",
  "Are pets allowed?",
  "How are common charges decided?",
  "What renovations need board approval?",
];

interface ChatPanelProps {
  onCitationClick?: (section: string, document: DocumentId, quotedText?: string) => void;
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Smooth-scrolling on every streamed chunk stutters on iOS; jump instantly while streaming.
    messagesEndRef.current?.scrollIntoView({
      behavior: status === "streaming" ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, status]);

  // Auto-grow the textarea up to a few lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

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

  const isLoading = status === "submitted" || status === "streaming";

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends (the iOS keyboard shows "send"); Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 md:p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground text-sm">
              Ask a question about the bylaws, offering plan, or rules
            </p>
            <div className="flex max-w-sm flex-wrap justify-center gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="min-h-10 rounded-full border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted touch-manipulation"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[85%] rounded-lg px-3 py-2 text-[15px] md:text-sm break-words ${
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
      <form onSubmit={handleSubmit} className="border-t p-2 flex items-end gap-2 md:p-4">
        {/* 16px text on mobile prevents iOS Safari from zooming on focus. Never disabled,
            so the keyboard stays open while a response streams. */}
        <textarea
          ref={inputRef}
          name="message"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          aria-label="Message"
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2.5 text-base leading-6 md:text-sm md:leading-5 focus:outline-none focus:ring-2 focus:ring-ring"
          autoComplete="off"
          enterKeyHint="send"
        />
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 md:size-9"
            onClick={() => stop()}
            aria-label="Stop"
          >
            ■
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="size-11 md:size-9"
            disabled={!input.trim()}
            aria-label="Send"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}

const VALID_DOCUMENTS = new Set(["bylaws", "offering-plan", "rules"]);

function renderAssistantMessage(
  text: string,
  onCitationClick?: (section: string, document: DocumentId, quotedText?: string) => void,
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

    const icon = document === "offering-plan" ? "📋 Offering Plan" : document === "rules" ? "📜 Rules" : "📖 Bylaws";

    parts.push(
      <button
        key={`cite-${lastIndex}-${match.index}`}
        type="button"
        onClick={() => onCitationClick?.(section, document, quotedText)}
        className="my-1.5 block w-full cursor-pointer rounded border-l-2 border-primary/40 bg-primary/5 px-2.5 py-2 text-left hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation"
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
