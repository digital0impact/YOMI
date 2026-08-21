import { useState } from "react";
import Sheet from "./Sheet";
import { IMPACT_TAGS } from "../data/constants";
import { useApp } from "../state/store";

export default function ImpactQuickSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { addImpact } = useApp();
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");

  const reset = () => {
    setTag(undefined);
    setText("");
  };

  const save = () => {
    const tagLabel = IMPACT_TAGS.find((t) => t.id === tag)?.label;
    const finalText = text.trim() || tagLabel || "";
    if (!finalText) return;
    addImpact({ tag: tagLabel, text: finalText });
    reset();
    onClose();
    onSaved?.();
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="🤍 أثري اليوم"
    >
      <div className="flex flex-col gap-5">
        <p className="text-[15px]" style={{ color: "var(--ink-soft)" }}>
          أثر جميل صنعته اليوم؟
        </p>
        <div className="flex flex-wrap gap-2">
          {IMPACT_TAGS.map((t) => (
            <button
              key={t.id}
              className="chip"
              data-selected={tag === t.id}
              onClick={() => setTag(tag === t.id ? undefined : t.id)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-sm font-bold block mb-2">أريد أن أكتب أثري</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اليوم..."
            rows={3}
            className="w-full rounded-2xl p-3.5 outline-none resize-none text-[15px]"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
        </div>
        <button className="btn-primary w-full disabled:opacity-40" disabled={!tag && !text.trim()} onClick={save}>
          حفظ
        </button>
      </div>
    </Sheet>
  );
}
