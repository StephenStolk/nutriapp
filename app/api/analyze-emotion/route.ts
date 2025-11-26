import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { emotionText, type } = await request.json();

    if (!emotionText) {
      return NextResponse.json({ error: 'Emotion text is required' }, { status: 400 });
    }

    const systemPrompt = type === 'hunger' 
      ? `You are a nutrition psychology expert. Analyze if the described hunger is physical or emotional. Respond in JSON format with: 
         { "hunger_type": "physical|emotional|mixed", "emotion": "primary emotion", "trigger": "identified trigger", "sentiment": -1 to 1, "intensity": 1-10, "suggestion": "brief grounding suggestion" }`
      : `You are a nutrition psychology expert. Analyze the emotional state and food triggers. Respond in JSON format with:
         { "emotion": "primary emotion label", "trigger": "trigger category", "sentiment": -1 to 1, "intensity": 1-10 }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: emotionText }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze emotion' 
    }, { status: 500 });
  }
}