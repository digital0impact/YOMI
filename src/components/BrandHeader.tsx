import { formatFullDateAr, formatHijriDateAr } from "../utils/date";

/** persistent top bar shown on every main tab: app name + today's date */
export default function BrandHeader() {
  const hijriDate = formatHijriDateAr();
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-1">
      <p className="text-lg font-extrabold flex items-center gap-1.5">يومي 🌷</p>
      <p className="text-xs font-semibold" style={{ color: "var(--ink-faint)" }}>
        {formatFullDateAr()}
        {hijriDate && ` • ${hijriDate}`}
      </p>
    </div>
  );
}
