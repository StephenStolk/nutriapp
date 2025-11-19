"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("Verifying email…");

  useEffect(() => {
    const checkVerification = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user?.email_confirmed_at) {
        setStatus("Your email has been verified!");
      } else {
        setStatus("Verification failed or link expired.");
      }
    };

    checkVerification();
  }, []);

  const goToSignin = () => {
    // If coming from payment flow → return user to pricing
    if (searchParams.get("from") === "payment") {
      router.push("/pricing?verified=true");
      return;
    }

    router.push("/signin");
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl text-center border border-white/20">
        
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-gray-300 mb-8">
          You can now continue.
        </p>

        <div className="flex gap-4">
          <Button
            className="bg-white text-black px-6 py-2 rounded-md"
            onClick={goToSignin}
          >
            Go to Sign In
          </Button>

          <Button
            className="border border-white/40 text-white bg-transparent px-6 py-2 rounded-md"
            onClick={closeTab}
          >
            Close Tab
          </Button>
        </div>
      </div>
    </div>
  );
}
