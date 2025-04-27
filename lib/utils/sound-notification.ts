// Sound notification utility
let audioContext: AudioContext | null = null

export function playNotificationSound() {
  try {
    // Initialize AudioContext on first use (needs user interaction in some browsers)
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    // Create oscillator for a simple notification sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(830, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.error("Error playing notification sound:", error)
  }
}

export function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission()
  }
}

export function showBrowserNotification(title: string, body: string, icon?: string, onClick?: () => void) {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
    })

    if (onClick) {
      notification.onclick = onClick
    }
  }
}
