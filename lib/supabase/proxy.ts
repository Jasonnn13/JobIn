import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database, UserRole } from "./database.types"

type Options = {
  /** The only role allowed into this app's signed-in pages. */
  requiredRole: UserRole
  /** Signed-in pages; anything else is public. */
  protectedPrefixes: string[]
  /** Login and sign-up pages; signed-in users of the right role skip them. */
  authPaths: string[]
  homePath: string
}

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

// Refreshes the session cookie on every request and enforces the app's role on the server.
export async function updateSession(request: NextRequest, options: Options) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
        },
      },
    }
  )

  // Must run before anything else so a refreshed token is written to this response.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const { pathname, search } = request.nextUrl
  // API routes answer 401/403 themselves instead of redirecting.
  if (pathname.startsWith("/api/")) return response

  const isProtected = matches(pathname, options.protectedPrefixes)
  const isAuthPage = options.authPaths.includes(pathname)
  // The role lives in profiles (set once at sign-up); look it up only where it matters.
  const role = claims && (isProtected || isAuthPage) ? (await supabase.rpc("my_role")).data : null

  const redirectTo = (path: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = params ? `?${new URLSearchParams(params)}` : ""
    const redirect = NextResponse.redirect(url)
    // Keep any refreshed session cookies.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (isProtected) {
    if (!claims) return redirectTo("/login", { next: `${pathname}${search}` })
    if (role !== options.requiredRole) return redirectTo("/login", { error: role ? "wrong-app" : "no-profile" })
  }

  if (claims && role === options.requiredRole && isAuthPage) {
    return redirectTo(options.homePath)
  }

  return response
}
