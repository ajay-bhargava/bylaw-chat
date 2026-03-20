"use client";
/* eslint-disable react-compiler/react-compiler */
"use no memo";

import type { Plugin, PluginFunctions } from "@react-pdf-viewer/core";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { useEffect, useMemo } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

interface PdfViewerProps {
  fileUrl: string;
  targetPage: number | null;
  highlightText: string | null;
}

function createJumpToPagePlugin(): Plugin & { jumpToPage: (page: number) => void } {
  let pluginFns: PluginFunctions | null = null;

  return {
    install(fns: PluginFunctions) {
      pluginFns = fns;
    },
    jumpToPage(page: number) {
      pluginFns?.jumpToPage(page);
    },
  };
}

export default function PdfViewer({ fileUrl, targetPage, highlightText }: PdfViewerProps) {
  const jumpPlugin = useMemo(() => createJumpToPagePlugin(), []);
  const search = searchPlugin();

  useEffect(() => {
    if (targetPage !== null) {
      jumpPlugin.jumpToPage(targetPage);
    }
  }, [targetPage, jumpPlugin]);

  useEffect(() => {
    if (highlightText) {
      search.highlight(highlightText);
    } else {
      search.clearHighlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightText]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div className="h-full">
        <Viewer
          fileUrl={fileUrl}
          plugins={[jumpPlugin, search]}
        />
      </div>
    </Worker>
  );
}
