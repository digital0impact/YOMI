import { supabase, usernameToEmail } from "../lib/supabase";
import type { AppState } from "../types";

/** thrown with Arabic messages meant to be shown to the student directly */
export class CloudError extends Error {}

function requireClient() {
  if (!supabase) throw new CloudError("المزامنة السحابية غير مُفعّلة في هذا التطبيق بعد.");
  return supabase;
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) {
    return "اسم المستخدم هذا محجوز، جرّبي اسمًا آخر أو سجّلي الدخول به.";
  }
  if (m.includes("invalid login credentials")) {
    return "اسم المستخدم أو كلمة المرور غير صحيحة.";
  }
  if (m.includes("password") && (m.includes("least") || m.includes("short"))) {
    return "كلمة المرور قصيرة، اختاري ٦ أحرف على الأقل.";
  }
  if (m.includes("email not confirmed")) {
    return "الحساب بانتظار تفعيل — أخبري معلمتك، على الأرجح يحتاج إعداد التطبيق لتعديل بسيط.";
  }
  return "حدث خطأ غير متوقع، حاولي مرة أخرى.";
}

export async function cloudSignUp(
  username: string,
  password: string,
  initialState: AppState
): Promise<string> {
  const client = requireClient();
  const email = usernameToEmail(username);
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw new CloudError(friendlyAuthError(error.message));
  const userId = data.user?.id;
  if (!userId) {
    throw new CloudError("تعذّر إنشاء الحساب. تأكدي أن تأكيد البريد معطّل في إعدادات Supabase.");
  }
  const { error: upsertError } = await client
    .from("profiles")
    .upsert({ id: userId, username, app_state: initialState });
  if (upsertError) throw new CloudError(friendlyAuthError(upsertError.message));
  return userId;
}

export async function cloudSignIn(
  username: string,
  password: string
): Promise<{ userId: string; remoteState: AppState | null }> {
  const client = requireClient();
  const email = usernameToEmail(username);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new CloudError(friendlyAuthError(error.message));
  const userId = data.user?.id;
  if (!userId) throw new CloudError("تعذّر تسجيل الدخول.");
  const { data: profile, error: fetchError } = await client
    .from("profiles")
    .select("app_state")
    .eq("id", userId)
    .maybeSingle();
  if (fetchError) throw new CloudError(friendlyAuthError(fetchError.message));
  return { userId, remoteState: (profile?.app_state as AppState | undefined) ?? null };
}

export async function cloudSignOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function cloudPush(userId: string, username: string, state: AppState): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("profiles").upsert({ id: userId, username, app_state: state });
  if (error) throw new CloudError(friendlyAuthError(error.message));
}

export async function cloudRestoreSession(): Promise<{ userId: string; email: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user?.email) return null;
  return { userId: user.id, email: user.email };
}

/** the fake email is `${username}@yomi.local` — recover the username back out of it */
export function emailToUsername(email: string): string {
  return email.split("@")[0];
}
