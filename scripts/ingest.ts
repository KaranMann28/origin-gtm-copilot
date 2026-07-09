import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ path: ".env.local" });

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const OUTPUT_FILE = path.join(process.cwd(), "data", "embeddings.json");
const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_CHUNK_TOKENS = 800;
const OVERLAP_TOKENS = 100;
const BATCH_SIZE = 100;

interface EmbeddingRecord {
  id: string;
  source: string;
  text: string;
  embedding: number[];
}

// Rough approximation: ~4 characters per token for English text.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    if (currentTokens + paragraphTokens > MAX_CHUNK_TOKENS && current.length > 0) {
      chunks.push(current.join("\n\n"));

      // Carry trailing paragraphs (up to OVERLAP_TOKENS) into the next chunk.
      const overlap: string[] = [];
      let overlapTokens = 0;
      for (let i = current.length - 1; i >= 0; i--) {
        const tokens = estimateTokens(current[i]);
        if (overlapTokens + tokens > OVERLAP_TOKENS) break;
        overlap.unshift(current[i]);
        overlapTokens += tokens;
      }
      current = overlap;
      currentTokens = overlapTokens;
    }

    current.push(paragraph);
    currentTokens += paragraphTokens;
  }

  if (current.length > 0) {
    chunks.push(current.join("\n\n"));
  }

  return chunks;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-your-key-here") {
    console.error(
      "Error: OPENAI_API_KEY is missing or still the placeholder. Set it in .env.local."
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (files.length === 0) {
    console.error(`No .md files found in ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} markdown file(s) in knowledge/`);

  const pending: { id: string; source: string; text: string }[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf-8");
    const chunks = chunkText(content);
    const base = path.basename(file, ".md");
    chunks.forEach((text, i) => {
      pending.push({ id: `${base}-${i}`, source: file, text });
    });
    console.log(`  ${file}: ${chunks.length} chunk(s)`);
  }

  console.log(`Embedding ${pending.length} chunk(s) with ${EMBEDDING_MODEL}...`);

  const openai = new OpenAI({ apiKey });
  const records: EmbeddingRecord[] = [];

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((c) => c.text),
    });
    response.data.forEach((item, j) => {
      records.push({ ...batch[j], embedding: item.embedding });
    });
    console.log(`  Embedded ${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length}`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(records));
  console.log(`Wrote ${records.length} record(s) to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
