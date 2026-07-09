"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Why did Cursor acquire Graphite?",
  "What is Origin and who is it for?",
  "How do we position against competitors?",
];

/* Rail geometry: the axis rail is centered 16px (sm: 24px) from the column's
   left edge; message content clears it via pl-10 (sm: pl-14). */
const RAIL_ANCHOR = "left-4 sm:left-6";
const ROW_INDENT = "pl-10 sm:pl-14";

/* Inline mirror of public/logo.svg so the center dot can carry the pulse
   animation; the ring gets an ink fill to mask the axis rail behind it. */
function OriginMark({
  size,
  pulse = false,
}: {
  size: number;
  pulse?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 3v17M32 44v17M3 32h17M44 32h17"
        stroke="#8FA3BB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="32"
        cy="32"
        r="12"
        fill="var(--ink)"
        stroke="#E9F0F8"
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="32"
        r="4.5"
        fill="var(--accent)"
        className={pulse ? "animate-origin-pulse" : undefined}
      />
    </svg>
  );
}

function AxisNode({ kind }: { kind: "user" | "assistant" | "streaming" }) {
  const base = `absolute ${RAIL_ANCHOR} top-2 h-2 w-2 -translate-x-1/2 rounded-full`;
  if (kind === "user") {
    return (
      <span
        className={`${base} border-[1.5px] border-[var(--muted)] bg-[var(--ink)]`}
      />
    );
  }
  const glow = "bg-[var(--accent)] shadow-[0_0_8px_rgba(92,200,255,0.7)]";
  return (
    <span
      className={`${base} ${glow} ${kind === "streaming" ? "animate-node-pulse" : ""}`}
    />
  );
}

function AxisTick() {
  return (
    <span
      className={`absolute ${RAIL_ANCHOR} top-[11px] h-px w-4 bg-[var(--line)]`}
    />
  );
}

function SourceChips({ files }: { files: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {files.map((file) => (
        <span
          key={file}
          className="border border-[rgba(229,181,102,0.3)] px-2 py-0.5 font-mono text-[11px] leading-relaxed text-[var(--ref)]"
        >
          refs/knowledge/{file.replace(/\.md$/, "")}
        </span>
      ))}
    </div>
  );
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className={`relative ${ROW_INDENT}`}>
      <AxisNode kind="user" />
      <AxisTick />
      <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--muted)]">
        <span className="text-[var(--accent)]">❯ </span>
        {message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n")}
      </p>
    </div>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const sourcesPart = message.parts.find(
    (part) => part.type === "data-sources"
  );
  return (
    <div className={`relative ${ROW_INDENT}`}>
      <AxisNode kind="assistant" />
      <AxisTick />
      <div className="border border-[var(--line)] border-l-2 border-l-[var(--accent)] bg-[var(--panel)] px-5 py-4 sm:px-6 sm:py-5">
        {message.parts.map((part, i) =>
          part.type === "text" ? (
            <p
              key={i}
              className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--text)]"
            >
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
    <div className="flex h-dvh flex-col">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6">
          <div className="inline-flex items-center gap-3 border border-[var(--line)] bg-[var(--panel)]/60 px-3.5 py-2.5 sm:px-4">
            <Image
              src="/logo.svg"
              width={28}
              height={28}
              alt="Origin GTM Copilot logo"
            />
            <div>
              <h1 className="font-heading text-lg leading-tight text-[var(--text)]">
                Origin GTM Copilot
              </h1>
              <p className="font-mono text-[11px] text-[var(--muted)]">
                remote: origin/main · 6 sources · gpt-4o-mini
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Column wrapper anchors the origin logo at the rail/header intersection,
          outside the scroll container so it never clips. */}
      <div className="relative mx-auto min-h-0 w-full max-w-3xl flex-1">
        <div
          className={`absolute ${RAIL_ANCHOR} top-0 z-10 -translate-x-1/2 -translate-y-1/2`}
        >
          <OriginMark size={24} />
        </div>

        <main className="h-full overflow-y-auto">
          <div className="relative flex flex-col gap-5 px-3 py-8 sm:px-6">
            {/* Axis rail */}
            <div
              className={`absolute ${RAIL_ANCHOR} bottom-0 top-0 w-[1.5px] -translate-x-1/2 bg-[var(--line)]`}
            />

            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-7 pt-20 text-center">
                <OriginMark size={64} pulse />
                <h2 className="font-heading text-2xl text-[var(--text)]">
                  Ask about the Origin playbook
                </h2>
                <div className="flex flex-col items-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="border border-[var(--line)] px-4 py-2 font-mono text-xs text-[var(--muted)] transition-colors hover:border-[rgba(92,200,255,0.4)] hover:text-[var(--text)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            )}

            {status === "submitted" && (
              <div className={`relative h-4 ${ROW_INDENT}`}>
                <AxisNode kind="streaming" />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </main>
      </div>

      <footer className="border-t border-[var(--line)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-4 sm:gap-3 sm:px-6"
        >
          <label
            htmlFor="chat-input"
            className="shrink-0 font-mono text-sm text-[var(--accent)]"
          >
            origin ❯
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Cursor, Graphite, or Origin..."
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 font-mono text-sm text-[var(--text)] outline-none placeholder:text-[rgba(143,163,187,0.55)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="border border-[rgba(92,200,255,0.3)] bg-[var(--accent-dim)] px-4 py-1.5 font-mono text-xs text-[var(--accent)] transition-colors hover:bg-[rgba(92,200,255,0.22)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
