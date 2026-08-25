import { supabase } from "../lib/supabase";
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
    return "هذا البريد مسجَّل من قبل، جرّبي تسجيل الدخول به بدلًا من إنشاء حساب جديد.";
  }
  if (m.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (m.includes("password") && (m.includes("least") || m.includes("short"))) {
    return "كلمة المرور قصيرة، اختاري ٦ أحرف على الأقل.";
  }
  if (m.includes("email not confirmed")) {
    return "الحساب بانتظار تأكيد البريد الإلكتروني — تحققي من صندوق الوارد (أو الرسائل غير المرغوبة).";
  }
  if (m.includes("email") && m.includes("invalid")) {
    return "هذا البريد الإلكتروني غير صالح.";
  }
  return "حدث خطأ غير متوقع، حاولي مرة أخرى.";
}

export async function cloudSignUp(
  email: string,
  password: string,
  initialState: AppState
): Promise<{ userId: string; needsConfirmation: boolean }> {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw new CloudError(friendlyAuthError(error.message));
  const userId = data.user?.id;
  if (!userId) throw new CloudError("تعذّر إنشاء الحساب، حاولي مرة أخرى.");
  if (!data.session) {
    // "Confirm email" is ON for this project: no session yet, so we can't
    // write her profile row (RLS requires an authenticated auth.uid()).
    // It gets created on her first successful sign-in after confirming.
    return { userId, needsConfirmation: true };
  }
  const { error: upsertError } = await client
    .from("profiles")
    .upsert({ id: userId, app_state: initialState });
  if (upsertError) throw new CloudError(friendlyAuthError(upsertError.message));
  return { userId, needsConfirmation: false };
}

export async function cloudSignIn(
  email: string,
  password: string
): Promise<{ userId: string; remoteState: AppState | null }> {
  const client = requireClient();
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

export async function cloudPush(userId: string, state: AppState): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("profiles").upsert({ id: userId, app_state: state });
  if (error) throw new CloudError(friendlyAuthError(error.message));
}

export async function cloudRestoreSession(): Promise<{ userId: string; email: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user?.email) return null;
  return { userId: user.id, email: user.email };
}

/** sends her a "reset your password" email; redirects back to this same page */
export async function cloudRequestPasswordReset(email: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) throw new CloudError(friendlyAuthError(error.message));
}

/** call once she's followed the reset link and is ready to set a new password */
export async function cloudUpdatePassword(newPassword: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new CloudError(friendlyAuthError(error.message));
}
