import { useState } from "react";
import Sheet from "./Sheet";
import { useApp } from "../state/store";

const ICON_SUGGESTIONS = ["📘", "🔬", "📐", "🌍", "🎨", "💻", "🧪", "📖", "🗣️", "⚗️"];

export default function AddSubjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSubject } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_SUGGESTIONS[0]);

  const reset = () => {
    setName("");
    setIcon(ICON_SUGGESTIONS[0]);
  };

  const save = () => {
    if (!name.trim()) return;
    addSubject(name.trim(), icon);
    reset();
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="📘 مادة جديدة"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-bold block mb-2">أيقونة المادة</label>
          <div className="flex flex-wrap gap-2">
            {ICON_SUGGESTIONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  border: `2px solid ${icon === ic ? "var(--primary)" : "var(--border)"}`,
                  background: icon === ic ? "var(--primary-tint)" : "var(--surface)",
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold block mb-2">اسم المادة</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: تاريخ"
            className="w-full rounded-2xl px-4 py-3 outline-none text-[15px]"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
        </div>
        <button className="btn-primary w-full disabled:opacity-40" disabled={!name.trim()} onClick={save}>
          إضافة
        </button>
      </div>
    </Sheet>
  );
}
