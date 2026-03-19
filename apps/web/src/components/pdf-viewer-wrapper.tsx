"use client";

import dynamic from "next/dynamic";
import type { PdfViewerHandle } from "./pdf-viewer";

const PdfViewer = dynamic(() => import("./pdf-viewer"), { ssr: false });

export type { PdfViewerHandle };
export default PdfViewer;
