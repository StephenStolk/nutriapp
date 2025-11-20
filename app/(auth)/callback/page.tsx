"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for Supabase to finish restoring the session
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        // Give Supabase time to hydrate session from cookies
        const {
          data: refreshed,
          error: refreshError,
        } = await supabase.auth.getSession();

        if (!refreshed.session) {
          router.replace("/signin");
          return;
        }
      }

      const user = sessionData.session?.user;
      if (!user) {
        router.replace("/signin");
        return;
      }

      // IMPORTANT: NO SUBSCRIPTION CHECK HERE
      // Only send user to pricing first-time

      router.replace("/pricestructure"); 
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <p className="text-sm opacity-70">Signing you in…</p>
    </div>
  );
}
