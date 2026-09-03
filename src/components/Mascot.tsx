/** نوتة — الشخصية الرمزية للتطبيق */
export default function Mascot({ size = 96 }: { size?: number }) {
  return <img src="/mascot-nota.svg" alt="نوتة" width={size} height={size} style={{ display: "inline-block" }} />;
}
