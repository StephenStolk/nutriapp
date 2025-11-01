"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      
      const { data, error } = await supabase.auth.getSession();

      if (!error && data.session) {
        const userId = data.session.user.id;
        // Redirect
        router.replace(`/${userId}/nutrition`);

      } else {
        
        router.replace("/signin");
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
