let unlocked = false

export const unlockAudio = () => {
  if (unlocked) return
  unlocked = true
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContext) return
  const ctx = new AudioContext()
  ctx.resume()
}
