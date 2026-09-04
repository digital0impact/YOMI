import { useEffect, useState } from "react";
import { useApp } from "../state/store";
import { HABIT_OPTIONS, INTERESTS, THEMES } from "../data/constants";
import Mascot from "../components/Mascot";
import type { InterestId, ThemeId } from "../types";

type Step = "welcome" | "name" | "interests" | "habits" | "theme";

export default function Onboarding() {
  const { setProfileName, setInterests, completeOnboarding, state } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [interests, setLocalInterests] = useState<InterestId[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const [theme, setLocalTheme] = useState<ThemeId>(state.profile.theme);

  // live-preview the selected theme before onboarding finishes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleInterest = (id: InterestId) => {
    setLocalInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleHabit = (id: string) => {
    setHabitIds((prev) => {
      if (prev.includes(id)) return prev.filter((h) => h !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="app-shell items-center justify-center px-6 py-10 fade-in">
      {step === "welcome" && (
        <div className="flex flex-col items-center text-center gap-5 max-w-sm">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full pattern-dots" />
            <Mascot size={112} />
          </div>
          <h1 className="text-2xl font-extrabold">أهلاً بكِ</h1>
          <p className="text-[15px] leading-8" style={{ color: "var(--ink-soft)" }}>
            هذا المنظم هدية لكِ
            <br />
            لأن تميزك يستحق الاحتفاء.
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--primary-strong)" }}>
            نظمي يومك • طوري نفسك • اصنعي أثرًا
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--ink-faint)" }}>
            وأنا نوتة 🐱، رفيقتك في الطريق
          </p>
          <p
            className="text-xs font-bold px-3.5 py-1.5 rounded-full mt-1"
            style={{ background: "var(--primary-tint)", color: "var(--primary-strong)" }}
          >
            🎁 هدية من معلمتك أمل الشامان
          </p>
          <button className="btn-primary w-full mt-4" onClick={() => setStep("name")}>
            ابدئي رحلتك
          </button>
        </div>
      )}

      {step === "name" && (
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="flex justify-center">
            <Mascot size={48} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold mb-1" style={{ color: "var(--primary-strong)" }}>
              لنخصصه لكِ
            </p>
            <h1 className="text-xl font-extrabold">ما اسمك؟</h1>
          </div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اكتبي اسمك"
            className="w-full text-center text-lg py-3.5 rounded-2xl outline-none"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
          <button
            className="btn-primary w-full disabled:opacity-40"
            disabled={!name.trim()}
            onClick={() => {
              setProfileName(name.trim());
              setStep("interests");
            }}
          >
            متابعة
          </button>
        </div>
      )}

      {step === "interests" && (
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="flex justify-center">
            <Mascot size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold">ما أكثر شيء تريدين الاهتمام به؟</h1>
            <p className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>يمكنك اختيار أكثر من واحد</p>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {INTERESTS.map((i) => (
              <button
                key={i.id}
                className="chip"
                data-selected={interests.includes(i.id)}
                onClick={() => toggleInterest(i.id)}
              >
                {i.emoji} {i.label}
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full disabled:opacity-40"
            disabled={interests.length === 0}
            onClick={() => {
              setInterests(interests);
              setStep("habits");
            }}
          >
            متابعة
          </button>
        </div>
      )}

      {step === "habits" && (
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="flex justify-center">
            <Mascot size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold">اختاري عادات تريدين متابعتها</h1>
            <p className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>
              اختاري 3–5 فقط ({habitIds.length}/5)
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {HABIT_OPTIONS.map((h) => (
              <button
                key={h.id}
                className="chip"
                data-selected={habitIds.includes(h.id)}
                onClick={() => toggleHabit(h.id)}
              >
                {h.icon} {h.name}
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full disabled:opacity-40"
            disabled={habitIds.length < 3}
            onClick={() => setStep("theme")}
          >
            متابعة
          </button>
        </div>
      )}

      {step === "theme" && (
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="flex justify-center">
            <Mascot size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold">اختاري لونك</h1>
            <p className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>هذا تطبيقك أنتِ</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setLocalTheme(t.id)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{
                  border: `2px solid ${theme === t.id ? t.swatch : "var(--border)"}`,
                  background: theme === t.id ? "var(--primary-tint)" : "var(--surface)",
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ background: t.swatch }}
                >
                  {t.emoji}
                </span>
                <span className="font-bold">{t.label}</span>
                {theme === t.id && <span className="ms-auto text-sm">✓</span>}
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full"
            onClick={() => completeOnboarding(habitIds, theme)}
          >
            هيا نبدأ 🌷
          </button>
        </div>
      )}
    </div>
  );
}
