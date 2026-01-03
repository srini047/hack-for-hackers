export async function speak(text: string, voiceId?: string) {
  try {
    return;
    const response = await fetch("/api/audio", {
      method: "POST",
      body: JSON.stringify({ text, voiceId }),
    })
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    await audio.play()
    return new Promise<void>((resolve) => {
      audio.onended = () => resolve()
    })
  } catch (error) {
    console.error("[v0] Audio playback failed:", error)
  }
}

export function getOppositeGenderVoice(userGender: "male" | "female"): string {
  // Male voice for female users, female voice for male users
  return userGender === "male" 
    ? "21m00Tcm4TlvDq8ikWAM" // Rachel - Female voice
    : "TxGEqnHWrfWFTfGW9XjX" // Josh - Male voice
}

export function getUserGenderVoice(userGender: "male" | "female"): string {
  return userGender === "male"
    ? "TxGEqnHWrfWFTfGW9XjX" // Josh - Male voice
    : "21m00Tcm4TlvDq8ikWAM" // Rachel - Female voice
}
