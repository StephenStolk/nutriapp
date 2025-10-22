'use client'
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, Session} from "@supabase/supabase-js";

interface UserContextType {
  userId: string | null;
  user: any | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  user: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let supabase: SupabaseClient;

    const setup = async () => {
      supabase = await createClient();
      const {data: {user}} = await supabase.auth.getUser();
      setUser(user ?? null);
      setLoading(false);

      const { data: listener} = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        listener.subscription.unsubscribe();
      }
    }

    setup();

  }, []);

  return (
    <>
     <UserContext.Provider value={{ userId: user?.id ?? null, user, loading }}>
      {children}
    </UserContext.Provider>
    </>
  );
};

export function useUser() {
  return useContext(UserContext);
}
