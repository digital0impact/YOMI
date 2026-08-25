/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxx.supabase.co — optional: cloud backup/sync is hidden until both this and VITE_SUPABASE_ANON_KEY are set */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase project's public "anon" key — safe to ship client-side, access is enforced by Row Level Security (see supabase/schema.sql) */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
