export type TabId = "home" | "study" | "goals" | "habits" | "profile";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "home", label: "يومي", emoji: "🏠" },
  { id: "study", label: "دراستي", emoji: "📚" },
  { id: "goals", label: "أهدافي", emoji: "🎯" },
  { id: "habits", label: "عاداتي", emoji: "🌱" },
  { id: "profile", label: "مساحتي", emoji: "🌷" },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <nav
      className="sticky bottom-0 z-30 mx-auto w-full max-w-[480px] flex items-stretch justify-between px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl"
            style={{
              color: isActive ? "var(--primary-strong)" : "var(--ink-faint)",
              background: isActive ? "var(--primary-tint)" : "transparent",
            }}
          >
            <span className="text-lg leading-none">{t.emoji}</span>
            <span className="text-[11px] font-bold">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
