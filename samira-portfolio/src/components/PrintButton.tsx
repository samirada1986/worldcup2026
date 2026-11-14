"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="font-sans text-sm text-ink link-quiet print:hidden"
    >
      {label} ↓
    </button>
  );
}
