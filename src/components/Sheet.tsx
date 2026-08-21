import type { ReactNode } from "react";

export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center fade-in"
      style={{ background: "rgba(30,20,20,0.35)" }}
      onClick={onClose}
    >
      <div
        className="sheet-in w-full max-w-[480px] bg-[var(--surface)] rounded-t-[28px] p-5 pb-7 max-h-[85dvh] overflow-y-auto scroll-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ background: "var(--border)" }} />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: "var(--primary-tint)", color: "var(--primary-strong)" }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
