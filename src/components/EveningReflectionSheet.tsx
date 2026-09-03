import { useEffect, useState } from "react";
import Sheet from "./Sheet";
import Mascot from "./Mascot";
import { INTENTION_FULFILLMENT, MOODS } from "../data/constants";
import { useApp } from "../state/store";
import type { IntentionFulfillment, Mood } from "../types";
import { todayKey } from "../utils/date";

type Stage = "intention" | "mood" | "impact" | "done";

export default function EveningReflectionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, saveReflection, setIntentionFulfillment } = useApp();
  const date = todayKey();
  const todayIntention = state.intentions[date];

  const [stage, setStage] = useState<Stage>("mood");
  const [fulfillment, setFulfillment] = useState<IntentionFulfillment | undefined>(undefined);
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [impactText, setImpactText] = useState("");

  // decide the opening stage each time the sheet is opened: only ask
  // about today's intention if she actually set one
  useEffect(() => {
    if (open) {
      setStage(todayIntention?.text ? "intention" : "mood");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reset = () => {
    setStage("mood");
    setFulfillment(undefined);
    setMood(undefined);
    setImpactText("");
  };

  const confirmFulfillment = () => {
    if (!fulfillment) return;
    setIntentionFulfillment(date, fulfillment);
    setStage("mood");
  };

  const finish = () => {
    saveReflection(date, { mood, impactText: impactText.trim() || undefined });
    setStage("done");
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="🌙 كيف كان يومك؟"
    >
      {stage === "intention" && todayIntention && (
        <div className="flex flex-col gap-5">
          <p className="font-bold">🤍 هل وفقتِ إلى ما نويتِ؟</p>
          <p className="text-sm -mt-3" style={{ color: "var(--ink-soft)" }}>
            نيتك اليوم: «{todayIntention.text}»
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {INTENTION_FULFILLMENT.map((f) => (
              <button
                key={f.id}
                onClick={() => setFulfillment(f.id)}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-4"
                style={{
                  border: `1.5px solid ${fulfillment === f.id ? "var(--primary)" : "var(--border)"}`,
                  background: fulfillment === f.id ? "var(--primary-tint)" : "var(--surface)",
                }}
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-sm font-bold">{f.label}</span>
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full disabled:opacity-40"
            disabled={!fulfillment}
            onClick={confirmFulfillment}
          >
            متابعة
          </button>
        </div>
      )}

      {stage === "mood" && (
        <div className="flex flex-col gap-5">
          <p style={{ color: "var(--ink-soft)" }}>هل أنجزتِ ما كنتِ تريدين؟</p>
          <div className="grid grid-cols-2 gap-2.5">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-4"
                style={{
                  border: `1.5px solid ${mood === m.id ? "var(--primary)" : "var(--border)"}`,
                  background: mood === m.id ? "var(--primary-tint)" : "var(--surface)",
                }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-sm font-bold">{m.label}</span>
              </button>
            ))}
          </div>
          <button className="btn-primary w-full disabled:opacity-40" disabled={!mood} onClick={() => setStage("impact")}>
            متابعة
          </button>
        </div>
      )}

      {stage === "impact" && (
        <div className="flex flex-col gap-5">
          <p className="font-bold">🤍 وأثرك اليوم؟</p>
          <p className="text-sm -mt-3" style={{ color: "var(--ink-soft)" }}>هل عملتِ خيرًا؟</p>
          <textarea
            autoFocus
            value={impactText}
            onChange={(e) => setImpactText(e.target.value)}
            placeholder="اكتبي أثرك..."
            rows={3}
            className="w-full rounded-2xl p-3.5 outline-none resize-none text-[15px]"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
          <button className="btn-primary w-full" onClick={finish}>
            حفظ
          </button>
        </div>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <Mascot size={80} />
          <p className="font-extrabold text-lg">الحمد لله على يومك</p>
          <p style={{ color: "var(--ink-soft)" }}>غدًا فرصة جديدة لخطوة جميلة.</p>
          <button
            className="btn-ghost mt-3"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            تمام 🌷
          </button>
        </div>
      )}
    </Sheet>
  );
}
