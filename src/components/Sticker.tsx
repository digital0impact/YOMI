/** stickers ship as fixed artwork files under /public/stickers, referenced by path */
function isStickerAsset(value: string): boolean {
  return value.startsWith("/") || value.startsWith("data:");
}

/**
 * Renders a profile sticker, whether it's a plain emoji or one of the
 * app's custom artwork files (/stickers/*.svg). Emoji render as plain
 * text so they inherit whatever font size/line-height the caller already
 * set; artwork is sized explicitly via `size` (px) since it can't inherit
 * a font size.
 */
export default function Sticker({ value, size }: { value: string; size: number }) {
  if (isStickerAsset(value)) {
    return (
      <img
        src={value}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    );
  }
  return <>{value}</>;
}
