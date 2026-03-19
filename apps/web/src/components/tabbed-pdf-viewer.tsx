"use client";

import { useState } from "react";

import type { DocumentId } from "@/lib/section-pages";

import PdfViewer from "./pdf-viewer-wrapper";

const TABS: { id: DocumentId; label: string; fileUrl: string }[] = [
  { id: "bylaws", label: "Bylaws", fileUrl: "/bylaws/by-laws.pdf" },
  { id: "offering-plan", label: "Offering Plan", fileUrl: "/offering-plan/offering-plan.pdf" },
];

interface TabbedPdfViewerProps {
  activeTab: DocumentId;
  onTabChange: (tab: DocumentId) => void;
  targetPage: number | null;
}

export default function TabbedPdfViewer({
  activeTab,
  onTabChange,
  targetPage,
}: TabbedPdfViewerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${activeTab === tab.id ? "visible" : "invisible"}`}
          >
            <PdfViewer
              fileUrl={tab.fileUrl}
              targetPage={activeTab === tab.id ? targetPage : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
