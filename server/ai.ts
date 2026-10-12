import type { Response } from "express";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set. Add it to .env (see .env.example).");
  process.exit(1);
}

export const MAX_INPUT_CHARS = 20_000;

/**
 * Ask OpenAI for a reply and stream it to the client as plain text.
 * Resolves with the full text, or null if the stream did not finish
 * (client left or OpenAI dropped mid-way). Throws before anything is
 * written if OpenAI rejects the request, so callers can still send a status.
 */
export const streamCompletion = async (
  prompt: string,
  res: Response
): Promise<string | null> => {
  const abort = new AbortController();
  // Stop paying for tokens if the browser goes away.
  res.on("close", () => {
    if (!res.writableEnded) abort.abort();
  });

  const upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
    signal: abort.signal,
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error(`OpenAI ${upstream.status}: ${await upstream.text()}`);
  }

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let full = "";
  let done = false;
  let buffer = "";
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  try {
    while (!done) {
      const { value, done: ended } = await reader.read();
      if (ended) break;
      buffer += decoder.decode(value, { stream: true });

      // Server-sent events: one "data: {...}" per line.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          done = true;
          break;
        }
        const delta: string | undefined =
          JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          res.write(delta);
        }
      }
    }
  } catch (e) {
    if (!abort.signal.aborted) console.error("AI stream failed:", e);
    res.end();
    return null;
  }

  res.end();
  return done ? full : null;
};

// Shared guard for the AI routes: send 502 if OpenAI fails before streaming.
export const failBeforeStream = (res: Response, e: unknown) => {
  console.error(e);
  if (!res.headersSent) res.status(502).json({ error: "AI request failed" });
  else res.end();
};
