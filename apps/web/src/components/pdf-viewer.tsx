"use client";
/* eslint-disable react-compiler/react-compiler */
"use no memo";

import type { DocumentLoadEvent, Plugin, PluginFunctions } from "@react-pdf-viewer/core";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { useEffect, useMemo, useRef } from "react";

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
  const loadedRef = useRef(false);
  // A citation can target a document that is still loading; remember the page
  // and jump once the document is ready.
  const pendingPageRef = useRef<number | null>(targetPage);
  const latestHighlightRef = useRef(highlightText);
  latestHighlightRef.current = highlightText;

  useEffect(() => {
    if (targetPage === null) return;
    if (loadedRef.current) {
      jumpPlugin.jumpToPage(targetPage);
    } else {
      pendingPageRef.current = targetPage;
    }
  }, [targetPage, jumpPlugin]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (highlightText) {
      search.highlight(highlightText);
    } else {
      search.clearHighlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightText]);

  function handleDocumentLoad(_e: DocumentLoadEvent) {
    loadedRef.current = true;
    const pending = pendingPageRef.current;
    pendingPageRef.current = null;
    if (pending !== null) {
      // Wait a frame so the viewer has laid out its pages before scrolling.
      requestAnimationFrame(() => jumpPlugin.jumpToPage(pending));
    }
    if (latestHighlightRef.current) {
      search.highlight(latestHighlightRef.current);
    }
  }

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div className="h-full">
        <Viewer
          fileUrl={fileUrl}
          plugins={[jumpPlugin, search]}
          defaultScale={SpecialZoomLevel.PageWidth}
          onDocumentLoad={handleDocumentLoad}
        />
      </div>
    </Worker>
  );
}
