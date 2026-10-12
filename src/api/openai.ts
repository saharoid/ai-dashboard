import { marked } from "marked";
import { streamPost } from "./stream";

// Calls go to our own server (server/). The OpenAI key stays there.
// Replies stream in as Markdown; we keep HTML, like the editor does.

export const markdownToHtml = (markdown: string): string =>
  marked.parse(markdown, { async: false });

export const streamDraft = (
  prompt: string,
  onText: (text: string) => void
): Promise<string> => streamPost("/draft", { prompt }, onText);

export const streamSummary = (
  reportId: string,
  onText: (text: string) => void
): Promise<string> =>
  streamPost(`/reports/${reportId}/summarize`, {}, onText);
