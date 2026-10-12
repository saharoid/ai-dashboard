import { supabase } from "../lib/supabase";

/**
 * POST to our API and read a streamed plain-text reply.
 * onText gets the full text so far after each chunk. Resolves with the final text.
 */
export const streamPost = async (
  path: string,
  body: unknown,
  onText: (text: string) => void
): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error ?? `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  return text;
};
