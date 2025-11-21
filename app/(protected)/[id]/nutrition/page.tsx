"use client";


// import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NutritionApp from "@/components/nutrition-app";
import { useSubscription } from '@/hooks/use-subscription';
import { useUser } from '@/hooks/use-user';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function Nutrition({ params} : PageProps) {
    
    const { userId, loading: userLoading } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const supabase = createClient();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    const verifyAccess = async () => {
      // Wait for user to load
      if (userLoading) return;

      // No user - redirect to signin
      if (!userId) {
        window.location.href = '/signin';
        return;
      }

      try {
        // Check subscription
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('is_active')
          .eq('user_id', userId)
          .maybeSingle();

        if (!subData || !subData.is_active) {
          // No active subscription - redirect to pricing
          window.location.href = '/pricestructure';
          return;
        }

        // Has valid subscription
        setHasAccess(true);
      } catch (error) {
        console.error('Error verifying access:', error);
        window.location.href = '/pricestructure';
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [userId, userLoading, supabase]);

  useEffect(() => {
  // Check for expired subscriptions on dashboard load
  const checkExpiredSubscriptions = async () => {
    if (!userId) return;
    
    try {
      await fetch('/api/check-expired-subscriptions', { method: 'POST' });
      // Refresh subscription status after check
      await refreshSubscription();
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  };

  checkExpiredSubscriptions();
}, [userId]);

  // Show loading while checking
  if (userLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if no access
  if (!hasAccess) {
    return null;
  }

    return(<>
    <NutritionApp />
    </>)
}