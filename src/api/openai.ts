import { api } from "./client";

// Calls go to our own server (server/index.ts). The OpenAI key stays there.

export const generateDraft = async (prompt: string): Promise<string> => {
  const res = await api.post("/draft", { prompt });
  return res.data.content;
};

export const summarizeContent = async (content: string): Promise<string> => {
  const res = await api.post("/summarize", { content });
  return res.data.content;
};
