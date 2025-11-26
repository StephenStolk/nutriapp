import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const currentHour = new Date().getHours();
    const today = new Date().getDay();
    
    // Get historical triggers for this day/hour
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: triggers } = await supabase
      .from('trigger_logs')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: cravings } = await supabase
      .from('craving_logs')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Count triggers in this hour window
    const allEvents = [...(triggers || []), ...(cravings || [])];
    let riskCount = 0;

    allEvents.forEach(event => {
      const date = new Date(event.created_at);
      if (date.getDay() === today && date.getHours() === currentHour) {
        riskCount++;
      }
    });

    const riskPercentage = Math.min(Math.round((riskCount / 30) * 100), 100);

    return NextResponse.json({
      success: true,
      shouldNudge: riskPercentage > 50,
      riskPercentage,
      message: riskPercentage > 50 
        ? "You're entering your stress window. Take 3 deep breaths before reaching for food."
        : null
    });
  } catch (error) {
    console.error('Risk check error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}