// Simple sound effects for the scoring system
// Note: This is a basic implementation using Web Audio API
// In a production app, you might want to use pre-recorded audio files

class SoundEffects {
  constructor() {
    this.audioContext = null
    this.enabled = true
    this.volume = 0.3
    
    // Initialize audio context on first user interaction
    this.initAudioContext = this.initAudioContext.bind(this)
  }

  initAudioContext() {
    if (this.audioContext) return
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported, sound effects disabled')
      this.enabled = false
    }
  }

  // Play a chime sound for positive feedback
  playPositiveChime() {
    if (!this.enabled) return
    this.initAudioContext()
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create a pleasant ascending chime
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Error playing positive chime:', error)
    }
  }

  // Play a lower tone for negative feedback
  playNegativeChime() {
    if (!this.enabled) return
    this.initAudioContext()
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create a descending tone
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Error playing negative chime:', error)
    }
  }

  // Play a special sound for level up
  playLevelUpSound() {
    if (!this.enabled) return
    this.initAudioContext()
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create an ascending arpeggio effect
      const frequencies = [400, 500, 600, 800, 1000, 1200]
      const duration = 0.1
      
      frequencies.forEach((freq, index) => {
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * duration)
      })
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + frequencies.length * duration + 0.1)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + frequencies.length * duration + 0.1)
    } catch (error) {
      console.warn('Error playing level up sound:', error)
    }
  }

  // Play a completion sound for perfect verses
  playPerfectSound() {
    if (!this.enabled) return
    this.initAudioContext()
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Create a triumphant sound
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1)
      oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.4)
    } catch (error) {
      console.warn('Error playing perfect sound:', error)
    }
  }

  // Toggle sound on/off
  toggleSound() {
    this.enabled = !this.enabled
    return this.enabled
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
}

// Export a singleton instance
export const soundEffects = new SoundEffects()
