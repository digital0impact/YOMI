import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true once the repo owner has plugged in her Supabase project's URL + anon key */
export const isCloudConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/**
 * Students never see or type an email — a username is turned into a fake
 * one so we can reuse Supabase's battle-tested email/password auth
 * (hashing, sessions, password reset plumbing) behind a simple "custom
 * login" UI. Requires "Confirm email" to be OFF in the Supabase project's
 * Auth settings, since this fake address can never receive mail.
 */
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@yomi.local`;
}

// kept ASCII-only: it becomes an email local-part under the hood, and not
// every mail validator handles non-ASCII local-parts reliably
export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,24}$/i.test(username.trim());
}
