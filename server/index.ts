import express, { type Request, type Response } from "express";
import { requireAdmin, requireUser } from "./auth";
import { reports } from "./reports";

const PORT = Number(process.env.PORT ?? 3001);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4";
const MAX_INPUT_CHARS = 20_000;

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set. Add it to .env (see .env.example).");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "1mb" }));

// Send one prompt to OpenAI, return the reply text.
const complete = async (prompt: string): Promise<string> => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content;
};

// Read a required, non-empty string field from the body.
const readText = (req: Request, field: string): string | null => {
  const value = req.body?.[field];
  if (typeof value !== "string" || !value.trim()) return null;
  if (value.length > MAX_INPUT_CHARS) return null;
  return value;
};

const handle =
  (field: string, toPrompt: (text: string) => string) =>
  async (req: Request, res: Response) => {
    const text = readText(req, field);
    if (text === null) {
      res
        .status(400)
        .json({ error: `"${field}" must be a non-empty string up to ${MAX_INPUT_CHARS} chars` });
      return;
    }
    try {
      res.json({ content: await complete(toPrompt(text)) });
    } catch (e) {
      console.error(e);
      res.status(502).json({ error: "AI request failed" });
    }
  };

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Everything below needs a signed-in user.
app.use("/api", requireUser);

app.get("/api/me", (req, res) => {
  res.json(req.user);
});

app.use("/api/reports", reports);

app.post("/api/draft", requireAdmin, handle("prompt", (p) => p));
app.post(
  "/api/summarize",
  requireAdmin,
  handle("content", (c) => `Summarize the following:\n\n${c}`)
);

app.listen(PORT, () => {
  console.log(`API server on http://localhost:${PORT}`);
});
