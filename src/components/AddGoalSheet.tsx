import { useState } from "react";
import Sheet from "./Sheet";
import { useApp } from "../state/store";

export default function AddGoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useApp();
  const [title, setTitle] = useState("");

  const save = () => {
    if (!title.trim()) return;
    addGoal(title.trim());
    setTitle("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="🎯 هدف جديد">
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-bold block mb-2">هدفي هذا الشهر</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="رفع مستواي في الرياضيات"
            className="w-full rounded-2xl px-4 py-3 outline-none text-[15px]"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
        </div>
        <button className="btn-primary w-full disabled:opacity-40" disabled={!title.trim()} onClick={save}>
          حفظ
        </button>
      </div>
    </Sheet>
  );
}
