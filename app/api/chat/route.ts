import fs from "node:fs";
import path from "node:path";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  cosineSimilarity,
  createUIMessageStream,
  createUIMessageStreamResponse,
  embed,
  streamText,
  toUIMessageStream,
} from "ai";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 30;

const SYSTEM_PROMPT =
  "You are the Origin GTM Copilot. Answer using only the provided context about Cursor, Graphite, and Origin. Mention which source file each claim came from. If the context doesn't cover the question, say so.";

interface EmbeddingRecord {
  id: string;
  source: string;
  text: string;
  embedding: number[];
}

let cachedRecords: EmbeddingRecord[] | null = null;

function loadEmbeddings(): EmbeddingRecord[] {
  if (!cachedRecords) {
    const file = path.join(process.cwd(), "data", "embeddings.json");
    cachedRecords = JSON.parse(fs.readFileSync(file, "utf-8"));
  }
  return cachedRecords!;
}

function latestUserText(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "";
  return lastUser.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const query = latestUserText(messages);

  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  const topChunks = loadEmbeddings()
    .map((record) => ({
      record,
      score: cosineSimilarity(queryEmbedding, record.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = topChunks
    .map(({ record }) => `[source: ${record.source}]\n${record.text}`)
    .join("\n\n---\n\n");

  const sources = [...new Set(topChunks.map(({ record }) => record.source))];

  const stream = createUIMessageStream<ChatMessage>({
    execute: async ({ writer }) => {
      writer.write({
        type: "data-sources",
        data: { files: sources },
      });

      const result = streamText({
        model: openai("gpt-4o-mini"),
        instructions: `${SYSTEM_PROMPT}\n\nContext:\n\n${context}`,
        messages: await convertToModelMessages(messages),
      });

      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
