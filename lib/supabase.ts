import { createClient, type PostgrestSingleResponse, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const globalForSupabase = globalThis as unknown as { supabase?: SupabaseClient<Database> };

/** SUPABASE_URL without a trailing slash or a pasted-in API path like /rest/v1. */
function supabaseUrl() {
  return process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/(rest|auth|storage)\/v1$/, "");
}

function createServerClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env");
  }
  if (key.startsWith("sb_publishable_")) {
    throw new Error("SUPABASE_SECRET_KEY must be the secret key (sb_secret_...), not the publishable key");
  }
  // The secret key bypasses Row Level Security, so this client is server-only.
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getClient() {
  // Reuse a single client across hot reloads in development.
  const client = globalForSupabase.supabase ?? createServerClient();
  if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = client;
  return client;
}

// Created on first use rather than at import, so a missing env var becomes an
// error inside the request (a JSON 500 from apiHandler) instead of an HTML crash page.
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** Returns a query's data, or throws its error so `apiHandler` responds with a 500. */
export function unwrap<T>(result: PostgrestSingleResponse<T>): T {
  if (result.error) throw result.error;
  return result.data;
}
