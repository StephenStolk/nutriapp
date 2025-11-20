// app/(auth)/signin/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Grid2x2PlusIcon } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.error(error);
    alert("Sign in failed: " + error.message);
    setLoading(false);
    return;
  }

  // Check if user has a subscription
  const { data: subData, error: subError } = await supabase
    .from("user_subscriptions")
    .select("plan_name, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  setLoading(false);

  // Redirect based on subscription status
  if (subData && subData.is_active) {
    // User has active subscription - go DIRECTLY to dashboard
    router.push(`/${data.user.id}/nutrition`);
  } else {
    // No subscription or inactive - go to pricing
    router.push("/pricestructure");
  }
};

  const handleGoogleSignIn = async () => {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, 
    },
  });

  if (error) {
    console.error("Google Sign-in error:", error);
  }
};


  return (
    <main className="w-full relative flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      {/* Animated floating background - visible on all screens */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center w-full">
        <h1 className="text-3xl mb-12">Kalnut</h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="w-full border border-white/10 bg-white/6 backdrop-blur-md shadow-2xl text-white">
            <CardHeader>
              <CardTitle className="text-xl text-center font-semibold text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                Sign in to your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="placeholder-gray-500 focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="placeholder-gray-500 focus:ring-2 focus:ring-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold hover:bg-gray-200 transition-all duration-300 rounded-[5px] mt-12"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="my-4 flex items-center">
  <div className="flex-1 border-t border-white/20"></div>
  <span className="mx-3 text-gray-400 text-sm">or</span>
  <div className="flex-1 border-t border-white/20"></div>
</div>

<Button
  onClick={handleGoogleSignIn}
  className="w-full flex items-center justify-center gap-2 bg-[#4285F4] text-white hover:bg-[#357ae8] rounded-[5px]"
>
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.18 0 5.37 1.38 6.61 2.54l4.84-4.84C32.38 4.25 28.48 2.5 24 2.5 14.82 2.5 7.3 8.92 4.74 17.36l5.67 4.4C11.58 14.79 17.26 9.5 24 9.5z"
    />
    <path
      fill="#34A853"
      d="M46.1 24.28c0-1.64-.14-3.18-.39-4.68H24v9h12.61c-.54 2.86-2.14 5.28-4.61 6.91l7.1 5.5c4.15-3.83 7-9.48 7-16.73z"
    />
    <path
      fill="#4A90E2"
      d="M9.41 28.22c-1.04-3.11-1.04-6.44 0-9.55L3.74 14.27C1.44 18.91.5 23.88.5 29s.94 10.09 3.24 14.73l5.67-4.46z"
    />
    <path
      fill="#FBBC05"
      d="M24 46c5.48 0 10.07-1.81 13.43-4.94l-7.1-5.5c-1.96 1.33-4.46 2.15-6.33 2.15-5.89 0-10.87-3.98-12.67-9.44l-5.67 4.46C7.3 39.08 14.82 46 24 46z"
    />
  </svg>
  Continue with Google
</Button>

            </CardContent>

           <CardFooter className="flex flex-col items-center space-y-2">
  <p className="text-sm text-gray-300">
    Don’t have an account?{" "}
    <a href="/signup" className="text-blue-400 hover:underline">
      Sign up
    </a>
  </p>

  <p className="text-sm text-gray-300 text-center flex">
    <span>Forgot your password? </span>
    <a href="/forgot-password" className="text-blue-400 hover:underline">
      Reset it
    </a>
  </p>
</CardFooter>

          </Card>
        </motion.div>
      </div>
    </main>
  );
}

/* Floating white animated paths — visible on all sizes */
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    // same curve formula you used before
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.6 + i * 0.03,
    // vary opacity a bit for visibility
    baseOpacity: Math.min(0.85, 0.15 + i * 0.02),
    dur: 18 + Math.random() * 12,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        <title>Animated Background</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="rgba(255,255,255,0.6)" // stronger so it's visible over black
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
