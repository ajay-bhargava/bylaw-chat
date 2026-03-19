"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { useEffect, useImperativeHandle, useMemo, forwardRef } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

export interface PdfViewerHandle {
  jumpToMatch: (index: number) => void;
}

interface PdfViewerProps {
  keywords: string[];
}

const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(
  function PdfViewer({ keywords }, ref) {
    const searchPluginInstance = useMemo(() => searchPlugin(), []);

    useEffect(() => {
      if (keywords.length > 0) {
        searchPluginInstance.highlight(keywords);
      } else {
        searchPluginInstance.clearHighlights();
      }
    }, [keywords, searchPluginInstance]);

    useImperativeHandle(ref, () => ({
      jumpToMatch: (index: number) => {
        searchPluginInstance.jumpToMatch(index);
      },
    }));

    return (
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <div className="h-full">
          <Viewer
            fileUrl="/bylaws/By-Laws.pdf"
            plugins={[searchPluginInstance]}
          />
        </div>
      </Worker>
    );
  }
);

export default PdfViewer;
