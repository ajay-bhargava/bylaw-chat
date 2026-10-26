"use client";

import { FileText, MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";

import ChatPanel from "@/components/chat-panel";
import GoogleSignIn from "@/components/google-sign-in";
import TabbedPdfViewer from "@/components/tabbed-pdf-viewer";
import { authClient } from "@/lib/auth-client";
import type { DocumentId } from "@/lib/section-pages";
import { getPageForSection } from "@/lib/section-pages";
import { cn } from "@/lib/utils";

type MobileView = "chat" | "pdf";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DocumentId>("bylaws");
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("chat");

  const handleCitationClick = useCallback(
    (section: string, document: DocumentId = "bylaws", quotedText?: string) => {
      const page = getPageForSection(section, document);
      if (page !== null) {
        setActiveTab(document);
        setMobileView("pdf");
        // Reset then set so clicking the same section re-triggers navigation
        setTargetPage(null);
        setHighlightText(null);
        queueMicrotask(() => {
          setTargetPage(page);
          if ((document === "offering-plan" || document === "rules") && quotedText) {
            setHighlightText(quotedText);
          }
        });
      }
    },
    [],
  );

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <GoogleSignIn />;
  }

  // A single tree serves both layouts: side-by-side on md+, tab-switched on phones.
  // Rendering one copy avoids duplicate chat state and duplicate PDF loads on mobile.
  // Inactive views stay mounted (so PDFs keep their layout) but sit below the active
  // one: PDF.js forces visibility:visible on its pages, so `invisible` alone isn't enough.
  return (
    <div className="flex h-full flex-col overflow-hidden md:grid md:grid-cols-[1fr_2fr]">
      <div className="relative min-h-0 flex-1 md:contents">
        <section
          aria-label="Chat"
          className={cn(
            "absolute inset-0 bg-background md:static md:visible md:pointer-events-auto md:min-h-0 md:border-r",
            mobileView === "chat" ? "z-10" : "invisible pointer-events-none z-0",
          )}
        >
          <ChatPanel onCitationClick={handleCitationClick} />
        </section>
        <section
          aria-label="Documents"
          className={cn(
            "absolute inset-0 bg-background md:static md:visible md:pointer-events-auto md:min-h-0 md:overflow-hidden",
            mobileView === "pdf" ? "z-10" : "invisible pointer-events-none z-0",
          )}
        >
          <TabbedPdfViewer
            activeTab={activeTab}
            onTabChange={setActiveTab}
            targetPage={targetPage}
            highlightText={highlightText}
            onBack={() => setMobileView("chat")}
          />
        </section>
      </div>

      <nav
        aria-label="View"
        className="flex border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <MobileTab
          active={mobileView === "chat"}
          onClick={() => setMobileView("chat")}
          icon={<MessageSquare className="h-5 w-5" />}
          label="Chat"
        />
        <MobileTab
          active={mobileView === "pdf"}
          onClick={() => setMobileView("pdf")}
          icon={<FileText className="h-5 w-5" />}
          label="Documents"
        />
      </nav>
    </div>
  );
}

function MobileTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors touch-manipulation",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
