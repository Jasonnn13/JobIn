import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  return updateSession(request, {
    requiredRole: "worker",
    protectedPrefixes: ["/home", "/jobs", "/courses", "/profile", "/edit-profile", "/about"],
    authPaths: ["/login", "/signup"],
    homePath: "/home",
  })
}

export const config = {
  // Everything except static files, the service worker, and images.
  matcher: ["/((?!_next/static|_next/image|serwist/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
