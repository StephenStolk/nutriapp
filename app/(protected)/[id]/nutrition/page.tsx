"use client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NutritionApp from "@/components/nutrition-app";
import { useSubscription } from '@/hooks/use-subscription';
import { useUser } from '@/hooks/use-user';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function Nutrition({ params} : PageProps) {
    
    const supabase = createClient();
//     const { data: {user}, error
// } = await supabase.auth.getUser();

 const router = useRouter();
  const { hasSubscription, loading: subLoading } = useSubscription();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading || subLoading) return;
    
    if (!user) {
      router.push("/signin");
      return;
    }

    if (!hasSubscription) {
      router.push("/pricestructure");
    }
  }, [user, hasSubscription, userLoading, subLoading, router]);

  if (userLoading || subLoading) {
    return <div>Loading...</div>;
  }

  if (!hasSubscription) {
    return null; // Will redirect
  }

if(!user) {
    redirect('/signin');
}

if (user.id !== params.id) {
    redirect(`/${user.id}/nutrition`);
  }

    return(<>
    <NutritionApp />
    </>)
}