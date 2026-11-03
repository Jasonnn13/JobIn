import "server-only"
import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { Database, UserRole } from "@/lib/supabase/database.types"

type GuardOptions = {
  role: UserRole
  /** Max calls per user per window; the counter lives in Postgres (consume_rate_limit). */
  rateLimit: { bucket: string; limit: number; windowSeconds: number }
}

type Guarded = { supabase: SupabaseClient<Database>; userId: string }

// Every paid API route goes through this: signed in, right role, JSON body, within its rate limit.
export async function guardApiRequest(req: Request, options: GuardOptions): Promise<Guarded | NextResponse> {
  // Cross-site forms can only send text/plain or form data; requiring JSON blocks them.
  if (req.method === "POST" && !req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Expected application/json" }, { status: 415 })
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data: role } = await supabase.rpc("my_role")
  if (role !== options.role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { bucket, limit, windowSeconds } = options.rateLimit
  const { data: allowed, error } = await supabase.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })
  if (error) {
    console.error("Rate limit check failed", error)
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  return { supabase, userId: claims.sub }
}
