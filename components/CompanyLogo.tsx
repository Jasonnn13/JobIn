import { avatarColor, initials } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  /** Uploaded or category picture; the generic placeholder counts as none. */
  src?: string | null
  className?: string
  rounded?: "md" | "full"
}

// Square employer mark for lists (rounded="full" makes it a person avatar).
export function CompanyLogo({ name, src, className, rounded = "md" }: Props) {
  const shape = rounded === "full" ? "rounded-full" : "rounded-md"
  if (src && !src.endsWith("/empty-image.jpg")) {
    return <img src={src} alt="" className={cn("size-12 shrink-0 bg-muted object-cover", shape, className)} />
  }
  return (
    <span
      aria-hidden
      className={cn("flex size-12 shrink-0 items-center justify-center text-sm font-semibold text-foreground/80", shape, className)}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {initials(name)}
    </span>
  )
}
