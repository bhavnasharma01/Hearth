"use client";

import { useRef, useState } from "react";
import { uploadAvatar } from "@/lib/actions/upload-avatar";

/**
 * Compact tap-to-upload avatar, sized to sit next to the name at the top of the
 * form. Compresses the image on-device (phone photos are huge) and uploads it
 * via the `uploadAvatar` server action, keeping the resulting public URL in a
 * hidden `name` field so the form's submit/update action stores it in `photo_url`.
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
    <div className="flex w-20 shrink-0 flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={url ? "Change photo" : "Add a photo"}
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-sand bg-cover bg-center text-2xl text-forest-deep ring-1 ring-gold/30 transition-opacity hover:opacity-90 disabled:opacity-60"
        style={url ? { backgroundImage: `url(${JSON.stringify(url)})` } : undefined}
      >
        {!url && "＋"}
      </button>

      <div className="text-center text-xs leading-tight">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-forest hover:underline disabled:opacity-60"
        >
          {busy ? "Uploading…" : url ? "Change" : "Add photo"}
        </button>
        {url && !busy && (
          <>
            {" · "}
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-muted hover:text-clay hover:underline"
            >
              Remove
            </button>
          </>
        )}
      </div>

      {error && <p className="max-w-[8rem] text-center text-xs text-clay">{error}</p>}

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
