import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import ScreenHeader from "../components/ScreenHeader";
import Sheet from "../components/Sheet";
import { ENCOURAGEMENTS, HABIT_OPTIONS } from "../data/constants";
import { currentWeekKeys, todayKey } from "../utils/date";

const DAY_LETTERS = ["س", "ح", "ن", "ث", "ر", "خ", "ج"]; // starting Saturday

function AddHabitSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, addCustomHabit } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🌱");
  const existingIds = new Set(state.habits.map((h) => h.id));
  const suggestions = HABIT_OPTIONS.filter((h) => !existingIds.has(h.id));

  return (
    <Sheet open={open} onClose={onClose} title="🌱 عادة جديدة">
      <div className="flex flex-col gap-5">
        {suggestions.length > 0 && (
          <div>
            <label className="text-sm font-bold block mb-2">اختيار سريع</label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((h) => (
                <button
                  key={h.id}
                  className="chip"
                  onClick={() => {
                    addCustomHabit(h.name, h.icon);
                    onClose();
                  }}
                >
                  {h.icon} {h.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-bold block mb-2">أو عادة خاصة بكِ</label>
          <div className="flex gap-2">
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value.slice(0, 2))}
              className="w-14 text-center rounded-xl px-2 py-3 outline-none text-lg"
              style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم العادة"
              className="flex-1 rounded-xl px-3.5 py-3 outline-none text-[15px]"
              style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
            />
          </div>
        </div>
        <button
          className="btn-primary w-full disabled:opacity-40"
          disabled={!name.trim()}
          onClick={() => {
            addCustomHabit(name.trim(), icon || "🌱");
            setName("");
            onClose();
          }}
        >
          إضافة
        </button>
      </div>
    </Sheet>
  );
}

export default function Habits() {
  const { state, toggleHabitToday } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const week = useMemo(() => currentWeekKeys(), []);
  const today = todayKey();

  return (
    <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
      <ScreenHeader title="🌱 عاداتي" />
      <div className="px-5 flex flex-col gap-4 mt-1">
        {state.habits.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">🌱</p>
            <p className="font-bold">لا عادات بعد</p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>
              ابدئي بعادة صغيرة واحدة.
            </p>
          </div>
        )}

        {state.habits.map((h) => {
          const doneCount = week.filter((d) => h.log[d]).length;
          const encouragement = ENCOURAGEMENTS[h.id.length % ENCOURAGEMENTS.length];
          return (
            <div key={h.id} className="card">
              <div className="flex items-center justify-between">
                <p className="section-title">
                  {h.icon} {h.name}
                </p>
                <span className="pill-count">
                  هذا الأسبوع: {doneCount} / 7
                </span>
              </div>
              <div className="flex justify-between mt-4 gap-1">
                {week.map((d, i) => {
                  const isToday = d === today;
                  const done = !!h.log[d];
                  return (
                    <button
                      key={d}
                      onClick={() => toggleHabitToday(h.id, d)}
                      className="flex-1 flex flex-col items-center gap-1.5"
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: done ? "var(--primary)" : "var(--page)",
                          color: done ? "#fff" : "var(--ink-faint)",
                          border: isToday && !done ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                        }}
                      >
                        {done ? "✓" : DAY_LETTERS[i]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {doneCount < 4 && (
                <p className="text-xs font-bold mt-3.5" style={{ color: "var(--primary-strong)" }}>
                  {encouragement}
                </p>
              )}
            </div>
          );
        })}

        <button className="btn-primary w-full" onClick={() => setAddOpen(true)}>
          + عادة جديدة
        </button>
      </div>
      <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
