export default function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-3 sticky top-0 z-20" style={{ background: "var(--page)" }}>
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg -ms-1"
            style={{ background: "var(--primary-tint)", color: "var(--primary-strong)" }}
            aria-label="رجوع"
          >
            →
          </button>
        )}
        <h1 className="text-xl font-extrabold">{title}</h1>
      </div>
      {action}
    </div>
  );
}
