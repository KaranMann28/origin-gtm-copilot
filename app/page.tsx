"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Why did Cursor acquire Graphite?",
  "What is Origin and who is it for?",
  "How do we position against competitors?",
];

function SourceChips({ files }: { files: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {files.map((file) => (
        <span
          key={file}
          className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-400"
        >
          {file}
        </span>
      ))}
    </div>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const sourcesPart = message.parts.find(
    (part) => part.type === "data-sources"
  );
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-zinc-100 ring-1 ring-zinc-800">
        {message.parts.map((part, i) =>
          part.type === "text" ? (
            <p key={i} className="whitespace-pre-wrap">
              {part.text}
            </p>
          ) : null
        )}
        {sourcesPart && <SourceChips files={sourcesPart.data.files} />}
      </div>
    </div>
  );
}

export default function Home() {
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <h1 className="text-base font-semibold tracking-tight">
          Origin GTM Copilot
        </h1>
        <p className="text-xs text-zinc-500">
          Grounded in the Cursor, Graphite, and Origin knowledge base
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 py-6">
          {messages.length === 0 && (
            <div className="mt-24 flex flex-col items-center gap-6 text-center">
              <div>
                <h2 className="text-lg font-medium text-zinc-200">
                  Ask about the GTM playbook
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Answers cite the knowledge files they came from.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white">
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <p key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : null
                  )}
                </div>
              </div>
            ) : (
              <AssistantMessage key={message.id} message={message} />
            )
          )}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-zinc-900 px-4 py-3 ring-1 ring-zinc-800">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mx-auto flex max-w-2xl gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Cursor, Graphite, or Origin..."
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
