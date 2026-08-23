export type ThemeId = "rose" | "lavender" | "green" | "sky" | "beige";

export type InterestId =
  | "study"
  | "reading"
  | "self_dev"
  | "hobbies"
  | "worship"
  | "impact";

export type Priority = "normal" | "important" | "urgent";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerDay = Record<PrayerName, boolean>;

export type TaskKind = "task" | "exam" | "study_session";

export interface Task {
  id: string;
  title: string;
  when: string; // ISO date (yyyy-mm-dd)
  priority: Priority;
  done: boolean;
  subjectId?: string;
  kind?: TaskKind;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  custom?: boolean;
  /** dates (yyyy-mm-dd) marked as done */
  log: Record<string, boolean>;
}

export interface GoalStep {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  month: string; // e.g. "أغسطس 2026"
  steps: GoalStep[];
  createdAt: number;
}

export interface ImpactEntry {
  id: string;
  date: string; // yyyy-mm-dd
  tag?: string;
  text: string;
  createdAt: number;
}

export type Mood = "happy" | "good" | "busy" | "try_again";

export interface DayReflection {
  date: string;
  mood?: Mood;
  impactText?: string;
  completedAt: number;
}

export type IntentionCategory =
  | "worship"
  | "knowledge"
  | "parents"
  | "helping"
  | "self_dev"
  | "useful_work";

export type IntentionFulfillment = "tried" | "succeeded" | "try_again";

export interface Intention {
  date: string;
  text: string;
  category?: IntentionCategory;
  fulfillment?: IntentionFulfillment;
}

export interface Profile {
  name: string;
  interests: InterestId[];
  habitIds: string[];
  theme: ThemeId;
  sticker: string;
  onboarded: boolean;
}

export interface AppState {
  profile: Profile;
  tasks: Task[];
  subjects: Subject[];
  habits: Habit[];
  goals: Goal[];
  impact: ImpactEntry[];
  prayers: Record<string, PrayerDay>; // date -> prayer state
  intentions: Record<string, Intention>; // date -> intention
  reflections: Record<string, DayReflection>; // date -> reflection
  notesSpace: string;
  /** stickers she uploaded herself (data URLs), offered alongside the built-in STICKERS */
  customStickers: string[];
}
