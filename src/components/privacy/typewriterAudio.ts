/**
 * Synthesizes a soft mechanical typewriter click using Web Audio API.
 * Pure in-memory procedural audio: no external mp3/wav files required.
 */
let audioCtx: AudioContext | null = null

export function playTypewriterSound(volume = 0.03) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume()
    }

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()

    // Randomize pitch slightly for organic typing feel
    const now = audioCtx.currentTime
    const pitch = 850 + (Math.random() * 300 - 150)
    osc.type = "sine"
    osc.frequency.setValueAtTime(pitch, now)

    filter.type = "bandpass"
    filter.frequency.setValueAtTime(1200, now)
    filter.Q.setValueAtTime(3, now)

    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start(now)
    osc.stop(now + 0.026)
  } catch {
    // AudioContext blocked or not allowed by browser policy - silently ignore
  }
}
