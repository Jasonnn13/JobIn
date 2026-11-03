import { createClient } from "@/lib/supabase/client"

/** SWR key for the ids of applications the signed-in user has already reviewed. */
export const MY_REVIEWED_KEY = "my-reviewed-applications"

export async function fetchMyReviewedApplicationIds(): Promise<string[]> {
  const supabase = createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const me = claims?.claims.sub
  if (!me) return []
  const { data, error } = await supabase.from("reviews").select("application_id").eq("reviewer_id", me)
  if (error) throw error
  return data.map((r) => r.application_id)
}
