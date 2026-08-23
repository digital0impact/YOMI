import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  DayReflection,
  Goal,
  GoalStep,
  Habit,
  ImpactEntry,
  Intention,
  PrayerDay,
  PrayerName,
  Priority,
  Subject,
  TaskKind,
  ThemeId,
} from "../types";
import { DEFAULT_SUBJECTS, HABIT_OPTIONS } from "../data/constants";
import { todayKey } from "../utils/date";

const STORAGE_KEY = "yomi.app.state.v1";

const EMPTY_PRAYER_DAY = (): PrayerDay => ({
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
});

function defaultState(): AppState {
  return {
    profile: {
      name: "",
      interests: [],
      habitIds: [],
      theme: "rose",
      onboarded: false,
    },
    tasks: [],
    subjects: DEFAULT_SUBJECTS,
    habits: [],
    goals: [],
    impact: [],
    prayers: {},
    intentions: {},
    reflections: {},
    notesSpace: "",
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // merge with defaults to survive schema growth between versions
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface Ctx {
  state: AppState;
  setProfileName: (name: string) => void;
  setInterests: (ids: AppState["profile"]["interests"]) => void;
  completeOnboarding: (habitIds: string[], theme: ThemeId) => void;
  setTheme: (theme: ThemeId) => void;

  addTask: (input: {
    title: string;
    when: string;
    priority: Priority;
    subjectId?: string;
    kind?: TaskKind;
  }) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addSubject: (name: string, icon: string) => void;
  deleteSubject: (id: string) => void;

  togglePrayer: (date: string, prayer: PrayerName) => void;

  toggleHabitToday: (habitId: string, date?: string) => void;
  addCustomHabit: (name: string, icon: string) => void;

  addGoal: (title: string) => void;
  addGoalStep: (goalId: string, title: string) => void;
  toggleGoalStep: (goalId: string, stepId: string) => void;
  deleteGoal: (goalId: string) => void;

  addImpact: (entry: { tag?: string; text: string; date?: string }) => void;

  setIntention: (date: string, text: string) => void;

  saveReflection: (date: string, refl: Omit<DayReflection, "date" | "completedAt">) => void;

  setNotesSpace: (text: string) => void;

  resetAll: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.profile.theme);
  }, [state.profile.theme]);

  const setProfileName = useCallback((name: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, name } }));
  }, []);

  const setInterests = useCallback((ids: AppState["profile"]["interests"]) => {
    setState((s) => ({ ...s, profile: { ...s.profile, interests: ids } }));
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    setState((s) => ({ ...s, profile: { ...s.profile, theme } }));
  }, []);

  const completeOnboarding = useCallback((habitIds: string[], theme: ThemeId) => {
    setState((s) => {
      const chosen: Habit[] = habitIds.map((id) => {
        const opt = HABIT_OPTIONS.find((h) => h.id === id);
        return { id, name: opt?.name ?? id, icon: opt?.icon ?? "🌱", log: {} };
      });
      return {
        ...s,
        habits: chosen,
        profile: { ...s.profile, habitIds, theme, onboarded: true },
      };
    });
  }, []);

  const addTask = useCallback<Ctx["addTask"]>((input) => {
    setState((s) => ({
      ...s,
      tasks: [
        {
          id: uid(),
          title: input.title,
          when: input.when,
          priority: input.priority,
          subjectId: input.subjectId,
          kind: input.kind ?? "task",
          done: false,
          createdAt: Date.now(),
        },
        ...s.tasks,
      ],
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const addSubject = useCallback((name: string, icon: string) => {
    setState((s) => ({
      ...s,
      subjects: [...s.subjects, { id: uid(), name, icon } as Subject],
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      subjects: s.subjects.filter((sub) => sub.id !== id),
    }));
  }, []);

  const togglePrayer = useCallback((date: string, prayer: PrayerName) => {
    setState((s) => {
      const day = s.prayers[date] ?? EMPTY_PRAYER_DAY();
      return {
        ...s,
        prayers: { ...s.prayers, [date]: { ...day, [prayer]: !day[prayer] } },
      };
    });
  }, []);

  const toggleHabitToday = useCallback((habitId: string, date?: string) => {
    const key = date ?? todayKey();
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) =>
        h.id === habitId ? { ...h, log: { ...h.log, [key]: !h.log[key] } } : h
      ),
    }));
  }, []);

  const addCustomHabit = useCallback((name: string, icon: string) => {
    setState((s) => ({
      ...s,
      habits: [...s.habits, { id: uid(), name, icon, custom: true, log: {} } as Habit],
    }));
  }, []);

  const addGoal = useCallback((title: string) => {
    setState((s) => ({
      ...s,
      goals: [
        { id: uid(), title, month: "", steps: [], createdAt: Date.now() } as Goal,
        ...s.goals,
      ],
    }));
  }, []);

  const addGoalStep = useCallback((goalId: string, title: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === goalId
          ? { ...g, steps: [...g.steps, { id: uid(), title, done: false } as GoalStep] }
          : g
      ),
    }));
  }, []);

  const toggleGoalStep = useCallback((goalId: string, stepId: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              steps: g.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st)),
            }
          : g
      ),
    }));
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== goalId) }));
  }, []);

  const addImpact = useCallback<Ctx["addImpact"]>((entry) => {
    setState((s) => ({
      ...s,
      impact: [
        {
          id: uid(),
          date: entry.date ?? todayKey(),
          tag: entry.tag,
          text: entry.text,
          createdAt: Date.now(),
        } as ImpactEntry,
        ...s.impact,
      ],
    }));
  }, []);

  const setIntention = useCallback((date: string, text: string) => {
    setState((s) => ({
      ...s,
      intentions: { ...s.intentions, [date]: { date, text } as Intention },
    }));
  }, []);

  const saveReflection = useCallback(
    (date: string, refl: Omit<DayReflection, "date" | "completedAt">) => {
      setState((s) => ({
        ...s,
        reflections: {
          ...s.reflections,
          [date]: { ...refl, date, completedAt: Date.now() },
        },
      }));
    },
    []
  );

  const setNotesSpace = useCallback((text: string) => {
    setState((s) => ({ ...s, notesSpace: text }));
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      setProfileName,
      setInterests,
      completeOnboarding,
      setTheme,
      addTask,
      toggleTask,
      deleteTask,
      addSubject,
      deleteSubject,
      togglePrayer,
      toggleHabitToday,
      addCustomHabit,
      addGoal,
      addGoalStep,
      toggleGoalStep,
      deleteGoal,
      addImpact,
      setIntention,
      saveReflection,
      setNotesSpace,
      resetAll,
    }),
    [
      state,
      setProfileName,
      setInterests,
      completeOnboarding,
      setTheme,
      addTask,
      toggleTask,
      deleteTask,
      addSubject,
      deleteSubject,
      togglePrayer,
      toggleHabitToday,
      addCustomHabit,
      addGoal,
      addGoalStep,
      toggleGoalStep,
      deleteGoal,
      addImpact,
      setIntention,
      saveReflection,
      setNotesSpace,
      resetAll,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
