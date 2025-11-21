//app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      if (data.user) {
        // Check subscription
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('is_active')
          .eq('user_id', data.user.id)
          .maybeSingle();

        // Redirect based on subscription
        if (subData && subData.is_active) {
          return NextResponse.redirect(`${origin}/${data.user.id}/nutrition`);
        } else {
          return NextResponse.redirect(`${origin}/pricestructure`);
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/signin`);
}