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
  IntentionCategory,
  IntentionFulfillment,
  PrayerDay,
  PrayerName,
  Priority,
  Subject,
  TaskKind,
  ThemeId,
} from "../types";
import { DEFAULT_STICKER, DEFAULT_SUBJECTS, HABIT_OPTIONS } from "../data/constants";
import { todayKey } from "../utils/date";
import { isCloudConfigured, supabase } from "../lib/supabase";
import {
  cloudPush,
  cloudRequestPasswordReset,
  cloudRestoreSession,
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  cloudUpdatePassword,
} from "./cloud";

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
      sticker: DEFAULT_STICKER,
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

// merges a partial/older AppState with fresh defaults, so new fields (added
// after this data was saved — locally or in a cloud backup) get sane
// defaults instead of ending up undefined. profile is merged one level deep.
function mergeWithDefaults(partial: Partial<AppState>): AppState {
  const defaults = defaultState();
  return { ...defaults, ...partial, profile: { ...defaults.profile, ...partial.profile } };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export interface CloudState {
  /** whether the repo owner has plugged in a Supabase project at all */
  configured: boolean;
  status: "signed_out" | "signed_in";
  email: string | null;
  userId: string | null;
  syncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  /** set right after signing in when a meaningful cloud backup was found,
   *  waiting for her to pick which copy of her data to keep */
  pendingRemoteState: AppState | null;
  /** signUp succeeded but a confirmation email must be clicked before she
   *  can actually sign in (depends on the project's "Confirm email" setting) */
  needsEmailConfirmation: boolean;
  /** she followed a "reset password" email link and should set a new one */
  passwordRecovery: boolean;
  /** a "check your email" notice after requesting a password reset */
  resetEmailSent: boolean;
}

const DEFAULT_CLOUD_STATE: CloudState = {
  configured: isCloudConfigured,
  status: "signed_out",
  email: null,
  userId: null,
  syncing: false,
  lastSyncedAt: null,
  error: null,
  pendingRemoteState: null,
  needsEmailConfirmation: false,
  passwordRecovery: false,
  resetEmailSent: false,
};

interface Ctx {
  state: AppState;
  cloud: CloudState;
  signUpCloud: (email: string, password: string) => Promise<boolean>;
  signInCloud: (email: string, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  signOutCloud: () => Promise<void>;
  resolveCloudConflict: (choice: "remote" | "local") => Promise<void>;
  syncNow: () => Promise<void>;
  setProfileName: (name: string) => void;
  setInterests: (ids: AppState["profile"]["interests"]) => void;
  completeOnboarding: (habitIds: string[], theme: ThemeId) => void;
  setTheme: (theme: ThemeId) => void;
  setSticker: (sticker: string) => void;

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

  setIntention: (date: string, text: string, category?: IntentionCategory) => void;
  setIntentionFulfillment: (date: string, fulfillment: IntentionFulfillment) => void;

  saveReflection: (date: string, refl: Omit<DayReflection, "date" | "completedAt">) => void;

  setNotesSpace: (text: string) => void;

  resetAll: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [cloud, setCloud] = useState<CloudState>(DEFAULT_CLOUD_STATE);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full (e.g. too many custom stickers) — keep working in
      // memory rather than crashing; nothing else we can do client-side
      console.warn("يومي: تعذّر حفظ البيانات محليًا، المساحة ممتلئة على الأرجح.");
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.profile.theme);
  }, [state.profile.theme]);

  // restore an existing Supabase session across reloads on the same device
  useEffect(() => {
    if (!isCloudConfigured) return;
    let cancelled = false;
    cloudRestoreSession().then((session) => {
      if (cancelled || !session) return;
      setCloud((c) => ({
        ...c,
        status: "signed_in",
        userId: session.userId,
        email: session.email,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // listen for her clicking a "reset password" email link — Supabase opens
  // this exact page with a recovery session and fires this event
  useEffect(() => {
    if (!supabase) return;
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setCloud((c) => ({
          ...c,
          status: "signed_in",
          passwordRecovery: true,
          userId: session?.user.id ?? c.userId,
          email: session?.user.email ?? c.email,
        }));
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  // auto-backup a couple seconds after her last change, while signed in and
  // there's no unresolved "which copy do you want to keep" choice pending
  useEffect(() => {
    if (
      cloud.status !== "signed_in" ||
      !cloud.userId ||
      cloud.pendingRemoteState ||
      cloud.passwordRecovery
    ) {
      return;
    }
    const userId = cloud.userId;
    const timer = setTimeout(() => {
      setCloud((c) => ({ ...c, syncing: true }));
      cloudPush(userId, state)
        .then(() => setCloud((c) => ({ ...c, syncing: false, lastSyncedAt: Date.now(), error: null })))
        .catch((err: unknown) =>
          setCloud((c) => ({
            ...c,
            syncing: false,
            error: err instanceof Error ? err.message : "تعذّرت المزامنة.",
          }))
        );
    }, 2000);
    return () => clearTimeout(timer);
  }, [state, cloud.status, cloud.userId, cloud.pendingRemoteState, cloud.passwordRecovery]);

  const signUpCloud = useCallback(
    async (email: string, password: string) => {
      setCloud((c) => ({ ...c, error: null, syncing: true, resetEmailSent: false }));
      try {
        const { userId, needsConfirmation } = await cloudSignUp(email, password, state);
        if (needsConfirmation) {
          setCloud({
            ...DEFAULT_CLOUD_STATE,
            configured: true,
            needsEmailConfirmation: true,
          });
          return true;
        }
        setCloud({
          ...DEFAULT_CLOUD_STATE,
          configured: true,
          status: "signed_in",
          email,
          userId,
          lastSyncedAt: Date.now(),
        });
        return true;
      } catch (err) {
        setCloud((c) => ({ ...c, syncing: false, error: err instanceof Error ? err.message : "تعذّر إنشاء الحساب." }));
        return false;
      }
    },
    [state]
  );

  const signInCloud = useCallback(
    async (email: string, password: string) => {
      setCloud((c) => ({ ...c, error: null, syncing: true, needsEmailConfirmation: false, resetEmailSent: false }));
      try {
        const { userId, remoteState } = await cloudSignIn(email, password);
        const hasMeaningfulRemote = Boolean(remoteState?.profile?.onboarded);
        if (hasMeaningfulRemote) {
          setCloud({
            ...DEFAULT_CLOUD_STATE,
            configured: true,
            status: "signed_in",
            email,
            userId,
            lastSyncedAt: null,
            pendingRemoteState: remoteState,
          });
        } else {
          await cloudPush(userId, state);
          setCloud({
            ...DEFAULT_CLOUD_STATE,
            configured: true,
            status: "signed_in",
            email,
            userId,
            lastSyncedAt: Date.now(),
          });
        }
        return true;
      } catch (err) {
        setCloud((c) => ({ ...c, syncing: false, error: err instanceof Error ? err.message : "تعذّر تسجيل الدخول." }));
        return false;
      }
    },
    [state]
  );

  const signOutCloud = useCallback(async () => {
    await cloudSignOut();
    setCloud({ ...DEFAULT_CLOUD_STATE, configured: isCloudConfigured });
  }, []);

  const resolveCloudConflict = useCallback(
    async (choice: "remote" | "local") => {
      const remote = cloud.pendingRemoteState;
      const userId = cloud.userId;
      if (!remote || !userId) return;
      if (choice === "remote") {
        setState(mergeWithDefaults(remote));
        setCloud((c) => ({ ...c, pendingRemoteState: null, lastSyncedAt: Date.now(), error: null }));
        return;
      }
      setCloud((c) => ({ ...c, syncing: true }));
      try {
        await cloudPush(userId, state);
        setCloud((c) => ({ ...c, syncing: false, pendingRemoteState: null, lastSyncedAt: Date.now(), error: null }));
      } catch (err) {
        setCloud((c) => ({ ...c, syncing: false, error: err instanceof Error ? err.message : "تعذّرت المزامنة." }));
      }
    },
    [cloud.pendingRemoteState, cloud.userId, state]
  );

  const syncNow = useCallback(async () => {
    if (cloud.status !== "signed_in" || !cloud.userId) return;
    setCloud((c) => ({ ...c, syncing: true, error: null }));
    try {
      await cloudPush(cloud.userId, state);
      setCloud((c) => ({ ...c, syncing: false, lastSyncedAt: Date.now() }));
    } catch (err) {
      setCloud((c) => ({ ...c, syncing: false, error: err instanceof Error ? err.message : "تعذّرت المزامنة." }));
    }
  }, [cloud.status, cloud.userId, state]);

  const requestPasswordReset = useCallback(async (email: string) => {
    setCloud((c) => ({ ...c, error: null, syncing: true }));
    try {
      await cloudRequestPasswordReset(email);
      setCloud((c) => ({ ...c, syncing: false, resetEmailSent: true }));
      return true;
    } catch (err) {
      setCloud((c) => ({ ...c, syncing: false, error: err instanceof Error ? err.message : "تعذّر إرسال الرابط." }));
      return false;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    setCloud((c) => ({ ...c, error: null, syncing: true }));
    try {
      await cloudUpdatePassword(newPassword);
      setCloud((c) => ({ ...c, syncing: false, passwordRecovery: false, lastSyncedAt: Date.now() }));
      return true;
    } catch (err) {
      setCloud((c) => ({ ...c, syncing: false, error: err instanceof Error ? err.message : "تعذّر تحديث كلمة المرور." }));
      return false;
    }
  }, []);

  const setProfileName = useCallback((name: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, name } }));
  }, []);

  const setInterests = useCallback((ids: AppState["profile"]["interests"]) => {
    setState((s) => ({ ...s, profile: { ...s.profile, interests: ids } }));
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    setState((s) => ({ ...s, profile: { ...s.profile, theme } }));
  }, []);

  const setSticker = useCallback((sticker: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, sticker } }));
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

  const setIntention = useCallback((date: string, text: string, category?: IntentionCategory) => {
    setState((s) => ({
      ...s,
      intentions: { ...s.intentions, [date]: { date, text, category } as Intention },
    }));
  }, []);

  const setIntentionFulfillment = useCallback((date: string, fulfillment: IntentionFulfillment) => {
    setState((s) => {
      const existing = s.intentions[date];
      if (!existing) return s;
      return {
        ...s,
        intentions: { ...s.intentions, [date]: { ...existing, fulfillment } },
      };
    });
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
      cloud,
      signUpCloud,
      signInCloud,
      signOutCloud,
      resolveCloudConflict,
      syncNow,
      requestPasswordReset,
      updatePassword,
      setProfileName,
      setInterests,
      completeOnboarding,
      setTheme,
      setSticker,
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
      setIntentionFulfillment,
      saveReflection,
      setNotesSpace,
      resetAll,
    }),
    [
      state,
      cloud,
      signUpCloud,
      signInCloud,
      signOutCloud,
      resolveCloudConflict,
      syncNow,
      requestPasswordReset,
      updatePassword,
      setProfileName,
      setInterests,
      completeOnboarding,
      setTheme,
      setSticker,
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
      setIntentionFulfillment,
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
