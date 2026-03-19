"use client";
/* eslint-disable react-compiler/react-compiler */
"use no memo";

import type { Plugin, PluginFunctions } from "@react-pdf-viewer/core";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { useEffect, useRef } from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";

interface PdfViewerProps {
  fileUrl: string;
  targetPage: number | null;
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

export default function PdfViewer({ fileUrl, targetPage }: PdfViewerProps) {
  const pluginRef = useRef<ReturnType<typeof createJumpToPagePlugin> | null>(null);
  if (!pluginRef.current) {
    pluginRef.current = createJumpToPagePlugin();
  }

  useEffect(() => {
    if (targetPage !== null) {
      pluginRef.current?.jumpToPage(targetPage);
    }
  }, [targetPage]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div className="h-full">
        <Viewer
          fileUrl={fileUrl}
          plugins={[pluginRef.current]}
        />
      </div>
    </Worker>
  );
}
