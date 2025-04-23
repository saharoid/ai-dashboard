import axios from 'axios';

const apiKey = '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';

export const generateDraft = async (prompt: string) => {
    console.log(apiKey, 'api key')
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data.choices[0].message.content;
};

export const summarizeContent = async (content: string) => {
  return generateDraft(`Summarize the following:\n\n${content}`);
};
