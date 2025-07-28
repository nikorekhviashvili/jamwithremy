// Simple audio engine using Web Audio API
class AudioEngine {
  private audioContext: AudioContext | null = null
  private sounds: { [key: string]: AudioBuffer } = {}
  private loadingPromises: { [key: string]: Promise<AudioBuffer> } = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
  }

  async initialize() {
    if (!this.audioContext) return
    // Audio files will be loaded on-demand
  }

  async loadAudioFile(filePath: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available')
    }

    // Return cached sound if already loaded
    if (this.sounds[filePath]) {
      return this.sounds[filePath]
    }

    // Return existing loading promise if already loading
    const existingPromise = this.loadingPromises[filePath]
    if (existingPromise) {
      return existingPromise
    }

    // Start loading the audio file
    this.loadingPromises[filePath] = this.fetchAndDecodeAudio(filePath)
    
    try {
      const buffer = await this.loadingPromises[filePath]
      this.sounds[filePath] = buffer
      delete this.loadingPromises[filePath]
      return buffer
    } catch (error) {
      delete this.loadingPromises[filePath]
      throw error
    }
  }

  private async fetchAndDecodeAudio(filePath: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available')
    }

    try {
      const response = await fetch(`/audio files/${filePath}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      return audioBuffer
    } catch (error) {
      console.error(`Error loading audio file ${filePath}:`, error)
      throw error
    }
  }

  async playSound(filePath: string, volume: number = 1) {
    if (!this.audioContext) return

    try {
      // Load the audio file if not already loaded
      const buffer = await this.loadAudioFile(filePath)
      
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      gainNode.gain.value = volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
    } catch (error) {
      console.error(`Failed to play sound ${filePath}:`, error)
    }
  }

  // Preload a specific audio file
  async preloadSound(filePath: string): Promise<void> {
    try {
      await this.loadAudioFile(filePath)
    } catch (error) {
      console.error(`Failed to preload sound ${filePath}:`, error)
    }
  }

  async resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }
}

export const audioEngine = new AudioEngine()