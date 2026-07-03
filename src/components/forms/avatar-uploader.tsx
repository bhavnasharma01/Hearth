"use client";

import { useRef, useState } from "react";
import { uploadAvatar } from "@/lib/actions/upload-avatar";

/**
 * Photo picker that compresses the image on-device (phone photos are huge) and
 * uploads it via the `uploadAvatar` server action, then keeps the resulting
 * public URL in a hidden `name` field so the form's submit/update action stores
 * it in `photo_url`. No external image library, no raw multi-MB upload.
 */
export function AvatarUploader({
  name = "photo_url",
  initialUrl = "",
}: {
  name?: string;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const blob = await compress(file, 512, 0.82);
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await uploadAvatar(fd);
      if ("error" in res) setError(res.error);
      else setUrl(res.url);
    } catch {
      setError("Couldn’t process that image — please try a different one.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {url ? (
        <div
          role="img"
          aria-label="Your photo"
          className="h-16 w-16 shrink-0 rounded-full bg-sand bg-cover bg-center ring-1 ring-gold/30"
          style={{ backgroundImage: `url(${JSON.stringify(url)})` }}
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sand text-2xl text-forest-deep ring-1 ring-gold/30">
          ☺
        </div>
      )}

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-line px-4 py-1.5 text-sm text-forest transition-colors hover:bg-sand disabled:opacity-60"
        >
          {busy ? "Uploading…" : url ? "Change photo" : "Upload photo"}
        </button>
        {url && !busy && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="ml-2 text-xs text-muted underline hover:text-ink"
          >
            Remove
          </button>
        )}
        {error && <p className="mt-1 text-xs text-clay">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />
      <input type="hidden" name={name} value={url} />
    </div>
  );
}

/** Downscale to `maxDim` and re-encode as JPEG, honouring EXIF orientation. */
async function compress(file: File, maxDim: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality,
    ),
  );
}
