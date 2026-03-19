"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export default function Header() {
  const { data: session } = authClient.useSession();

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          <Link href="/" className="font-semibold">
            Bylaw Chat
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {session && (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => authClient.signOut()}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
