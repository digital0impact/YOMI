import { useState } from "react";
import Sheet from "./Sheet";
import { useApp } from "../state/store";
import { isValidEmail } from "../lib/supabase";

function formatSyncedAt(ts: number | null): string {
  if (!ts) return "لم تتم المزامنة بعد";
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return "آخر مزامنة: الآن";
  if (diffMin < 60) return `آخر مزامنة: قبل ${diffMin} د`;
  const diffHr = Math.round(diffMin / 60);
  return `آخر مزامنة: قبل ${diffHr} س`;
}

function NewPasswordForm() {
  const { cloud, updatePassword } = useApp();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (password.length < 6) {
      setFormError("كلمة المرور يجب أن تكون ٦ أحرف على الأقل.");
      return;
    }
    setFormError(null);
    setBusy(true);
    const ok = await updatePassword(password);
    setBusy(false);
    if (ok) setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <span className="text-4xl">🌷</span>
        <p className="font-extrabold text-lg">تم تحديث كلمة المرور</p>
        <p style={{ color: "var(--ink-soft)" }}>يمكنكِ الآن استخدامها في المرة القادمة.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        اختاري كلمة مرور جديدة لحسابكِ.
      </p>
      <div>
        <label className="text-sm font-bold block mb-2">كلمة المرور الجديدة</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="٦ أحرف على الأقل"
          dir="ltr"
          className="w-full rounded-2xl px-4 py-3 outline-none text-[15px] text-start"
          style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
        />
      </div>
      {(formError || cloud.error) && (
        <p className="text-xs font-bold" style={{ color: "#c0455f" }}>
          {formError ?? cloud.error}
        </p>
      )}
      <button className="btn-primary w-full disabled:opacity-50" disabled={busy} onClick={submit}>
        {busy ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
      </button>
    </div>
  );
}

export default function CloudAccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cloud, signUpCloud, signInCloud, signOutCloud, resolveCloudConflict, syncNow, requestPasswordReset } =
    useApp();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setFormError("أدخلي بريدًا إلكترونيًا صحيحًا.");
      return;
    }
    if (password.length < 6) {
      setFormError("كلمة المرور يجب أن تكون ٦ أحرف على الأقل.");
      return;
    }
    setFormError(null);
    setBusy(true);
    const ok = mode === "signup" ? await signUpCloud(email, password) : await signInCloud(email, password);
    setBusy(false);
    if (ok) setPassword("");
  };

  const forgotPassword = async () => {
    if (!isValidEmail(email)) {
      setFormError("اكتبي بريدكِ الإلكتروني أولًا في الحقل أعلاه.");
      return;
    }
    setFormError(null);
    setBusy(true);
    await requestPasswordReset(email);
    setBusy(false);
  };

  if (cloud.status === "signed_in" && cloud.passwordRecovery) {
    return (
      <Sheet open={open} onClose={onClose} title="☁️ تعيين كلمة مرور جديدة">
        <NewPasswordForm />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="☁️ الحساب والمزامنة">
      {cloud.status === "signed_in" && cloud.pendingRemoteState ? (
        <div className="flex flex-col gap-4">
          <p className="text-[15px] leading-7">
            وجدنا نسخة محفوظة سحابيًا من قبل
            {cloud.pendingRemoteState.profile.name ? ` باسم "${cloud.pendingRemoteState.profile.name}"` : ""}
            . أي نسخة تريدين الاحتفاظ بها؟
          </p>
          <button className="btn-primary w-full" onClick={() => resolveCloudConflict("remote")}>
            استخدام النسخة السحابية
          </button>
          <button className="btn-ghost w-full" onClick={() => resolveCloudConflict("local")}>
            استخدام بيانات هذا الجهاز
          </button>
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            الخيار الآخر لن يُحذف، ستستبدلين نسخة هذا الجهاز أو النسخة السحابية بالأخرى فقط.
          </p>
        </div>
      ) : cloud.status === "signed_in" ? (
        <div className="flex flex-col gap-4">
          <div className="card" style={{ background: "var(--primary-tint)", borderColor: "var(--primary-tint-2)" }}>
            <p className="font-extrabold text-[15px]" dir="ltr">
              {cloud.email}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
              {cloud.syncing ? "جارٍ المزامنة..." : formatSyncedAt(cloud.lastSyncedAt)}
            </p>
          </div>
          {cloud.error && (
            <p className="text-xs font-bold" style={{ color: "#c0455f" }}>
              {cloud.error}
            </p>
          )}
          <button className="btn-primary w-full disabled:opacity-50" disabled={cloud.syncing} onClick={syncNow}>
            مزامنة الآن
          </button>
          <button className="btn-ghost w-full" onClick={signOutCloud}>
            تسجيل الخروج
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            احفظي بياناتك نسخةً احتياطية في السحابة، وتزامني بين أكثر من جهاز.
          </p>

          {cloud.needsEmailConfirmation && (
            <p className="text-sm font-bold" style={{ color: "var(--primary-strong)" }}>
              أرسلنا رابط تأكيد إلى بريدكِ — افتحيه ثم سجّلي الدخول من هنا.
            </p>
          )}
          {cloud.resetEmailSent && (
            <p className="text-sm font-bold" style={{ color: "var(--primary-strong)" }}>
              أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدكِ.
            </p>
          )}

          <div className="flex gap-2">
            <button className="chip flex-1 text-center" data-selected={mode === "signin"} onClick={() => setMode("signin")}>
              تسجيل الدخول
            </button>
            <button className="chip flex-1 text-center" data-selected={mode === "signup"} onClick={() => setMode("signup")}>
              حساب جديد
            </button>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">البريد الإلكتروني</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              dir="ltr"
              className="w-full rounded-2xl px-4 py-3 outline-none text-[15px] text-start"
              style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
            />
          </div>
          <div>
            <label className="text-sm font-bold block mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="٦ أحرف على الأقل"
              dir="ltr"
              className="w-full rounded-2xl px-4 py-3 outline-none text-[15px] text-start"
              style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
            />
          </div>

          {(formError || cloud.error) && (
            <p className="text-xs font-bold" style={{ color: "#c0455f" }}>
              {formError ?? cloud.error}
            </p>
          )}

          <button className="btn-primary w-full disabled:opacity-50" disabled={busy} onClick={submit}>
            {busy ? "جارٍ التنفيذ..." : mode === "signup" ? "إنشاء الحساب" : "تسجيل الدخول"}
          </button>

          {mode === "signin" && (
            <button className="text-xs font-bold text-center" style={{ color: "var(--ink-faint)" }} onClick={forgotPassword}>
              نسيتِ كلمة المرور؟
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}
