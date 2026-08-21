import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import { PRAYERS } from "../data/constants";
import { formatFullDateAr, formatHijriDateAr, greetingByHour, isEvening, todayKey } from "../utils/date";
import AddTaskSheet from "../components/AddTaskSheet";
import ImpactQuickSheet from "../components/ImpactQuickSheet";
import IntentionSheet from "../components/IntentionSheet";
import EveningReflectionSheet from "../components/EveningReflectionSheet";
import type { PrayerName } from "../types";

export default function Home() {
  const { state, togglePrayer, toggleTask, toggleHabitToday } = useApp();
  const date = todayKey();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [intentionOpen, setIntentionOpen] = useState(false);
  const [eveningOpen, setEveningOpen] = useState(false);

  const hijriDate = formatHijriDateAr();
  const prayerDay = state.prayers[date];
  const intention = state.intentions[date]?.text;

  const todayTasks = useMemo(
    () =>
      state.tasks
        .filter((t) => t.when === date && !t.done)
        .sort((a, b) => {
          const order = { urgent: 0, important: 1, normal: 2 } as const;
          return order[a.priority] - order[b.priority];
        })
        .slice(0, 5),
    [state.tasks, date]
  );

  const showEveningBanner = isEvening() && !state.reflections[date];

  return (
    <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
      <div className="px-5 pt-7 pb-2 text-center">
        <p className="text-xl font-extrabold">
          {greetingByHour()}، {state.profile.name || "صديقتي"} 🌷
        </p>
        <p className="text-sm mt-0.5" style={{ color: "var(--ink-faint)" }}>
          {formatFullDateAr()}
          {hijriDate && ` • ${hijriDate}`}
        </p>
      </div>

      <div className="px-5 flex flex-col gap-4 mt-3">
        {/* النية */}
        <button
          onClick={() => setIntentionOpen(true)}
          className="card text-start w-full"
          style={{ background: "var(--primary-tint)", borderColor: "var(--primary-tint-2)" }}
        >
          <p className="section-title" style={{ color: "var(--primary-strong)" }}>
            🤍 نيتي اليوم
          </p>
          {intention ? (
            <p className="mt-2 text-[15px] leading-7">{intention}</p>
          ) : (
            <p className="mt-2 text-sm font-bold" style={{ color: "var(--primary-strong)" }}>
              + أضيف نيتي
            </p>
          )}
        </button>

        {/* الصلاة */}
        <div className="card">
          <p className="section-title">🕌 صلاتي</p>
          <div className="flex justify-between mt-3.5 gap-1.5">
            {PRAYERS.map((p) => {
              const done = prayerDay?.[p.id] ?? false;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePrayer(date, p.id as PrayerName)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl"
                  style={{ background: done ? "var(--primary-tint)" : "transparent" }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: done ? "var(--primary)" : "var(--page)",
                      color: done ? "#fff" : "var(--ink-faint)",
                      border: done ? "none" : "1.5px solid var(--border)",
                    }}
                  >
                    {done ? "✓" : "○"}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: "var(--ink-soft)" }}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* أهم مهامي */}
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="section-title">🎯 أهم مهامي</p>
            <button className="btn-ghost" onClick={() => setAddTaskOpen(true)}>
              + مهمة
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {todayTasks.length === 0 && (
              <p className="text-sm py-2" style={{ color: "var(--ink-faint)" }}>
                لا مهام اليوم بعد، أضيفي أول مهمة لكِ.
              </p>
            )}
            {todayTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className="flex items-center gap-2.5 py-2 text-start"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]"
                  style={{ border: "2px solid var(--primary)", color: "var(--primary)" }}
                >
                  {t.done ? "✓" : ""}
                </span>
                <span className="text-[15px]">{t.title}</span>
                {t.priority === "urgent" && <span className="text-xs ms-auto">🔥</span>}
              </button>
            ))}
          </div>
        </div>

        {/* عاداتي */}
        {state.habits.length > 0 && (
          <div className="card">
            <p className="section-title">🌱 عاداتي</p>
            <div className="mt-3 flex flex-col gap-1">
              {state.habits.map((h) => {
                const done = !!h.log[date];
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabitToday(h.id)}
                    className="flex items-center gap-2.5 py-2 text-start"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]"
                      style={{
                        background: done ? "var(--primary)" : "transparent",
                        border: done ? "none" : "2px solid var(--border)",
                        color: "#fff",
                      }}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="text-[15px]" style={{ color: "var(--ink)" }}>
                      {h.icon} {h.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* أثري اليوم */}
        <button
          onClick={() => setImpactOpen(true)}
          className="card text-center w-full"
          style={{
            background: "linear-gradient(135deg, var(--gradient-a), var(--gradient-b))",
            border: "none",
          }}
        >
          <p className="font-extrabold text-[15px]">هل عملتِ خيرًا اليوم؟</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            حتى الخير الصغير له أثر.
          </p>
          <span className="btn-primary inline-block mt-3.5">أضيف أثري</span>
        </button>

        {showEveningBanner && (
          <button
            onClick={() => setEveningOpen(true)}
            className="card text-start w-full flex items-center gap-3"
          >
            <span className="text-2xl">🌙</span>
            <span className="flex-1">
              <span className="block font-bold text-[15px]">كيف كان يومك؟</span>
              <span className="block text-sm" style={{ color: "var(--ink-faint)" }}>
                لحظة صغيرة قبل النوم
              </span>
            </span>
          </button>
        )}
      </div>

      <AddTaskSheet open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
      <ImpactQuickSheet open={impactOpen} onClose={() => setImpactOpen(false)} />
      <IntentionSheet open={intentionOpen} onClose={() => setIntentionOpen(false)} />
      <EveningReflectionSheet open={eveningOpen} onClose={() => setEveningOpen(false)} />
    </div>
  );
}
