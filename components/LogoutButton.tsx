"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect after logout
    router.replace("/signin");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 mb-20 rounded-sm text-white bg-transparent transition flex items-center justify-center mx-auto"
    >
      Log out
    </button>
  );
}
