"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setMessage("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) setMessage(error.message);
    else {
      setMessage("Password updated! Redirecting...");
      setTimeout(() => router.push("/signin"), 2000);
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <Card className="w-full max-w-md border border-white/10 bg-white/6 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Set New Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white text-black"
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="bg-white text-black"
            />
            <Button type="submit" disabled={loading} className="w-full bg-white text-black">
              {loading ? "Updating..." : "Update Password"}
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
