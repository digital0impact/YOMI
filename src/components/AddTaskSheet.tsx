import { useState } from "react";
import Sheet from "./Sheet";
import { PRIORITIES } from "../data/constants";
import { useApp } from "../state/store";
import type { Priority, Subject, TaskKind } from "../types";
import { toDateKey } from "../utils/date";

type WhenOption = "today" | "tomorrow" | "week";

function whenToDate(opt: WhenOption): string {
  const d = new Date();
  if (opt === "tomorrow") d.setDate(d.getDate() + 1);
  if (opt === "week") d.setDate(d.getDate() + 7);
  return toDateKey(d);
}

export default function AddTaskSheet({
  open,
  onClose,
  subjects,
  defaultSubjectId,
  kind = "task",
  title = "مهمة جديدة",
}: {
  open: boolean;
  onClose: () => void;
  subjects?: Subject[];
  defaultSubjectId?: string;
  kind?: TaskKind;
  title?: string;
}) {
  const { addTask } = useApp();
  const [text, setText] = useState("");
  const [when, setWhen] = useState<WhenOption>("today");
  const [priority, setPriority] = useState<Priority>("normal");
  const [subjectId, setSubjectId] = useState<string | undefined>(defaultSubjectId);

  const reset = () => {
    setText("");
    setWhen("today");
    setPriority("normal");
    setSubjectId(defaultSubjectId);
  };

  const save = () => {
    if (!text.trim()) return;
    addTask({
      title: text.trim(),
      when: whenToDate(when),
      priority,
      subjectId,
      kind,
    });
    reset();
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={title}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-bold block mb-2">ما المهمة؟</label>
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="مراجعة الفصل الثالث"
            className="w-full rounded-2xl px-4 py-3 outline-none text-[15px]"
            style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
          />
        </div>

        {subjects && subjects.length > 0 && (
          <div>
            <label className="text-sm font-bold block mb-2">المادة</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  className="chip"
                  data-selected={subjectId === s.id}
                  onClick={() => setSubjectId(subjectId === s.id ? undefined : s.id)}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-bold block mb-2">متى؟</label>
          <div className="flex gap-2">
            {(
              [
                ["today", "اليوم"],
                ["tomorrow", "غدًا"],
                ["week", "هذا الأسبوع"],
              ] as [WhenOption, string][]
            ).map(([id, label]) => (
              <button key={id} className="chip" data-selected={when === id} onClick={() => setWhen(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold block mb-2">الأولوية</label>
          <div className="flex flex-col gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                style={{
                  border: `1.5px solid ${priority === p.id ? "var(--primary)" : "var(--border)"}`,
                  background: priority === p.id ? "var(--primary-tint)" : "var(--surface)",
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ border: `2px solid ${priority === p.id ? "var(--primary)" : "var(--border)"}` }}
                >
                  {priority === p.id && (
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                  )}
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full disabled:opacity-40" disabled={!text.trim()} onClick={save}>
          حفظ
        </button>
      </div>
    </Sheet>
  );
}
