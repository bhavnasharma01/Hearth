"use server";

import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Server-side cap (client compresses well below this; this is the backstop).
const MAX_BYTES = 2 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Upload a practitioner photo to the public `avatars` Storage bucket and return
 * its public URL. A trusted service-role write (the anon role has no storage
 * write policy), validating content-type + size so it can't be used to dump
 * arbitrary files. Called imperatively from the AvatarUploader client component;
 * the returned URL is stored in the listing's `photo_url` by the submit/update
 * actions (which already guard for an http(s) URL).
 */
export async function uploadAvatar(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No image was received." };

  const ext = EXT[file.type];
  if (!ext) return { error: "Please use a JPG, PNG, or WebP image." };
  if (file.size > MAX_BYTES) return { error: "That image is too large (max 2 MB)." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Photo storage isn’t configured yet." };

  const path = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("avatars").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("uploadAvatar:", error.message);
    return {
      error:
        "Upload failed. Is the “avatars” storage bucket set up? Please try again.",
    };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl };
}
