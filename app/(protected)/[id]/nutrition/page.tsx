"use client";
import { redirect } from "next/navigation";
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
    
     const router = useRouter();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const supabase = createClient();
//     const { data: {user}, error
// } = await supabase.auth.getUser();

  const { hasSubscription, loading: subLoading } = useSubscription();
  const { user, userId, loading: userLoading } = useUser();

//   useEffect(() => {
//     if (userLoading || subLoading) return;
    
//     if (!user) {
//       router.push("/signin");
//       return;
//     }

//     if (!hasSubscription) {
//       router.push("/pricestructure");
//     }
//   }, [user, hasSubscription, userLoading, subLoading, router]);


 useEffect(() => {
    const verifyAccess = async () => {
      // Wait for user to load
      if (userLoading) return;

      // No user - redirect to signin
      if (!userId) {
        router.replace('/signin');
        return;
      }

      // Check subscription
      try {
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('is_active')
          .eq('user_id', userId)
          .maybeSingle();

        if (!subData || !subData.is_active) {
          // No active subscription - redirect to pricing
          router.replace('/pricestructure');
          return;
        }

        // Has valid subscription
        setHasValidSubscription(true);
      } catch (error) {
        console.error('Error checking subscription:', error);
        router.replace('/pricestructure');
      } finally {
        setCheckingSubscription(false);
      }
    };

    verifyAccess();
  }, [userId, userLoading, router, supabase]);


if (userLoading || checkingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasSubscription) {
    return null; // Will redirect
  }

// if(!user) {
//     redirect('/signin');
// }

// if (user.id !== params.id) {
//     redirect(`/${user.id}/nutrition`);
//   }

    return(<>
    <NutritionApp />
    </>)
}