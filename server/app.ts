import express from "express";
import { failBeforeStream, MAX_INPUT_CHARS, streamCompletion } from "./ai";
import { requireAdmin, requireUser } from "./auth";
import { reports } from "./reports";

export const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Everything below needs a signed-in user.
app.use("/api", requireUser);

app.get("/api/me", (req, res) => {
  res.json(req.user);
});

app.use("/api/reports", reports);

// Stream a new draft as Markdown. The client turns it into a report.
app.post("/api/draft", requireAdmin, async (req, res) => {
  const prompt = req.body?.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_INPUT_CHARS) {
    res
      .status(400)
      .json({ error: `"prompt" must be a non-empty string up to ${MAX_INPUT_CHARS} chars` });
    return;
  }
  try {
    await streamCompletion(prompt, res);
  } catch (e) {
    failBeforeStream(res, e);
  }
});
