/** Only same-site paths, so a crafted ?next= link can't send users to another site after login. */
export function safeNext(next: string | null | undefined, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback
}
