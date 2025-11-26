import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Gather all psychological data from the week
    const { data: emotions } = await supabase
      .from('emotion_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    const { data: cravings } = await supabase
      .from('craving_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    const { data: hungerChecks } = await supabase
      .from('hunger_checks_v2')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    const { data: microWins } = await supabase
      .from('micro_wins')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    // Prepare data for AI
    const summaryData = {
      emotions: emotions?.map(e => e.ai_emotion_tag).filter(Boolean) || [],
      triggers: emotions?.map(e => e.ai_trigger_tag).filter(Boolean) || [],
      cravings: cravings?.map(c => c.craving_type) || [],
      emotionalHunger: hungerChecks?.filter(h => h.ai_hunger_type === 'emotional').length || 0,
      totalHungerChecks: hungerChecks?.length || 0,
      wins: microWins?.length || 0
    };

    // Generate AI summary
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a supportive nutrition psychologist. Create a brief, encouraging weekly summary based on user's emotional eating data. Focus on patterns, wins, and gentle suggestions. Keep it under 150 words. Return JSON with: { "summary_text": "...", "top_emotions": ["..."], "top_triggers": ["..."], "wins": ["..."], "patterns": ["..."] }`
        },
        {
          role: 'user',
          content: JSON.stringify(summaryData)
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const summary = JSON.parse(completion.choices[0].message.content || '{}');

    // Save summary
    await supabase.from('weekly_summary').upsert({
      user_id: userId,
      week_start: weekStartStr,
      summary_text: summary.summary_text,
      top_emotions: summary.top_emotions,
      top_triggers: summary.top_triggers,
      wins: summary.wins,
      patterns: summary.patterns
    });

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Weekly summary error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate summary' 
    }, { status: 500 });
  }
}
// ```

// ## 8. Add Environment Variable

// **File: `.env.local`**
// ```
// OPENAI_API_KEY=your_openai_api_key_here