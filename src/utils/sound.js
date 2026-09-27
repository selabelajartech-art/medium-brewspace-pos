// Web Audio API - Zero External Asset Sound Synthesizer
let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Suara Beep Halus saat Tambah/Klik Menu
export const playBeepSound = () => {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // Pitch tinggi 880Hz

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch (e) {
    // Silently ignore if audio context blocked
  }
}

// Suara Chime Melodi Sukses saat Transaksi Selesai
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Arpeggio Melodi (C5 -> E5 -> G5)
    ;[523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.07)

      gain.gain.setValueAtTime(0.12, now + idx * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.07)
      osc.stop(now + idx * 0.07 + 0.25)
    })
  } catch (e) {
    // Silently ignore
  }
}