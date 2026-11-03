import { NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/api-guard";

// Exchanges the server-side Azure Speech key for a short-lived (10 min) token,
// so the subscription key never reaches the browser. Signed-in workers only.
export async function GET(req: Request) {
  // The browser reuses each token for 9 minutes, so 20 an hour is plenty.
  const guard = await guardApiRequest(req, {
    role: "worker",
    rateLimit: { bucket: "speech-token", limit: 20, windowSeconds: 3600 },
  });
  if (guard instanceof NextResponse) return guard;

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return NextResponse.json({ error: "Speech service is not configured" }, { status: 500 });
  }

  const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": key },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to issue speech token" }, { status: 502 });
  }

  return NextResponse.json(
    { token: await res.text(), region },
    { headers: { "Cache-Control": "no-store" } }
  );
}
