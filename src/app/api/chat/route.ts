import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, model, provider } = await req.json();

    let apiKey = '';
    let endpoint = '';

    // Determine API Key and Endpoint based on Provider
    switch (provider) {
      case 'openrouter':
        apiKey = process.env.OPENROUTER_API_KEY || '';
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        break;
      case 'zai':
        apiKey = process.env.ZAI_API_KEY || '';
        endpoint = 'https://api.z.ai/api/paas/v4/chat/completions';
        break;
      case 'minimax':
        apiKey = process.env.MINIMAX_API_KEY || '';
        endpoint = 'https://api.minimax.io/v1/chat/completions';
        break;
      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: `API Key for ${provider} not found in environment` }, { status: 500 });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://glitchproduct.com', // Optional for OpenRouter
        'X-Title': 'GlitchProduct Marking Tool', // Optional for OpenRouter
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
