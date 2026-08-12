"use client";

import type { ReactNode } from "react";

/** window.print() is the whole "PDF export": every browser's print dialog
 * offers Save as PDF, so a real PDF renderer isn't needed, the print CSS in
 * reports.module.css is what makes the output look like a document rather
 * than a screenshot of the app. */
export default function PrintButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {children}
    </button>
  );
}
