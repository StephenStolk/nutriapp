"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const processCallback = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error || !sessionData.session) {
        router.replace("/signin");
        return;
      }

      const user = sessionData.session.user;
      const userId = user.id;

      // Check subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("plan_name, is_active")
        .eq("user_id", userId)
        .maybeSingle();

      // Redirect logic
      if (subData && subData.is_active) {
        router.replace(`/${userId}/nutrition`);
      } else {
        router.replace("/pricestructure");
      }
    };

    processCallback();
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-muted-foreground">
        Logging you in, please wait…
      </p>
    </div>
  );
}
