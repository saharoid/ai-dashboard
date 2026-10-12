import axios from "axios";

// Calls go to our own server (server/index.ts). The OpenAI key stays there.

export const generateDraft = async (prompt: string): Promise<string> => {
  const res = await axios.post("/api/draft", { prompt });
  return res.data.content;
};

export const summarizeContent = async (content: string): Promise<string> => {
  const res = await axios.post("/api/summarize", { content });
  return res.data.content;
};
