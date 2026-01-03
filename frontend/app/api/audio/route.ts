import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { text, voiceId } = await req.json()
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
  // Use provided voiceId or default to Rachel
  const VOICE_ID = voiceId || "21m00Tcm4TlvDq8ikWAM"

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY || "",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.5 },
    }),
  })

  return new NextResponse(response.body)
}
