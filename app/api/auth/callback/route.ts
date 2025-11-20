// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user has a subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('plan_name, is_active')
        .eq('user_id', data.user.id)
        .maybeSingle();

      // Redirect based on subscription status
      if (subData && subData.is_active) {
        return NextResponse.redirect(`${origin}/${data.user.id}/nutrition`);
      } else {
        // No subscription -> go to pricing
        return NextResponse.redirect(`${origin}/pricestructure`);
      }
    }
  }

  // If there's an error or no code, redirect to signin
  return NextResponse.redirect(`${origin}/signin`);
}