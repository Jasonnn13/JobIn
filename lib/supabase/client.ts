import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Browser client. Sessions live in cookies, so server code and the proxy see the same login.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
