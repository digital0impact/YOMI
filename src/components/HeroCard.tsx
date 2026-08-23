import type { ReactNode } from "react";

/** gradient intro card used under the brand header: eyebrow, big title, subtitle */
export default function HeroCard({
  eyebrowIcon,
  eyebrow,
  title,
  subtitle,
}: {
  eyebrowIcon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
}) {
  return (
    <div
      className="card"
      style={{ background: "linear-gradient(135deg, var(--gradient-a), var(--gradient-b))", border: "none" }}
    >
      <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: "var(--primary-strong)" }}>
        {eyebrowIcon} {eyebrow}
      </p>
      <p className="text-2xl font-extrabold mt-1">{title}</p>
      <p className="text-sm mt-2 leading-7" style={{ color: "var(--ink-soft)" }}>
        {subtitle}
      </p>
    </div>
  );
}
