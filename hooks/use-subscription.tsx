// app/hooks/use-subscription.tsx
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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPlan(null);
        setHasSubscription(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("plan_name, is_active, valid_till, remaining_uses, used_meal_planner, used_analyze_food, used_get_recipe, last_used_analyze_food")
        .eq("user_id", user.id)
        .single();

      // FIXED: Don't set any default plan if no subscription exists
      if (error || !data) {
        console.log("No subscription found for user:", user.id);
        setPlan(null);
        setHasSubscription(false);
      } else {
        setPlan({
          plan_name: data.plan_name,
          is_active: data.is_active,
          valid_till: data.valid_till,
          remaining_uses: data.remaining_uses,
          used_meal_planner: data.used_meal_planner,
          used_analyze_food: data.used_analyze_food,
          used_get_recipe: data.used_get_recipe,
          last_used_analyze_food: data.last_used_analyze_food,
        });
        setHasSubscription(true);
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