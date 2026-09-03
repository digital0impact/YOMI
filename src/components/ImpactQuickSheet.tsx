import { useState } from "react";
import Sheet from "./Sheet";
import Mascot from "./Mascot";
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
  const [stage, setStage] = useState<"form" | "done">("form");
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");

  const reset = () => {
    setStage("form");
    setTag(undefined);
    setText("");
  };

  const save = () => {
    const tagLabel = IMPACT_TAGS.find((t) => t.id === tag)?.label;
    const finalText = text.trim() || tagLabel || "";
    if (!finalText) return;
    addImpact({ tag: tagLabel, text: finalText });
    setStage("done");
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
      {stage === "form" && (
        <div className="flex flex-col gap-5">
          <p className="text-[15px] font-bold">هل صنعتِ فرقًا صغيرًا اليوم؟</p>

          <div className="flex flex-col gap-1">
            {IMPACT_TAGS.map((t) => {
              const selected = tag === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTag(selected ? undefined : t.id)}
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
                    {t.emoji} {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">أو بأسلوبكِ الخاص</label>
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
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <Mascot size={80} />
          <p className="font-extrabold text-lg">الحمد لله على التوفيق للخير</p>
          <button
            className="btn-ghost mt-3"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            تمام 🌷
          </button>
        </div>
      )}
    </Sheet>
  );
}
