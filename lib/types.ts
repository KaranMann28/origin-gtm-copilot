import type { UIMessage } from "ai";

export type ChatMessage = UIMessage<never, { sources: { files: string[] } }>;
