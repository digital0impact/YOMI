import { useState } from "react";
import Sheet from "./Sheet";
import Mascot from "./Mascot";
import { isIOS, useInstallPrompt } from "../utils/pwa";

function IconPreview() {
  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src="/icon-192.png"
        alt="أيقونة يومي"
        className="w-16 h-16 rounded-2xl"
        style={{ boxShadow: "3px 3px 0 var(--shadow-soft)" }}
      />
      <p className="text-xs font-bold" style={{ color: "var(--ink-faint)" }}>
        يومي
      </p>
    </div>
  );
}

export default function InstallAppSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { canPrompt, installed, promptInstall } = useInstallPrompt();
  const [justInstalled, setJustInstalled] = useState(false);

  const install = async () => {
    const accepted = await promptInstall();
    if (accepted) setJustInstalled(true);
  };

  if (installed || justInstalled) {
    return (
      <Sheet open={open} onClose={onClose} title="📲 تثبيت التطبيق">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <Mascot size={80} />
          <p className="font-extrabold text-lg">🎉 التطبيق مثبَّت على جهازك</p>
          <p style={{ color: "var(--ink-soft)" }}>افتحيه من أيقونة "يومي" في شاشتك الرئيسية.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="📲 تثبيت التطبيق">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <IconPreview />
          <p className="text-[15px] leading-7 flex-1">
            ثبّتي "يومي" كأيقونة حقيقية على شاشتك الرئيسية، ليفتح فورًا مثل أي تطبيق آخر.
          </p>
        </div>

        {canPrompt ? (
          <button className="btn-primary w-full" onClick={install}>
            ثبّتي الآن
          </button>
        ) : isIOS() ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-extrabold"
                style={{ background: "var(--primary-tint)", color: "var(--primary-strong)" }}
              >
                ١
              </span>
              <p className="text-[15px]">
                اضغطي على زر المشاركة <span aria-hidden>⬆️</span> أسفل شاشة سفاري
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-extrabold"
                style={{ background: "var(--primary-tint)", color: "var(--primary-strong)" }}
              >
                ٢
              </span>
              <p className="text-[15px]">اختاري "إضافة إلى الشاشة الرئيسية"</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-extrabold"
                style={{ background: "var(--primary-tint)", color: "var(--primary-strong)" }}
              >
                ٣
              </span>
              <p className="text-[15px]">اضغطي "إضافة" أعلى الشاشة</p>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            متصفحك الحالي لا يدعم التثبيت المباشر. جرّبي فتح هذا الرابط عبر Chrome على أندرويد أو
            Safari على آيفون لتثبيته كأيقونة.
          </p>
        )}
      </div>
    </Sheet>
  );
}
