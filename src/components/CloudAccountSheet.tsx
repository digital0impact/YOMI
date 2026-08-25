import { useState } from "react";
import Sheet from "./Sheet";
import { useApp } from "../state/store";
import { isValidUsername } from "../lib/supabase";

function formatSyncedAt(ts: number | null): string {
  if (!ts) return "لم تتم المزامنة بعد";
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return "آخر مزامنة: الآن";
  if (diffMin < 60) return `آخر مزامنة: قبل ${diffMin} د`;
  const diffHr = Math.round(diffMin / 60);
  return `آخر مزامنة: قبل ${diffHr} س`;
}

export default function CloudAccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cloud, signUpCloud, signInCloud, signOutCloud, resolveCloudConflict, syncNow } = useApp();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!isValidUsername(username)) {
      setFormError("اسم الدخول: حروف إنجليزية أو أرقام فقط، بين 3 و24 حرفًا.");
      return;
    }
    if (password.length < 6) {
      setFormError("كلمة المرور يجب أن تكون ٦ أحرف على الأقل.");
      return;
    }
    setFormError(null);
    setBusy(true);
    const ok = mode === "signup" ? await signUpCloud(username, password) : await signInCloud(username, password);
    setBusy(false);
    if (ok) {
      setPassword("");
    }
  };

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
            <p className="font-extrabold text-[15px]">مسجّلة الدخول باسم {cloud.username}</p>
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

          <div className="flex gap-2">
            <button className="chip flex-1 text-center" data-selected={mode === "signin"} onClick={() => setMode("signin")}>
              تسجيل الدخول
            </button>
            <button className="chip flex-1 text-center" data-selected={mode === "signup"} onClick={() => setMode("signup")}>
              حساب جديد
            </button>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">اسم الدخول</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sarah_2025"
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
        </div>
      )}
    </Sheet>
  );
}
