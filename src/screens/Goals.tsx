import { useState } from "react";
import { useApp } from "../state/store";
import ScreenHeader from "../components/ScreenHeader";
import AddGoalSheet from "../components/AddGoalSheet";
import type { Goal } from "../types";

function GoalCard({ goal }: { goal: Goal }) {
  const { toggleGoalStep, addGoalStep, deleteGoal } = useApp();
  const [stepText, setStepText] = useState("");

  const total = goal.steps.length;
  const done = goal.steps.filter((s) => s.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const submitStep = () => {
    if (!stepText.trim()) return;
    addGoalStep(goal.id, stepText.trim());
    setStepText("");
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <p className="font-extrabold text-[15px] leading-6">{goal.title}</p>
        <button
          onClick={() => deleteGoal(goal.id)}
          className="text-xs shrink-0 mt-0.5"
          style={{ color: "var(--ink-faint)" }}
          aria-label="حذف الهدف"
        >
          ✕
        </button>
      </div>

      {total > 0 && (
        <div className="mt-3">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs mt-1.5 font-bold" style={{ color: "var(--primary-strong)" }}>
            {done} من {total}
          </p>
        </div>
      )}

      <p className="text-sm font-bold mt-4 mb-2" style={{ color: "var(--ink-soft)" }}>
        خطواتي
      </p>
      <div className="flex flex-col gap-1">
        {goal.steps.map((st) => (
          <button
            key={st.id}
            onClick={() => toggleGoalStep(goal.id, st.id)}
            className="flex items-center gap-2.5 py-1.5 text-start"
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]"
              style={{
                background: st.done ? "var(--primary)" : "transparent",
                border: st.done ? "none" : "2px solid var(--border)",
                color: "#fff",
              }}
            >
              {st.done ? "✓" : ""}
            </span>
            <span
              className="text-[15px]"
              style={{
                color: st.done ? "var(--ink-faint)" : "var(--ink)",
                textDecoration: st.done ? "line-through" : "none",
              }}
            >
              {st.title}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={stepText}
          onChange={(e) => setStepText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitStep()}
          placeholder="خطوة جديدة..."
          className="flex-1 rounded-xl px-3.5 py-2 text-sm outline-none"
          style={{ border: "1.5px solid var(--border)", background: "var(--page)" }}
        />
        <button className="btn-ghost" onClick={submitStep}>
          إضافة
        </button>
      </div>
    </div>
  );
}

export default function Goals() {
  const { state } = useApp();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
      <ScreenHeader title="🎯 أهدافي" />
      <div className="px-5 flex flex-col gap-4 mt-1">
        {state.goals.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-bold">لا أهداف بعد</p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>
              ابدئي بهدف واحد بسيط لهذا الشهر.
            </p>
          </div>
        )}
        {state.goals.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
        <button className="btn-primary w-full" onClick={() => setAddOpen(true)}>
          + هدف جديد
        </button>
      </div>
      <AddGoalSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
