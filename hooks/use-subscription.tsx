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
}

interface SubscriptionContextType {
  plan: Subscription | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: { 
    plan_name: "Free",
    is_active: false,
    remaining_uses: 1
  },
  loading: true,
  refreshSubscription: async () => {},
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlan] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setPlan({ plan_name: "Free", is_active: false, remaining_uses: 1 });

        setLoading(false);
        return;
      }

      const { data, error } = await supabase
  .from("user_subscriptions")
  .select("plan_name, is_active, valid_till, remaining_uses, used_meal_planner, used_analyze_food, used_get_recipe")
  .eq("user_id", user.id)
  .single();


      if (error || !data) {
        setPlan({ plan_name: "Free", is_active: false, remaining_uses: 1 });
        
      } else {
        setPlan({
          plan_name: data.plan_name || "Free",
          is_active: data.is_active ?? false,
          valid_till: data.valid_till ?? null,
          remaining_uses: data.remaining_uses ?? (data.plan_name === "Free" ? 1 : null),
          used_meal_planner: data.used_meal_planner ?? false,
          used_analyze_food: data.used_analyze_food ?? false,
          used_get_recipe: data.used_get_recipe ?? false,
        });
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setPlan({ plan_name: "Free", is_active: false, remaining_uses: 1 });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

  }, []);

  return (
    <SubscriptionContext.Provider value={{ plan, loading, refreshSubscription: fetchSubscription }}>

      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  return useContext(SubscriptionContext);
}
