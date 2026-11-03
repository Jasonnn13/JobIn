import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/safe-redirect"

// Landing point for the sign-up confirmation email. Supports both the default
// "?code=" link and the "?token_hash=&type=" email template.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNext(searchParams.get("next"), "/home")
  const supabase = await createClient()

  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing confirmation parameters") }

  if (error) {
    console.error("Email confirmation failed", error)
    return NextResponse.redirect(`${origin}/login?error=confirm-failed`)
  }
  return NextResponse.redirect(`${origin}${next}`)
}
