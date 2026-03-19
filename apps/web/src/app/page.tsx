"use client";

import { useCallback, useState } from "react";

import ChatPanel from "@/components/chat-panel";
import GoogleSignIn from "@/components/google-sign-in";
import PdfViewer from "@/components/pdf-viewer-wrapper";
import { authClient } from "@/lib/auth-client";
import { getPageForSection } from "@/lib/section-pages";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [targetPage, setTargetPage] = useState<number | null>(null);

  const handleCitationClick = useCallback((section: string) => {
    const page = getPageForSection(section);
    if (page !== null) {
      // Reset then set so clicking the same section re-triggers navigation
      setTargetPage(null);
      queueMicrotask(() => setTargetPage(page));
    }
  }, []);

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
    <div className="grid grid-cols-[1fr_2fr] h-full overflow-hidden">
      <div className="border-r min-h-0">
        <ChatPanel onCitationClick={handleCitationClick} />
      </div>
      <div className="overflow-hidden">
        <PdfViewer fileUrl="/bylaws/by-laws.pdf" targetPage={targetPage} />
      </div>
    </div>
  );
}
