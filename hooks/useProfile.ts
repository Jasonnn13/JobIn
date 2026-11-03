"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, ProfileRow } from "@/lib/supabase/database.types";

export type Profile = ProfileRow & {
  /** Short-lived signed URL for the private avatar, or null. */
  photoUrl: string | null;
};

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // matches the bucket's file_size_limit

async function withPhotoUrl(row: ProfileRow): Promise<Profile> {
  if (!row.photo_path) return { ...row, photoUrl: null };
  const { data } = await createClient().storage.from("avatars").createSignedUrl(row.photo_path, 3600);
  return { ...row, photoUrl: data?.signedUrl ?? null };
}

/** Removes cached pages and data so the next person on a shared phone doesn't see them. */
export async function clearPersonalCaches() {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  // Keep the precache (app shell and static files); drop runtime caches.
  await Promise.all(keys.filter((k) => !k.includes("precache")).map((k) => caches.delete(k)));
}

// The signed-in user's own profile, plus the actions that change it.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const { data: claims } = await supabase.auth.getClaims();
      const userId = claims?.claims.sub;
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data, error: loadError } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (cancelled) return;
      if (loadError) {
        console.error("Failed to load profile", loadError);
        setError("Your profile couldn’t be loaded. Check your connection and reload the page.");
      } else if (data) {
        const withUrl = await withPhotoUrl(data);
        if (!cancelled) setProfile(withUrl);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Saves profile fields and, optionally, a new photo. Returns an error message or null. */
  const updateProfile = useCallback(
    async (fields: ProfileUpdate, photo?: File | null): Promise<string | null> => {
      if (!profile) return "You need to log in again.";
      const supabase = createClient();
      const update: ProfileUpdate = { ...fields };

      if (photo) {
        if (!PHOTO_TYPES.includes(photo.type)) return "Choose a JPG, PNG, or WebP photo.";
        if (photo.size > MAX_PHOTO_BYTES) return "Choose a photo smaller than 2 MB.";
        const ext = photo.type.split("/")[1];
        const path = `${profile.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photo, { contentType: photo.type });
        if (uploadError) {
          console.error("Photo upload failed", uploadError);
          return "Your photo couldn’t be uploaded. Try again.";
        }
        update.photo_path = path;
      }

      const { data, error: saveError } = await supabase.from("profiles").update(update).eq("id", profile.id).select("*").single();
      if (saveError) {
        console.error("Profile update failed", saveError);
        return "Your profile couldn’t be saved. Check the fields and try again.";
      }

      // Remove the replaced photo so old pictures don't pile up.
      if (photo && profile.photo_path) {
        await supabase.storage.from("avatars").remove([profile.photo_path]);
      }
      setProfile(await withPhotoUrl(data));
      return null;
    },
    [profile]
  );

  const logout = useCallback(async (): Promise<boolean> => {
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) {
      console.error("Sign-out failed", signOutError);
      return false;
    }
    await clearPersonalCaches();
    setProfile(null);
    return true;
  }, []);

  return { profile, loading, error, updateProfile, logout };
}
