"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import type { DocumentId } from "@/lib/section-pages";
import { cn } from "@/lib/utils";

import PdfViewer from "./pdf-viewer-wrapper";

const TABS: { id: DocumentId; label: string; fileUrl: string }[] = [
  { id: "bylaws", label: "Bylaws", fileUrl: "/bylaws/by-laws.pdf" },
  { id: "offering-plan", label: "Offering Plan", fileUrl: "/offering-plan/offering-plan.pdf" },
  { id: "rules", label: "Rules", fileUrl: "/rules/rules.pdf" },
];

interface TabbedPdfViewerProps {
  activeTab: DocumentId;
  onTabChange: (tab: DocumentId) => void;
  targetPage: number | null;
  highlightText: string | null;
  /** Shown on small screens to return to the chat view. */
  onBack?: () => void;
}

export default function TabbedPdfViewer({
  activeTab,
  onTabChange,
  targetPage,
  highlightText,
  onBack,
}: TabbedPdfViewerProps) {
  // Only mount a PDF once its tab has been opened, so phones don't download
  // and render every document up front.
  const [visited, setVisited] = useState<Set<DocumentId>>(() => new Set([activeTab]));
  if (!visited.has(activeTab)) {
    setVisited(new Set(visited).add(activeTab));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-stretch border-b">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-11 items-center gap-1 pl-2 pr-3 text-sm text-muted-foreground touch-manipulation md:hidden"
            aria-label="Back to chat"
          >
            <ArrowLeft className="h-4 w-4" />
            Chat
          </button>
        )}
        <div role="tablist" className="flex flex-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "min-h-11 flex-1 whitespace-nowrap px-3 text-sm font-medium transition-colors touch-manipulation md:flex-none md:px-4",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {TABS.filter((tab) => visited.has(tab.id)).map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 bg-background",
              activeTab === tab.id ? "z-10" : "invisible pointer-events-none z-0",
            )}
          >
            <PdfViewer
              fileUrl={tab.fileUrl}
              targetPage={activeTab === tab.id ? targetPage : null}
              highlightText={
                activeTab === tab.id && (tab.id === "offering-plan" || tab.id === "rules")
                  ? highlightText
                  : null
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
