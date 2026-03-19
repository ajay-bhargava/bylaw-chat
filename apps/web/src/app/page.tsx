"use client";

import { useCallback, useRef, useState } from "react";

import ChatPanel from "@/components/chat-panel";
import GoogleSignIn from "@/components/google-sign-in";
import PdfViewer from "@/components/pdf-viewer-wrapper";
import type { PdfViewerHandle } from "@/components/pdf-viewer-wrapper";
import { authClient } from "@/lib/auth-client";
import type { Citation } from "@/lib/citations";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [citations, setCitations] = useState<Citation[]>([]);
  const pdfRef = useRef<PdfViewerHandle>(null);

  const handleCitationsChange = useCallback((newCitations: Citation[]) => {
    setCitations(newCitations);
  }, []);

  const handleCitationClick = useCallback((index: number) => {
    pdfRef.current?.jumpToMatch(index);
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

  const keywords = citations.map((c) => c.quotedText);

  return (
    <div className="grid grid-cols-[1fr_2fr] h-full">
      <div className="border-r">
        <ChatPanel
          onCitationsChange={handleCitationsChange}
          onCitationClick={handleCitationClick}
        />
      </div>
      <div className="overflow-hidden">
        <PdfViewer ref={pdfRef} keywords={keywords} />
      </div>
    </div>
  );
}
