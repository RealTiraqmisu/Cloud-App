let audioCtx

// Short two-tone chime via Web Audio (no sound file needed).
export function playChime() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)()
    const t = audioCtx.currentTime
    ;[880, 1320].forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.0001, t + i * 0.18)
      gain.gain.exponentialRampToValueAtTime(0.25, t + i * 0.18 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.35)
      osc.connect(gain).connect(audioCtx.destination)
      osc.start(t + i * 0.18)
      osc.stop(t + i * 0.18 + 0.4)
    })
  } catch {
    // Audio blocked or unsupported — the on-screen popup still shows.
  }
}

export function canUseBrowserNotification() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestBrowserNotification() {
  if (!canUseBrowserNotification()) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export function showBrowserNotification(title, body) {
  if (canUseBrowserNotification() && Notification.permission === 'granted') {
    try {
      new Notification(title, { body })
    } catch {
      // Some mobile browsers only allow notifications from a service worker.
    }
  }
}
