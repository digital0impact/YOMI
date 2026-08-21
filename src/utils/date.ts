const WEEKDAYS_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** yyyy-mm-dd using local time (avoids UTC off-by-one) */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function formatFullDateAr(d: Date = new Date()): string {
  return `${WEEKDAYS_AR[d.getDay()]}، ${d.getDate()} ${MONTHS_AR[d.getMonth()]}`;
}

// Latin digits (-nu-latn) to match the Western Arabic numerals used
// everywhere else in the app (task counts, habit streaks, ...).
const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** e.g. "٨ ربيع الأول ١٤٤٨هـ" (Umm al-Qura Hijri calendar) */
export function formatHijriDateAr(d: Date = new Date()): string {
  try {
    return hijriFormatter.format(d);
  } catch {
    // Hijri calendar formatting isn't supported in this environment
    return "";
  }
}

export function monthLabelAr(d: Date = new Date()): string {
  return `${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDateAr(dateKey: string): string {
  const [, m, day] = dateKey.split("-").map(Number);
  return `${day} ${MONTHS_AR[m - 1]}`;
}

/** returns array of 7 date keys for the week containing `d`, starting Saturday */
export function currentWeekKeys(d: Date = new Date()): string[] {
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const offsetFromSaturday = (day + 1) % 7; // Saturday -> 0
  const start = new Date(d);
  start.setDate(d.getDate() - offsetFromSaturday);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return toDateKey(dt);
  });
}

export function greetingByHour(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "مساء الخير";
  if (h < 12) return "صباح الخير";
  if (h < 17) return "طاب يومك";
  if (h < 20) return "مساء النور";
  return "مساء الخير";
}

export function isEvening(d: Date = new Date()): boolean {
  const h = d.getHours();
  return h >= 18 || h < 4;
}
