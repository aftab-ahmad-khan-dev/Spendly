import Groq from 'groq-sdk';
import { env } from '../config/env.js';

let client = null;

export const getGroq = () => {
  if (!env.groq.apiKey) throw new Error('GROQ_API_KEY is not set');
  if (!client) client = new Groq({ apiKey: env.groq.apiKey });
  return client;
};

export const groqModel = () => env.groq.model;

export const chatCompletion = async ({ system, user, temperature = 0.2, json = false }) => {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: groqModel(),
    temperature,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return completion.choices?.[0]?.message?.content ?? '';
};
