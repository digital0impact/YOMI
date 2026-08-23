/**
 * Reads an image file, crops it to a centered square, and downsizes it to
 * `size`x`size` so custom stickers stay small in localStorage. Returns a
 * PNG data URL (keeps transparency, useful for actual sticker artwork).
 */
export function fileToSquareDataUrl(file: File, size = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("تعذّرت قراءة الملف"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("تعذّر فتح هذه الصورة"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("تعذّر تجهيز الصورة"));
          return;
        }
        // cover-crop: scale so the shorter side fills the square, then center
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function isImageDataUrl(value: string): boolean {
  return value.startsWith("data:image");
}
