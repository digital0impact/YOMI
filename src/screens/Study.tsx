import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import ScreenHeader from "../components/ScreenHeader";
import BrandHeader from "../components/BrandHeader";
import HeroCard from "../components/HeroCard";
import AddTaskSheet from "../components/AddTaskSheet";
import { currentWeekKeys, todayKey } from "../utils/date";
import type { TaskKind } from "../types";

const KIND_LABELS: Record<TaskKind, { title: string; icon: string; addLabel: string }> = {
  task: { title: "المهام", icon: "📝", addLabel: "+ مهمة" },
  exam: { title: "الاختبارات", icon: "🧾", addLabel: "+ اختبار" },
  study_session: { title: "جلسات المذاكرة", icon: "⏱️", addLabel: "+ جلسة" },
};

const SESSION_DURATIONS = [25, 45, 60];

/** most relevant pending count for a subject row, e.g. "2 مهام" */
function subjectSummary(subjectId: string, tasks: { subjectId?: string; kind?: TaskKind; done: boolean }[]) {
  const pending = tasks.filter((t) => t.subjectId === subjectId && !t.done);
  const taskCount = pending.filter((t) => (t.kind ?? "task") === "task").length;
  const examCount = pending.filter((t) => t.kind === "exam").length;
  const sessionCount = pending.filter((t) => t.kind === "study_session").length;
  if (taskCount > 0) return `${taskCount} مهام`;
  if (examCount > 0) return `${examCount} اختبار`;
  if (sessionCount > 0) return `${sessionCount} جلسات مذاكرة`;
  return null;
}

export default function Study() {
  const { state, toggleTask, addTask } = useApp();
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState<TaskKind | null>(null);
  const [addedDuration, setAddedDuration] = useState<number | null>(null);

  const weekKeys = useMemo(() => new Set(currentWeekKeys()), []);
  const weekTasks = state.tasks.filter((t) => weekKeys.has(t.when));
  const weekCounts = {
    task: weekTasks.filter((t) => (t.kind ?? "task") === "task").length,
    exam: weekTasks.filter((t) => t.kind === "exam").length,
    study_session: weekTasks.filter((t) => t.kind === "study_session").length,
  };

  const startQuickSession = (mins: number) => {
    addTask({
      title: `جلسة مذاكرة (${mins} دقيقة)`,
      when: todayKey(),
      priority: "normal",
      kind: "study_session",
    });
    setAddedDuration(mins);
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
                <div className="mt-3 flex flex-col">
                  {items.length === 0 && (
                    <p className="text-sm py-1.5" style={{ color: "var(--ink-faint)" }}>
                      لا شيء هنا بعد.
                    </p>
                  )}
                  {items.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="flex items-center gap-2.5 py-3 text-start"
                      style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                    >
                      <span
                        className="text-[15px] flex-1"
                        style={{
                          color: t.done ? "var(--ink-faint)" : "var(--ink)",
                          textDecoration: t.done ? "line-through" : "none",
                        }}
                      >
                        {t.title}
                      </span>
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[11px]"
                        style={{
                          background: t.done ? "var(--primary)" : "transparent",
                          border: t.done ? "none" : "2px solid var(--border)",
                          color: "#fff",
                        }}
                      >
                        {t.done ? "✓" : ""}
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
      <BrandHeader />
      <div className="px-5 flex flex-col gap-4 mt-3">
        <HeroCard
          eyebrowIcon="📚"
          eyebrow="دراستي"
          title="خطواتك الدراسية"
          subtitle="رتّبي ما تحتاجينه دون أن تحولي الدراسة إلى ضغط."
        />

        <div className="card">
          <p className="section-title">هذا الأسبوع</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="chip">{weekCounts.task} مهام</span>
            <span className="chip">{weekCounts.exam} اختبار</span>
            <span className="chip">{weekCounts.study_session} جلسات مذاكرة</span>
          </div>
        </div>

        <div className="card">
          <p className="section-title">موادي</p>
          <div className="mt-2 flex flex-col">
            {state.subjects.map((s, i) => {
              const summary = subjectSummary(s.id, state.tasks);
              return (
                <button
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className="w-full flex items-center gap-3 py-3 text-start"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                >
                  <span className="flex-1 flex items-baseline gap-2">
                    <span className="font-bold text-[15px]">{s.name}</span>
                    {summary && (
                      <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
                        {summary}
                      </span>
                    )}
                  </span>
                  <span className="text-xl shrink-0">{s.icon}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <p className="section-title">⏱️ جلسة مذاكرة</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            اختاري مدة بسيطة وابدئي.
          </p>
          <div className="flex gap-2 mt-3">
            {SESSION_DURATIONS.map((mins) => (
              <button
                key={mins}
                className="chip flex-1 text-center"
                data-selected={addedDuration === mins}
                onClick={() => startQuickSession(mins)}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
          {addedDuration !== null && (
            <p className="text-xs font-bold mt-3" style={{ color: "var(--primary-strong)" }}>
              ✓ أُضيفت جلسة {addedDuration} دقيقة إلى مهام اليوم
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
