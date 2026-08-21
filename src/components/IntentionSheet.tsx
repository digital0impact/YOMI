import { useState } from "react";
import Sheet from "./Sheet";
import { useApp } from "../state/store";
import { todayKey } from "../utils/date";

export default function IntentionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setIntention } = useApp();
  const date = todayKey();
  const [text, setText] = useState(state.intentions[date]?.text ?? "");

  const save = () => {
    if (!text.trim()) return;
    setIntention(date, text.trim());
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="🤍 نيتي اليوم">
      <div className="flex flex-col gap-4">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أن أكون عونًا لمن حولي..."
          rows={3}
          className="w-full rounded-2xl p-3.5 outline-none resize-none text-[15px]"
          style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
        />
        <button className="btn-primary w-full disabled:opacity-40" disabled={!text.trim()} onClick={save}>
          حفظ نيتي
        </button>
      </div>
    </Sheet>
  );
}
