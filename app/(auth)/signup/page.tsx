"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/signin`,
      },
     });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user?.identities?.length === 0) {
      alert("User already registered.");
    } else {
      router.push("/signin");
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-black text-white overflow-hidden px-4">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-[2] w-full max-w-lg"
      >
        <Card className="w-full border border-white/15 bg-white/5 backdrop-blur-lg shadow-2xl rounded-2xl px-6 py-4">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-300 text-base text-md">
              Sign up with your email and password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center mt-4">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-white hover:underline font-bold"
              >
                Sign in
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}

/* Floating animated lines — same as in SignInPage */
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
        <title>Animated Background</title>
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
