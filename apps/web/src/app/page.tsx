"use client";

import { MessageSquare, FileText } from "lucide-react";
import { useCallback, useState } from "react";

import ChatPanel from "@/components/chat-panel";
import GoogleSignIn from "@/components/google-sign-in";
import TabbedPdfViewer from "@/components/tabbed-pdf-viewer";
import { authClient } from "@/lib/auth-client";
import type { DocumentId } from "@/lib/section-pages";
import { getPageForSection } from "@/lib/section-pages";

type MobileView = "chat" | "pdf";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DocumentId>("bylaws");
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("chat");

  const handleCitationClick = useCallback((section: string, document: DocumentId = "bylaws", quotedText?: string) => {
    const page = getPageForSection(section, document);
    if (page !== null) {
      setActiveTab(document);
      setMobileView("pdf");
      // Reset then set so clicking the same section re-triggers navigation
      setTargetPage(null);
      setHighlightText(null);
      queueMicrotask(() => {
        setTargetPage(page);
        if (document === "offering-plan" && quotedText) {
          setHighlightText(quotedText);
        }
      });
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
    <>
      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-[1fr_2fr] h-full overflow-hidden">
        <div className="border-r min-h-0">
          <ChatPanel onCitationClick={handleCitationClick} />
        </div>
        <div className="overflow-hidden">
          <TabbedPdfViewer
            activeTab={activeTab}
            onTabChange={setActiveTab}
            targetPage={targetPage}
            highlightText={highlightText}
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col h-full overflow-hidden md:hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className={mobileView === "chat" ? "h-full" : "hidden"}>
            <ChatPanel onCitationClick={handleCitationClick} />
          </div>
          <div className={mobileView === "pdf" ? "h-full" : "hidden"}>
            <TabbedPdfViewer
              activeTab={activeTab}
              onTabChange={setActiveTab}
              targetPage={targetPage}
              highlightText={highlightText}
            />
          </div>
        </div>
        <div className="border-t flex">
          <button
            type="button"
            onClick={() => setMobileView("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              mobileView === "chat"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => setMobileView("pdf")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              mobileView === "pdf"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Documents
          </button>
        </div>
      </div>
    </>
  );
}
