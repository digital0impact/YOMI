import { useMemo } from "react";
import { quoteOfTheDay } from "../utils/quotes";

/** "رسالة اليوم": a short reflective or poetic line that changes daily */
export default function DailyMessageCard() {
  const quote = useMemo(() => quoteOfTheDay(), []);

  return (
    <div className="card">
      <p className="section-title">💌 رسالة اليوم</p>
      <p className="font-quote text-lg leading-9 mt-2" style={{ color: "var(--ink)" }}>
        {quote.text}
      </p>
      <p className="text-xs font-bold mt-2" style={{ color: "var(--ink-faint)" }}>
        {quote.type === "poetry" ? "🪶 من وحي الشعر" : "💭 خاطرة اليوم"}
      </p>
    </div>
  );
}
