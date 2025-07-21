// Simple audio engine using Web Audio API
class AudioEngine {
  private audioContext: AudioContext | null = null
  private sounds: { [key: string]: AudioBuffer } = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  async initialize() {
    if (!this.audioContext) return

    // Generate drum sounds programmatically
    this.sounds = {
      kick: this.generateKick(),
      snare: this.generateSnare(),
      hihat: this.generateHiHat(),
      openhat: this.generateOpenHat(),
      clap: this.generateClap(),
      crash: this.generateCrash(),
      perc: this.generatePerc()
    }
  }

  private generateKick(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.3
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 15)
      const frequency = 60 * Math.exp(-t * 30)
      data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.8
    }

    return buffer
  }

  private generateSnare(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.2
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 20)
      const noise = (Math.random() * 2 - 1)
      const tone = Math.sin(2 * Math.PI * 200 * t)
      data[i] = envelope * (noise * 0.7 + tone * 0.3) * 0.6
    }

    return buffer
  }

  private generateHiHat(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.1
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 50)
      const noise = (Math.random() * 2 - 1)
      data[i] = envelope * noise * 0.3
    }

    return buffer
  }

  private generateOpenHat(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.3
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 8)
      const noise = (Math.random() * 2 - 1)
      data[i] = envelope * noise * 0.4
    }

    return buffer
  }

  private generateClap(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.15
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 25)
      const noise = (Math.random() * 2 - 1)
      const reverb = Math.sin(t * 1000) * 0.1
      data[i] = envelope * (noise + reverb) * 0.5
    }

    return buffer
  }

  private generateCrash(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 1.0
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 3)
      const noise = (Math.random() * 2 - 1)
      const shimmer = Math.sin(2 * Math.PI * 5000 * t) * 0.2
      data[i] = envelope * (noise * 0.8 + shimmer) * 0.4
    }

    return buffer
  }

  private generatePerc(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 })
    
    const sampleRate = this.audioContext.sampleRate
    const duration = 0.2
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 12)
      const frequency = 400 + Math.sin(t * 50) * 200
      data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.5
    }

    return buffer
  }

  playSound(soundName: string, volume: number = 1) {
    if (!this.audioContext || !this.sounds[soundName]) return

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()
    
    source.buffer = this.sounds[soundName]
    gainNode.gain.value = volume

    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    source.start()
  }

  async resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }
}

export const audioEngine = new AudioEngine()