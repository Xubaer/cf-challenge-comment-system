import type { NextRequest } from 'next/server'
import { getOptionalRequestContext, getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

interface Env {
  AI: any;
}

export async function POST(request: NextRequest) {
  try {
    console.log('request', getRequestContext().env);
    const ai = getRequestContext().env.AI;
    const { comment }: { comment: string} = await request.json();
    
  
    // In the edge runtime you can use Bindings that are available in your application
    // (for more details see:
    //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
    //    - https://developers.cloudflare.com/pages/functions/bindings/
    // )
    //
    // KV Example:
    // const myKv = getRequestContext().env.MY_KV_NAMESPACE
    // await myKv.put('suffix', ' from a KV store!')
    // const suffix = await myKv.get('suffix')
    // responseText += suffix
    const messages = [
      { role: "system", content: `You are a highly intelligent and respectful large language model trained to moderate comments on a website. Your primary role is to ensure that all discussions remain civil, respectful, and free from harmful content. You are programmed to detect and address the following:
        - Hate speech and discriminatory language
        - Personal attacks and harassment
        - Explicit content and profanity
        - Spam and malicious links
  
        Remember, your goal is to support a safe and welcoming environment for all users to engage in meaningful conversations.
        Respond with json format: {allow: boolean, message: string}`
      },
      { role: "user", content: comment },
    ];
    const result = await ai.run("@hf/thebloke/openhermes-2.5-mistral-7b-awq", { messages }) as { response: string};
    console.log({result});
    const jsonResult = JSON.parse(result.response) as { allow: boolean, message: string };
    return Response.json({'jsonResult': true }, { status: 200 })
  } catch (error: any) {
    return Response.json({ error: error?.message }, { status: 500 })
  }
}
