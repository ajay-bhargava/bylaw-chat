"use client";

import { useCallback, useState } from "react";

import ChatPanel from "@/components/chat-panel";
import GoogleSignIn from "@/components/google-sign-in";
import TabbedPdfViewer from "@/components/tabbed-pdf-viewer";
import { authClient } from "@/lib/auth-client";
import type { DocumentId } from "@/lib/section-pages";
import { getPageForSection } from "@/lib/section-pages";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DocumentId>("bylaws");

  const handleCitationClick = useCallback((section: string, document: DocumentId = "bylaws") => {
    const page = getPageForSection(section, document);
    if (page !== null) {
      setActiveTab(document);
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
        <TabbedPdfViewer
          activeTab={activeTab}
          onTabChange={setActiveTab}
          targetPage={targetPage}
        />
      </div>
    </div>
  );
}
