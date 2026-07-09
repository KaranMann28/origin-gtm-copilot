# Origin GTM Copilot

A RAG chatbot grounded in a knowledge base covering Cursor, Graphite, and Origin — the acquisition, the product fundamentals, the launch, the competitive landscape. Built as interview prep for the GTM Emerging Products role: the fastest way to internalize the story was to build on the exact stack the team sells.

## How it was built

- Agent-first in Cursor: every file in this repo was written by Cursor's agent, from the ingestion script to the chat UI.
- Shipped as a 4-PR stack via Graphite (`gt`): knowledge base → ingestion/embeddings → RAG chat API + UI → MCP server. Bugbot reviewed each PR before the stack merged.
- Deployed on Vercel.

## Architecture

| Piece | What it does |
| --- | --- |
| `scripts/ingest.ts` | Reads `knowledge/*.md`, chunks on paragraph boundaries (~800 tokens, 100 overlap), embeds with `text-embedding-3-small`, writes `data/embeddings.json` |
| `data/embeddings.json` | The entire vector store. No database — an array of `{ id, source, text, embedding }` |
| `app/api/chat/route.ts` | Embeds the latest user message, cosine-ranks all chunks, feeds the top 5 to `gpt-4o-mini`, streams the answer with source attribution |
| `mcp/server.ts` | Custom MCP server exposing `search_origin_kb` over stdio, so Cursor itself can query the knowledge base |

## Stack

Next.js 16 (App Router) · Vercel AI SDK v7 · OpenAI API · Graphite CLI · MCP TypeScript SDK

## Run locally

```bash
npm install
echo OPENAI_API_KEY=sk-... > .env.local
npm run ingest   # builds data/embeddings.json
npm run dev      # chat at http://localhost:3000
```

## MCP setup

Run the server standalone with `npm run mcp`, or register it in Cursor via `.cursor/mcp.json`. On Windows, wrap the command in `cmd /c`:

```json
{
  "mcpServers": {
    "origin-kb": {
      "command": "cmd",
      "args": ["/c", "npx", "tsx", "mcp/server.ts"]
    }
  }
}
```

Cursor will then expose a `search_origin_kb` tool that returns the top 5 matching chunks with source filenames and similarity scores.
