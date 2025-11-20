"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      // Step 1: Get current session
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error || !sessionData.session) {
        router.replace("/signin");
        return;
      }

      const user = sessionData.session.user;
      const userId = user.id;

      // Step 2: Check subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("plan_name, is_active")
        .eq("user_id", userId)
        .maybeSingle();

      // Step 3: Redirect based on subscription status
      if (subData && subData.is_active) {
        router.replace(`/${userId}/nutrition`);
      } else {
        router.replace(`/pricestructure`);
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-muted-foreground">
        Verifying your email, please wait…
      </p>
    </div>
  );
}
