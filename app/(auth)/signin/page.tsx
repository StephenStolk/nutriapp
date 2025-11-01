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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    router.push("/pricestructure");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Animated floating background - visible on all screens */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center w-full p-4">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="w-full border border-white/10 bg-white/6 backdrop-blur-md shadow-2xl text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center font-semibold text-white">
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
                    className="bg-white text-black placeholder-gray-500"
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
                    className="bg-white text-black placeholder-gray-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-medium hover:bg-gray-200"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-300">
                Don’t have an account?{" "}
                <a href="/signup" className="text-blue-400 hover:underline">
                  Sign up
                </a>
              </p>

              <p className="text-sm text-gray-300 text-center">
  Forgot your password?{" "}
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
