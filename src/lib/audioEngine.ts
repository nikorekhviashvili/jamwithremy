import * as Tone from 'tone'
import { effectsEngine } from './effectsEngine'

// Simple audio engine using Web Audio API with effects support
class AudioEngine {
  private audioContext: AudioContext | null = null
  private sounds: { [key: string]: AudioBuffer } = {}
  private loadingPromises: { [key: string]: Promise<AudioBuffer> } = {}
  private toneInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
  }

  async initialize() {
    if (!this.audioContext) return
    
    // Initialize Tone.js with the same AudioContext
    try {
      // Set Tone.js to use our AudioContext
      Tone.setContext(this.audioContext)
      await effectsEngine.initialize()
      this.toneInitialized = true
      console.log('AudioEngine and Tone.js initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Tone.js, falling back to direct audio:', error)
      this.toneInitialized = false
    }
    
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

  async playSound(filePath: string, volume: number = 1, trackIndex?: number) {
    if (!this.audioContext) return

    try {
      // Load the audio file if not already loaded
      const buffer = await this.loadAudioFile(filePath)
      
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      gainNode.gain.value = volume

      source.connect(gainNode)
      
      // Route audio through effects if available, otherwise direct connection
      if (trackIndex !== undefined && this.toneInitialized) {
        try {
          // Get the effect chain for this track
          const effectChain = effectsEngine.getEffectChain(trackIndex)
          
          // Check if this track has any enabled effects
          const hasEnabledEffects = effectChain.effects.some(effect => effect.enabled)
          
          if (hasEnabledEffects) {
            // Since Tone.js is using the same AudioContext, we can connect directly
            // Connect Web Audio gain node to Tone.js effect input
            console.log(`Track ${trackIndex} has ${effectChain.effects.length} effects, ${effectChain.effects.filter(e => e.enabled).length} enabled`)
            console.log('Effect chain:', effectChain.effects.map(e => `${e.type}(${e.enabled})`))
            
            gainNode.connect(effectChain.input.input as AudioNode)
            
            // Effect chain output is already connected to destination
            
            console.log(`Track ${trackIndex} using effects routing`)
          } else {
            // No enabled effects, use direct connection
            gainNode.connect(this.audioContext.destination)
          }
        } catch (error) {
          console.error('Effects routing failed, using direct connection:', error)
          gainNode.connect(this.audioContext.destination)
        }
      } else {
        // Direct connection (no effects or Tone.js not initialized)
        gainNode.connect(this.audioContext.destination)
      }
      
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
    
    // Also resume Tone.js context (should be the same context now)
    if (this.toneInitialized && Tone.getContext().state === 'suspended') {
      await Tone.start()
    }
  }

  // Get effects engine instance
  getEffectsEngine() {
    return effectsEngine
  }

  // Check if Tone.js is initialized
  isToneInitialized() {
    return this.toneInitialized
  }
}

export const audioEngine = new AudioEngine()