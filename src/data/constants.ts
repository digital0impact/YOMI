import type { InterestId, Subject, ThemeId } from "../types";

export const THEMES: { id: ThemeId; label: string; emoji: string; swatch: string }[] = [
  { id: "rose", label: "وردي هادئ", emoji: "🌸", swatch: "#D9748C" },
  { id: "lavender", label: "لافندر", emoji: "💜", swatch: "#9B8AC4" },
  { id: "green", label: "أخضر هادئ", emoji: "🌿", swatch: "#7CA982" },
  { id: "sky", label: "أزرق سماوي", emoji: "🩵", swatch: "#6FA8C7" },
  { id: "beige", label: "بيج دافئ", emoji: "🤎", swatch: "#B98F63" },
];

export const INTERESTS: { id: InterestId; label: string; emoji: string }[] = [
  { id: "study", label: "دراستي", emoji: "📚" },
  { id: "reading", label: "القراءة", emoji: "📖" },
  { id: "self_dev", label: "تطوير نفسي", emoji: "🌱" },
  { id: "hobbies", label: "هواياتي", emoji: "🎨" },
  { id: "worship", label: "عبادتي", emoji: "🕌" },
  { id: "impact", label: "عملي وأثري", emoji: "🤍" },
];

export const HABIT_OPTIONS: { id: string; name: string; icon: string }[] = [
  { id: "reading", name: "القراءة", icon: "📖" },
  { id: "studying", name: "المذاكرة", icon: "📚" },
  { id: "early_sleep", name: "النوم المبكر", icon: "🌙" },
  { id: "water", name: "شرب الماء", icon: "💧" },
  { id: "sport", name: "الرياضة", icon: "🏃‍♀️" },
  { id: "quran", name: "القرآن", icon: "🕌" },
];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "science", name: "علوم", icon: "🔬" },
  { id: "math", name: "رياضيات", icon: "📐" },
  { id: "arabic", name: "لغتي", icon: "📖" },
  { id: "digital", name: "مهارات رقمية", icon: "💻" },
];

export const IMPACT_TAGS: { id: string; label: string; emoji: string }[] = [
  { id: "helped", label: "ساعدت شخصًا", emoji: "🌷" },
  { id: "made_happy", label: "أسعدت أحدًا", emoji: "🤍" },
  { id: "kind_word", label: "قلت كلمة طيبة", emoji: "💬" },
  { id: "parents", label: "بررت والديّ", emoji: "🫶" },
  { id: "charity", label: "تصدقت", emoji: "🎁" },
  { id: "classmate", label: "ساعدت زميلة", emoji: "🤝" },
  { id: "forgave", label: "عفوت عن شخص", emoji: "🕊️" },
  { id: "other", label: "فعلت خيرًا آخر", emoji: "🌱" },
];

export const PRAYERS: { id: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"; label: string }[] = [
  { id: "fajr", label: "الفجر" },
  { id: "dhuhr", label: "الظهر" },
  { id: "asr", label: "العصر" },
  { id: "maghrib", label: "المغرب" },
  { id: "isha", label: "العشاء" },
];

export const MOODS: { id: "happy" | "good" | "busy" | "try_again"; label: string; emoji: string }[] = [
  { id: "happy", label: "جميل", emoji: "😊" },
  { id: "good", label: "جيد", emoji: "🙂" },
  { id: "busy", label: "كان مزدحمًا", emoji: "😐" },
  { id: "try_again", label: "سأحاول غدًا", emoji: "🌱" },
];

export const PRIORITIES: { id: "normal" | "important" | "urgent"; label: string }[] = [
  { id: "normal", label: "عادية" },
  { id: "important", label: "مهمة" },
  { id: "urgent", label: "عاجلة" },
];

export const ENCOURAGEMENTS = [
  "🌱 استمري، خطوة صغيرة تكفي.",
  "🌷 كل يوم فرصة جديدة.",
  "🤍 لا بأس، المهم أن تعودي.",
  "✨ رفقًا بنفسك، أنتِ تتقدمين.",
];
