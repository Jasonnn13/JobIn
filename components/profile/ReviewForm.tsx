"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

// Rates the other person in an accepted hire. The database decides who that is and
// refuses anything that isn't a real hire, so only the application id is sent.
export function ReviewForm({
  applicationId,
  revieweeName,
  onDone,
}: {
  applicationId: string
  revieweeName: string
  onDone?: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return
    setSending(true)
    setError("")
    const { error: insertError } = await createClient()
      .from("reviews")
      .insert({ application_id: applicationId, rating, comment: comment.trim() })
    setSending(false)
    if (insertError && insertError.code !== "23505") {
      console.error("Review failed", insertError)
      setError("Your review couldn’t be saved. Check your connection and try again.")
      return
    }
    setDone(true)
    onDone?.()
  }

  if (done) {
    return <p className="text-base font-medium text-success" aria-live="polite">Thanks, your review of {revieweeName} is saved.</p>
  }

  const shown = hover || rating
  return (
    <form onSubmit={submit} className="space-y-3">
      <fieldset>
        <legend className="text-base font-semibold">How was working with {revieweeName}?</legend>
        <div className="mt-2 flex items-center gap-1" onPointerLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded p-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
              <input
                type="radio"
                name={`rating-${applicationId}`}
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              <Star
                onPointerEnter={() => setHover(n)}
                className={cn("size-7 transition-colors duration-100", n <= shown ? "fill-signal text-signal" : "text-input")}
                aria-hidden
              />
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}, {LABELS[n]}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{LABELS[shown]}</span>
        </div>
      </fieldset>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="What went well? What could be better?"
        aria-label="Your review (optional)"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={!rating || sending}>
        {sending ? "Saving…" : "Post review"}
      </Button>
    </form>
  )
}
