"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export default function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="border-b pt-[env(safe-area-inset-top)]">
      <div className="flex min-h-12 flex-row items-center justify-between gap-2 px-3 py-1">
        <nav className="flex min-w-0 gap-4 text-lg">
          <Link href="/" className="truncate font-semibold">
            Bylaw Chat
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          {session && (
            <>
              <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 md:size-8"
                onClick={() => authClient.signOut()}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
