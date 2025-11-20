"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";

export default function LogoutButton() {
//   const router = useRouter();
//   const supabase = createClient();

//   const handleLogout = async () => {
//     // await supabase.auth.signOut();
//     // router.push("/signin"); // redirect after logout
//   };


   const router = useRouter();
  const {refreshSubscription} = useSubscription();
  const handleLogout = async () => {
    const supabase = createClient();
  
  // Clear subscription cache
  await refreshSubscription();
  
  // Sign out
  await supabase.auth.signOut();
  
  // Navigate to signin
  router.replace('/signin');
  };
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 mb-20 rounded-[5px] text-white bg-transparent transition"
    >
      Log out
    </button>
  );
}
