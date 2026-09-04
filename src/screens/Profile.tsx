import { useState } from "react";
import { useApp } from "../state/store";
import ScreenHeader from "../components/ScreenHeader";
import Sheet from "../components/Sheet";
import Sticker from "../components/Sticker";
import CloudAccountSheet from "../components/CloudAccountSheet";
import InstallAppSheet from "../components/InstallAppSheet";
import { STICKERS, THEMES } from "../data/constants";
import type { TabId } from "../components/BottomNav";

type SheetId = "name" | "theme" | "sticker" | "notes" | "settings" | "cloud" | "install" | null;

function NameSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setProfileName } = useApp();
  const [name, setName] = useState(state.profile.name);
  return (
    <Sheet open={open} onClose={onClose} title="اسمي">
      <div className="flex flex-col gap-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-center text-lg py-3.5 rounded-2xl outline-none"
          style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
        />
        <button
          className="btn-primary w-full disabled:opacity-40"
          disabled={!name.trim()}
          onClick={() => {
            setProfileName(name.trim());
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </Sheet>
  );
}

function ThemeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setTheme } = useApp();
  return (
    <Sheet open={open} onClose={onClose} title="اختاري لونك">
      <div className="flex flex-col gap-2.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{
              border: `2px solid ${state.profile.theme === t.id ? t.swatch : "var(--border)"}`,
              background: state.profile.theme === t.id ? "var(--primary-tint)" : "var(--surface)",
            }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
              style={{ background: t.swatch }}
            >
              {t.emoji}
            </span>
            <span className="font-bold">{t.label}</span>
            {state.profile.theme === t.id && <span className="ms-auto text-sm">✓</span>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function StickerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setSticker } = useApp();
  return (
    <Sheet open={open} onClose={onClose} title="اختاري ستيكرك">
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
        يظهر في مساحتك وفي بطاقة الترحيب اليومية.
      </p>
      <div className="grid grid-cols-5 gap-2.5">
        {STICKERS.map((s) => {
          const selected = state.profile.sticker === s;
          return (
            <button
              key={s}
              onClick={() => setSticker(s)}
              className="aspect-square rounded-2xl flex items-center justify-center"
              style={{
                border: `2px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                background: selected ? "var(--primary-tint)" : "var(--surface)",
              }}
            >
              <Sticker value={s} size={34} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function NotesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setNotesSpace } = useApp();
  const [text, setText] = useState(state.notesSpace);
  return (
    <Sheet open={open} onClose={onClose} title="ملاحظاتي">
      <div className="flex flex-col gap-4">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتبي ما يخطر ببالك..."
          rows={8}
          className="w-full rounded-2xl p-3.5 outline-none resize-none text-[15px]"
          style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
        />
        <button
          className="btn-primary w-full"
          onClick={() => {
            setNotesSpace(text);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </Sheet>
  );
}

function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { resetAll } = useApp();
  const [confirming, setConfirming] = useState(false);
  return (
    <Sheet
      open={open}
      onClose={() => {
        setConfirming(false);
        onClose();
      }}
      title="إعدادات التطبيق"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          بياناتكِ محفوظة على جهازكِ فقط.
        </p>
        {!confirming ? (
          <button
            className="rounded-2xl py-3.5 font-bold text-sm w-full"
            style={{ background: "var(--primary-tint)", color: "#c0455f" }}
            onClick={() => setConfirming(true)}
          >
            إعادة ضبط التطبيق
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold text-center" style={{ color: "#c0455f" }}>
              سيتم حذف كل بياناتكِ. هل أنتِ متأكدة؟
            </p>
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setConfirming(false)}>
                تراجع
              </button>
              <button
                className="rounded-full py-3 font-bold text-sm flex-1 text-white"
                style={{ background: "#c0455f" }}
                onClick={resetAll}
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

export default function Profile({ onNavigate, onOpenImpact }: { onNavigate: (t: TabId) => void; onOpenImpact: () => void }) {
  const { state, cloud } = useApp();
  const [sheet, setSheet] = useState<SheetId>(null);

  const items: { id: string; label: string; icon: string; onClick: () => void }[] = [
    { id: "name", label: "اسمي", icon: "🌷", onClick: () => setSheet("name") },
    { id: "theme", label: "اللون", icon: "🎨", onClick: () => setSheet("theme") },
    { id: "sticker", label: "ستيكراتي", icon: state.profile.sticker, onClick: () => setSheet("sticker") },
    { id: "habits", label: "عاداتي", icon: "🌱", onClick: () => onNavigate("habits") },
    { id: "goals", label: "أهدافي", icon: "🎯", onClick: () => onNavigate("goals") },
    { id: "impact", label: "آثاري", icon: "🤍", onClick: onOpenImpact },
    ...(cloud.configured
      ? [
          {
            id: "cloud",
            label: cloud.status === "signed_in" ? "الحساب والمزامنة" : "نسخة احتياطية سحابية",
            icon: "☁️",
            onClick: () => setSheet("cloud"),
          },
        ]
      : []),
    { id: "install", label: "تثبيت التطبيق", icon: "📲", onClick: () => setSheet("install") },
    { id: "notes", label: "ملاحظاتي", icon: "📝", onClick: () => setSheet("notes") },
    { id: "settings", label: "إعدادات التطبيق", icon: "⚙️", onClick: () => setSheet("settings") },
  ];

  return (
    <div className="flex-1 overflow-y-auto scroll-hide pb-6 fade-in">
      <ScreenHeader title="🌷 مساحتي" />
      <div className="px-5 mt-1">
        <div className="card flex items-center gap-3 mb-4">
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "linear-gradient(135deg, var(--gradient-a), var(--gradient-b))" }}
          >
            <Sticker value={state.profile.sticker} size={56} />
          </span>
          <div>
            <p className="font-extrabold text-lg">{state.profile.name || "صديقتي"}</p>
            <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
              {state.habits.length} عادات • {state.goals.length} أهداف • {state.impact.length} أثر
            </p>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={it.onClick}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-start"
              style={{ borderTop: idx === 0 ? "none" : "1px solid var(--border)" }}
            >
              <span className="text-lg w-5 inline-flex items-center justify-center">
                {it.id === "sticker" ? <Sticker value={state.profile.sticker} size={20} /> : it.icon}
              </span>
              <span className="font-semibold text-[15px]">{it.label}</span>
              <span className="ms-auto" style={{ color: "var(--ink-faint)" }}>
                ‹
              </span>
            </button>
          ))}
        </div>
      </div>

      <NameSheet open={sheet === "name"} onClose={() => setSheet(null)} />
      <ThemeSheet open={sheet === "theme"} onClose={() => setSheet(null)} />
      <StickerSheet open={sheet === "sticker"} onClose={() => setSheet(null)} />
      {cloud.configured && <CloudAccountSheet open={sheet === "cloud"} onClose={() => setSheet(null)} />}
      <InstallAppSheet open={sheet === "install"} onClose={() => setSheet(null)} />
      <NotesSheet open={sheet === "notes"} onClose={() => setSheet(null)} />
      <SettingsSheet open={sheet === "settings"} onClose={() => setSheet(null)} />
    </div>
  );
}
