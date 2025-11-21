import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    const today = new Date().toISOString();

    // Find all expired Pro Plan subscriptions
    const { data: expiredSubs, error } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan_name')
      .eq('plan_name', 'Pro Plan')
      .eq('is_active', true)
      .lt('valid_till', today);

    if (error) throw error;

    if (expiredSubs && expiredSubs.length > 0) {
      // Deactivate expired subscriptions
      const userIds = expiredSubs.map(sub => sub.user_id);
      
      await supabase
        .from('user_subscriptions')
        .update({ is_active: false })
        .in('user_id', userIds);

      return NextResponse.json({ 
        success: true, 
        deactivated: expiredSubs.length 
      });
    }

    return NextResponse.json({ 
      success: true, 
      deactivated: 0 
    });
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check expired subscriptions' 
    }, { status: 500 });
  }
}