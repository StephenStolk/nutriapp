//hooks/use-subscription.tsx
'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface Subscription {
  plan_name: string;
  is_active: boolean;
  valid_till?: string | null;
  remaining_uses?: number | null;
  used_meal_planner?: boolean;
  used_analyze_food?: boolean;
  used_get_recipe?: boolean;
  last_used_analyze_food?: string | null;
}

interface SubscriptionContextType {
  plan: Subscription | null;
  loading: boolean;
  hasSubscription: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: null,
  loading: true,
  hasSubscription: false,
  refreshSubscription: async () => {},
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlan] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const supabase = createClient();

  const fetchSubscription = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setPlan(null);
      setHasSubscription(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single(); // Use single() instead of maybeSingle()

    if (error || !data) {
      setPlan(null);
      setHasSubscription(false);
    } else {
      setPlan(data);
      setHasSubscription(data.is_active);
    }
  } catch (err) {
    console.error("Error fetching subscription:", err);
    setPlan(null);
    setHasSubscription(false);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ plan, loading, hasSubscription, refreshSubscription: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  return useContext(SubscriptionContext);
}