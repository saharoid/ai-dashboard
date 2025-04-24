import axios from "axios";

const apiKey = '';

export const generateDraft = async (prompt: string) => {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
};

export const summarizeContent = async (content: string) => {
  return generateDraft(`Summarize the following:\n\n${content}`);
};
