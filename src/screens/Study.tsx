import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import ScreenHeader from "../components/ScreenHeader";
import AddTaskSheet from "../components/AddTaskSheet";
import { currentWeekKeys } from "../utils/date";
import type { TaskKind } from "../types";

const KIND_LABELS: Record<TaskKind, { title: string; icon: string; addLabel: string }> = {
  task: { title: "المهام", icon: "📝", addLabel: "+ مهمة" },
  exam: { title: "الاختبارات", icon: "🧾", addLabel: "+ اختبار" },
  study_session: { title: "جلسات المذاكرة", icon: "⏱️", addLabel: "+ جلسة" },
};

export default function Study() {
  const { state, toggleTask } = useApp();
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState<TaskKind | null>(null);

  const weekKeys = useMemo(() => new Set(currentWeekKeys()), []);
  const weekTasks = state.tasks.filter((t) => weekKeys.has(t.when));
  const weekCounts = {
    task: weekTasks.filter((t) => (t.kind ?? "task") === "task").length,
    exam: weekTasks.filter((t) => t.kind === "exam").length,
    study_session: weekTasks.filter((t) => t.kind === "study_session").length,
  };

  const subject = state.subjects.find((s) => s.id === subjectId) ?? null;

  if (subject) {
    const subjectTasks = state.tasks.filter((t) => t.subjectId === subject.id);
    return (
      <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
        <ScreenHeader title={`${subject.icon} ${subject.name}`} onBack={() => setSubjectId(null)} />
        <div className="px-5 flex flex-col gap-4 mt-2">
          {(["task", "exam", "study_session"] as TaskKind[]).map((kind) => {
            const items = subjectTasks.filter((t) => (t.kind ?? "task") === kind);
            const label = KIND_LABELS[kind];
            return (
              <div key={kind} className="card">
                <div className="flex items-center justify-between">
                  <p className="section-title">
                    {label.icon} {label.title}
                  </p>
                  <button className="btn-ghost" onClick={() => setAddOpen(kind)}>
                    {label.addLabel}
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  {items.length === 0 && (
                    <p className="text-sm py-1.5" style={{ color: "var(--ink-faint)" }}>
                      لا شيء هنا بعد.
                    </p>
                  )}
                  {items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="flex items-center gap-2.5 py-2 text-start"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]"
                        style={{
                          background: t.done ? "var(--primary)" : "transparent",
                          border: t.done ? "none" : "2px solid var(--border)",
                          color: "#fff",
                        }}
                      >
                        {t.done ? "✓" : ""}
                      </span>
                      <span
                        className="text-[15px]"
                        style={{
                          color: t.done ? "var(--ink-faint)" : "var(--ink)",
                          textDecoration: t.done ? "line-through" : "none",
                        }}
                      >
                        {t.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <AddTaskSheet
          open={addOpen !== null}
          onClose={() => setAddOpen(null)}
          kind={addOpen ?? "task"}
          defaultSubjectId={subject.id}
          title={addOpen ? `${KIND_LABELS[addOpen].icon} ${KIND_LABELS[addOpen].addLabel.replace("+ ", "")} جديد` : "جديد"}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
      <ScreenHeader title="📚 دراستي" />
      <div className="px-5 flex flex-col gap-4 mt-1">
        <div className="card">
          <p className="section-title mb-3">هذا الأسبوع</p>
          <div className="flex justify-between text-center">
            <div className="flex-1">
              <p className="text-2xl font-extrabold" style={{ color: "var(--primary-strong)" }}>
                {weekCounts.task}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>مهام</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-extrabold" style={{ color: "var(--primary-strong)" }}>
                {weekCounts.exam}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>اختبار</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-extrabold" style={{ color: "var(--primary-strong)" }}>
                {weekCounts.study_session}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>جلسات مذاكرة</p>
            </div>
          </div>
        </div>

        <div>
          <p className="section-title mb-3 px-1">موادي</p>
          <div className="grid grid-cols-2 gap-3">
            {state.subjects.map((s) => (
              <button key={s.id} onClick={() => setSubjectId(s.id)} className="card flex items-center gap-2.5">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-bold text-[15px]">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
