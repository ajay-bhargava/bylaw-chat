"use client";

import GoogleSignIn from "@/components/google-sign-in";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <GoogleSignIn />;
  }

  return (
    <div className="grid grid-cols-[1fr_2fr] h-full">
      <div className="border-r p-4">
        <p className="text-muted-foreground">Chat panel (coming soon)</p>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground">PDF viewer (coming soon)</p>
      </div>
    </div>
  );
}
