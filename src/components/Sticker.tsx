import { isImageDataUrl } from "../utils/image";

/**
 * Renders a profile sticker, whether it's a built-in emoji or a custom
 * uploaded image (data URL). Emoji render as plain text so they inherit
 * whatever font size/line-height the caller already set; images are sized
 * explicitly via `size` (px) since they can't inherit a font size.
 */
export default function Sticker({ value, size }: { value: string; size: number }) {
  if (isImageDataUrl(value)) {
    return (
      <img
        src={value}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "9999px",
          objectFit: "cover",
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    );
  }
  return <>{value}</>;
}
