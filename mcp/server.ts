import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Resolve paths relative to this file so the server works from any cwd.
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// quiet: true keeps dotenv from printing to stdout, which would corrupt
// the JSON-RPC stream on stdio.
dotenv.config({ path: path.join(ROOT, ".env.local"), quiet: true });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Error: OPENAI_API_KEY is missing. Set it in .env.local.");
  process.exit(1);
}

interface EmbeddingRecord {
  id: string;
  source: string;
  text: string;
  embedding: number[];
}

let cachedRecords: EmbeddingRecord[] | null = null;

function loadEmbeddings(): EmbeddingRecord[] {
  if (!cachedRecords) {
    const file = path.join(ROOT, "data", "embeddings.json");
    cachedRecords = JSON.parse(fs.readFileSync(file, "utf-8"));
  }
  return cachedRecords!;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const openai = new OpenAI({ apiKey });

const server = new McpServer({ name: "origin-kb", version: "1.0.0" });

server.registerTool(
  "search_origin_kb",
  {
    description:
      "Search the Origin GTM knowledge base (Cursor, Graphite, and Origin) and return the top 5 most relevant chunks with their source filenames and similarity scores.",
    inputSchema: {
      query: z.string().describe("The search query"),
    },
  },
  async ({ query }) => {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;

    const results = loadEmbeddings()
      .map((record) => ({
        source: record.source,
        score: Number(cosineSimilarity(queryEmbedding, record.embedding).toFixed(4)),
        text: record.text,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("origin-kb MCP server running on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
