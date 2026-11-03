"use client";
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label?: string
}

export function SearchInput({ value, onChange, placeholder = "Search jobs", label = "Search jobs" }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 pl-12"
        aria-label={label}
      />
    </div>
  )
}
