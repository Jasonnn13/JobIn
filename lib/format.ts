const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" })

/** "today", "yesterday", "3 days ago", "2 weeks ago"; falls back to a date after a month. */
export function timeAgo(iso: string) {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (days > -7) return relative.format(days, "day")
  if (days > -30) return relative.format(Math.round(days / 7), "week")
  return dateFormat.format(new Date(iso))
}

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso))
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  )
}

// Muted backgrounds for initial avatars; the same name always gets the same color.
const AVATAR_COLORS = ["#dbe7f6", "#e3ecd9", "#f3e3d3", "#e6def3", "#d9eeec", "#f1dfe4"]

export function avatarColor(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
