"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch('/api/check-user', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email}),
    });
    const { exists } = await res.json();

    if (!exists) {
    setMessage("No account found with that email.");
    setLoading(false);
    return;
  }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) setMessage(error.message);
    else setMessage("Password reset link sent to your email.");

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <Card className="w-full max-w-md border border-white/10 bg-white/6 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white text-black"
            />
            <Button type="submit" disabled={loading} className="w-full bg-white text-black">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          {message && (
            <p className="text-sm text-center text-gray-300 mt-3">{message}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
