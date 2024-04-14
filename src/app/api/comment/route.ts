import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

interface SentimentResponse {
  label: string;
  score: number;
};

export async function POST(request: NextRequest) {
  try {
    const { comment }: { comment: string} = await request.json();
    const { env } = getRequestContext() ?? { env: { Ai: {} } };
    const ai = env.AI;
    
    const messages = [
      { role: "system", content: `You are a highly intelligent and respectful large language model trained to moderate comments on a website. Your primary role is to ensure that all discussions remain civil, respectful, and free from harmful content. You are programmed to detect and address the following:
        - Hate speech and discriminatory language
        - Personal attacks and harassment
        - Explicit content and profanity
        - Spam and malicious links
  
        Remember, your goal is to support a safe and welcoming environment for all users to engage in meaningful conversations.
        Respond with json format: {"allow": true|false, "message": string}
        Moderate comment:`
      },
      { role: "user", content: comment },
    ];
    const result = await ai.run("@hf/thebloke/openhermes-2.5-mistral-7b-awq", { messages }) as { response: string };
    const jsonResult = JSON.parse(result.response) as { allow: boolean, message: string };

    const sentimentResponse: SentimentResponse[] = await env.AI.run(
      "@cf/huggingface/distilbert-sst-2-int8",
      {
        text: comment,
      }
    );
   
    let sentimentResult = { sentiment: "NEUTRAL" };

    if (jsonResult.allow === true) {
      const sentiment = sentimentResponse.reduce((prev, current) => {
        return (prev.score > current.score) ? prev : current
      });

      sentimentResult = {
        sentiment: sentiment.label,
      };
    }

    return Response.json({ ...jsonResult, ...sentimentResult }, { status: 200 })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
