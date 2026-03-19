"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { env } from "@bylaw-chat/env/web";

import { Button } from "./ui/button";

const convexSiteUrl = env.NEXT_PUBLIC_CONVEX_URL.replace(".cloud", ".site");

export default function ChatPanel() {
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: convexSiteUrl + "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              {message.parts.map((part, i) =>
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
          ref={inputRef}
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
