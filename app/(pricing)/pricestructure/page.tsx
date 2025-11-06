"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";

export default function Pricing() {
  const [load, setLoad] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [price, setPrice] = useState(199); // default INR price
  const [country, setCountry] = useState<string>("India");

  const [plan, setPlan] = useState<{
    plan: String;
    is_active: boolean;
    remaining_uses: Number | null;
  }>({ plan: "Free", is_active: false, remaining_uses: 1 });

  const { refreshSubscription } = useSubscription();
  const router = useRouter();
  const { user, userId, loading } = useUser();
  const supabase = createClient();

  useEffect(() => {
    const fetchGeo = async () => {

      try {
        const res = await fetch("https://ipapi.co/json/");

        const data = await res.json();

        setCountry(data.country_name || "India");
        setCurrency(data.currency || "INR");

        switch (data.currency) {
          case "USD":
            setSymbol("$");
            setPrice(3);
            break;
          case "EUR":
            setSymbol("€");
            setPrice(2.8);
            break;
          case "GBP":
            setSymbol("£");
            setPrice(2.5);
            break;
          case "INR":
            setSymbol("₹");
            setPrice(199);
            break;
          default:
            setSymbol("$");
            setPrice(3);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchGeo();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/check-subscription");
        const data = await res.json();
        setPlan(data);

        if (data.is_active && data.plan !== "Free") {
          router.push(`/${userId}/nutrition`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSubscription();
  }, [user]);

  const handlePayment = async () => {
    try {
      setLoad(true);
      setMessage("");

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, currency }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to create subscription");

      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: data.currency,
        name: "Nutrition Pro Plan",
        description: "Premium quick meal features",
        order_id: data.order_id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setMessage("Payment successful! You are now a Pro user.");
            setPlan({ plan: "Pro Plan", is_active: true, remaining_uses: null });
            await refreshSubscription();
            router.push(`/${userId}/nutrition`);
          } else {
            setMessage("[error] Payment verification failed.");
          }
        },
        prefill: {
          name: user?.email ?? "User",
          email: user?.email ?? "user@example.com",
        },
        theme: { color: "#10b981" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      setMessage("[error] Something went wrong during payment.");
    } finally {
      setLoad(false);
    }
  };

  const handleFreePlan = async () => {
    if (!user) return;

    try {
      setLoad(true);
      setMessage("");

      const { error } = await supabase.from("user_subscriptions").upsert(
        {
          user_id: user.id,
          plan_name: "Free",
          is_active: true,
          remaining_uses: 1,
          razorpay_customer_id: null,
          razorpay_subscription_id: null,
          razorpay_payment_id: null,
          valid_till: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      setMessage("Free plan activated. Enjoy basic features!");
      setPlan({ plan: "Free", is_active: true, remaining_uses: 1 });
      router.push(`/${userId}/nutrition`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not activate free plan.");
    } finally {
      setLoad(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden px-6">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-[2] w-full max-w-lg"
      >
        <div className="border border-white/15 bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Choose Your Plan</h1>

          {/* Pro Plan Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="border border-white/20 bg-black/70 rounded-xl p-6 mb-6 shadow-lg"
          >
            <h2 className="font-semibold text-lg mb-2 text-white">Pro Plan</h2>
            <p className="text-gray-300 mb-3 text-md">
              Unlock quick meal features, calorie tracking & personalized plans.
            </p>
            <p className="text-2xl font-bold mb-4 text-white">
              {symbol}
              {price} / month
            </p>
            <Button
              onClick={handlePayment}
              disabled={load}
              className="w-full bg-white text-black font-semibold hover:bg-gray-200 py-0 rounded-sm transition-all duration-300"
            >
              {load ? "Processing..." : "Upgrade to Pro"}
            </Button>
          </motion.div>

          {/* Free Plan Option */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              variant="outline"
              onClick={handleFreePlan}
              disabled={load}
              className="w-3/4 rounded-sm border-white/40 text-black hover:bg-white/70 bg-transparent text-white/50 hover:text-black/80 transition-all duration-300 py-0"
            >
              Continue with Free Plan
            </Button>
          </motion.div>

          {/* Info */}
          <p className="text-xs text-gray-400 mt-6">
            We use approximate country info to display local prices. No personal data is stored.
          </p>

          {message && (
            <p className="text-center text-sm mt-4 text-gray-300">{message}</p>
          )}
        </div>
      </motion.div>
    </main>
  );
}

/* Floating animated lines background */
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.6 + i * 0.03,
    baseOpacity: Math.min(0.85, 0.15 + i * 0.02),
    dur: 18 + Math.random() * 12,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={path.width}
            strokeOpacity={path.baseOpacity}
            initial={{ pathLength: 0.2, opacity: 0.3 }}
            animate={{
              pathLength: [0.2, 1, 0.2],
              opacity: [0.2, path.baseOpacity, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.dur,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </svg>
    </div>
  );
}