// dashboard/lib/supabase/client.ts
// Browser-side Supabase client (singleton).
// Only used in Client Components that cannot use server actions.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export function createClient() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
  const key = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;
  return createBrowserClient<Database>(url, key);
}
