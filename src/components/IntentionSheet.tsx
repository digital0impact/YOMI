import { useState } from "react";
import Sheet from "./Sheet";
import { useApp } from "../state/store";
import { INTENTION_CATEGORIES } from "../data/constants";
import type { IntentionCategory } from "../types";
import { todayKey } from "../utils/date";

export default function IntentionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setIntention } = useApp();
  const date = todayKey();
  const existing = state.intentions[date];
  const [category, setCategory] = useState<IntentionCategory | undefined>(existing?.category);
  const [text, setText] = useState(existing?.text ?? "");

  const save = () => {
    const categoryLabel = INTENTION_CATEGORIES.find((c) => c.id === category)?.label;
    const finalText = text.trim() || categoryLabel || "";
    if (!finalText) return;
    setIntention(date, finalText, category);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="🤍 نيتي اليوم">
      <div className="flex flex-col gap-5">
        <p className="text-[15px] font-bold">ماذا تريدين أن يكون لكِ أثر فيه اليوم؟</p>

        <div className="flex flex-col gap-1">
          {INTENTION_CATEGORIES.map((c) => {
            const selected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(selected ? undefined : c.id)}
                className="flex items-center gap-2.5 py-2 text-start"
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[11px]"
                  style={{
                    background: selected ? "var(--primary)" : "transparent",
                    border: selected ? "none" : "2px solid var(--border)",
                    color: "#fff",
                  }}
                >
                  {selected ? "✓" : ""}
                </span>
                <span className="text-[15px]">
                  {c.emoji} {c.label}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-sm font-bold block mb-2">أو تكتبين نيتكِ بنفسكِ</label>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="سأحاول أن أكون أكثر لطفًا مع من حولي."
            rows={3}
            className="w-full rounded-2xl p-3.5 outline-none resize-none text-[15px]"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
        </div>

        <button className="btn-primary w-full disabled:opacity-40" disabled={!category && !text.trim()} onClick={save}>
          حفظ نيتي
        </button>
      </div>
    </Sheet>
  );
}
