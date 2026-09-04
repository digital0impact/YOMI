import { useState } from "react";
import { useApp } from "../state/store";
import ScreenHeader from "../components/ScreenHeader";
import ImpactQuickSheet from "../components/ImpactQuickSheet";
import Mascot from "../components/Mascot";
import { formatShortDateAr } from "../utils/date";

export default function Impact({ onBack }: { onBack: () => void }) {
  const { state } = useApp();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
      <ScreenHeader title="🤍 أثري" onBack={onBack} />
      <div className="px-5 flex flex-col gap-4 mt-1">
        <button
          onClick={() => setAddOpen(true)}
          className="card text-center w-full"
          style={{ background: "linear-gradient(135deg, var(--gradient-a), var(--gradient-b))", border: "none" }}
        >
          <p className="font-extrabold text-[15px]">أثر جميل صنعته اليوم؟</p>
          <span className="btn-primary inline-block mt-3.5">أضيف أثري</span>
        </button>

        <div>
          <p className="section-title mb-3 px-1">🌿 آثاري الجميلة</p>
          {state.impact.length === 0 ? (
            <div className="card text-center py-8">
              <div className="flex justify-center mb-2">
                <Mascot size={64} />
              </div>
              <p className="font-bold">لم تُسجَّلي أثرًا بعد</p>
              <p className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>
                حتى الخير الصغير له أثر.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {state.impact.map((entry) => (
                <div key={entry.id} className="card">
                  <p className="text-xs font-bold" style={{ color: "var(--primary-strong)" }}>
                    {formatShortDateAr(entry.date)}
                  </p>
                  <p className="text-[15px] mt-1.5 leading-7">
                    {entry.tag && entry.text !== entry.tag ? `${entry.tag} — ${entry.text}` : entry.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ImpactQuickSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
