"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await authClient.signIn.social({ provider: "google" });
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bylaw Chat</CardTitle>
          <CardDescription>Sign in to chat with your bylaws</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleSignIn} disabled={loading}>
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
