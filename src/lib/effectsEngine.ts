import * as Tone from 'tone'

// Effect types that we'll support
export type EffectType = 'reverb' | 'delay' | 'distortion' | 'filter'

// Effect parameter interfaces
export interface ReverbParams {
  roomSize: number // 0-1
  decay: number // 0-10
  wet: number // 0-1
}

export interface DelayParams {
  time: number // 0-1 (in seconds)
  feedback: number // 0-0.9
  wet: number // 0-1
}

export interface DistortionParams {
  distortion: number // 0-1
  oversample: '2x' | '4x' | 'none'
  wet: number // 0-1
}

export interface FilterParams {
  frequency: number // 20-20000 Hz
  type: 'lowpass' | 'highpass' | 'bandpass'
  rolloff: -12 | -24 | -48 | -96
  Q: number // 0.1-30
  wet: number // 0-1
}

// Union type for all effect parameters
export type EffectParams = ReverbParams | DelayParams | DistortionParams | FilterParams

// Effect configuration interface
export interface TrackEffect {
  id: string
  type: EffectType
  params: EffectParams
  enabled: boolean
}

// Effect chain for a single track
export interface EffectChain {
  trackIndex: number
  effects: TrackEffect[]
  toneEffects: Tone.ToneAudioNode[] // The actual Tone.js effect instances
  input: Tone.Gain // Input gain node for the chain
  output: Tone.Gain // Output gain node for the chain
}

// Default effect parameters
export const DEFAULT_EFFECT_PARAMS: Record<EffectType, EffectParams> = {
  reverb: {
    roomSize: 0.4,
    decay: 1.5,
    wet: 0.3
  } as ReverbParams,
  delay: {
    time: 0.25,
    feedback: 0.3,
    wet: 0.3
  } as DelayParams,
  distortion: {
    distortion: 0.4,
    oversample: '2x',
    wet: 0.5
  } as DistortionParams,
  filter: {
    frequency: 1000,
    type: 'lowpass',
    rolloff: -12,
    Q: 1,
    wet: 1.0
  } as FilterParams
}

// Effects Engine class to manage all effect chains
export class EffectsEngine {
  private effectChains: Map<number, EffectChain> = new Map()
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return
    
    // Initialize Tone.js context
    await Tone.start()
    this.isInitialized = true
  }

  // Create an effect chain for a track
  createEffectChain(trackIndex: number): EffectChain {
    const input = new Tone.Gain(1)
    const output = new Tone.Gain(1)
    
    // Connect input directly to output initially (bypass)
    input.connect(output)
    
    // Connect output to destination immediately and leave it connected
    output.connect(Tone.getDestination())
    
    const chain: EffectChain = {
      trackIndex,
      effects: [],
      toneEffects: [],
      input,
      output
    }
    
    console.log(`Created effect chain for track ${trackIndex}, connected to destination`)
    this.effectChains.set(trackIndex, chain)
    return chain
  }

  // Get effect chain for a track (create if doesn't exist)
  getEffectChain(trackIndex: number): EffectChain {
    let chain = this.effectChains.get(trackIndex)
    if (!chain) {
      chain = this.createEffectChain(trackIndex)
    }
    return chain
  }

  // Add an effect to a track's chain
  addEffect(trackIndex: number, effect: TrackEffect): void {
    const chain = this.getEffectChain(trackIndex)
    
    // Create the Tone.js effect instance
    const toneEffect = this.createToneEffect(effect)
    if (!toneEffect) {
      console.error(`Failed to create effect: ${effect.type}`)
      return
    }

    console.log(`Adding effect ${effect.type} to track ${trackIndex}`)

    // Add to chain configuration
    chain.effects.push(effect)
    chain.toneEffects.push(toneEffect)
    
    // Rebuild the effect chain connections
    this.rebuildEffectChain(chain)
    
    console.log(`Track ${trackIndex} now has ${chain.effects.length} effects`)
  }

  // Remove an effect from a track's chain
  removeEffect(trackIndex: number, effectId: string): void {
    const chain = this.getEffectChain(trackIndex)
    const effectIndex = chain.effects.findIndex(e => e.id === effectId)
    
    if (effectIndex === -1) return
    
    // Dispose of the Tone.js effect
    const toneEffect = chain.toneEffects[effectIndex]
    if (toneEffect && 'dispose' in toneEffect) {
      (toneEffect as { dispose: () => void }).dispose()
    }
    
    // Remove from arrays
    chain.effects.splice(effectIndex, 1)
    chain.toneEffects.splice(effectIndex, 1)
    
    // Rebuild the effect chain connections
    this.rebuildEffectChain(chain)
  }

  // Update effect parameters
  updateEffect(trackIndex: number, effectId: string, params: Partial<EffectParams>): void {
    const chain = this.getEffectChain(trackIndex)
    const effectIndex = chain.effects.findIndex(e => e.id === effectId)
    
    if (effectIndex === -1) return
    
    const effect = chain.effects[effectIndex]
    const toneEffect = chain.toneEffects[effectIndex]
    
    // Update the effect configuration
    effect.params = { ...effect.params, ...params }
    
    // Update the Tone.js effect parameters
    this.updateToneEffectParams(toneEffect, effect.type, effect.params)
  }

  // Toggle effect on/off
  toggleEffect(trackIndex: number, effectId: string): void {
    const chain = this.getEffectChain(trackIndex)
    const effect = chain.effects.find(e => e.id === effectId)
    
    if (!effect) return
    
    effect.enabled = !effect.enabled
    this.rebuildEffectChain(chain)
  }

  // Create a Tone.js effect instance based on type and parameters
  private createToneEffect(effect: TrackEffect): Tone.ToneAudioNode | null {
    switch (effect.type) {
      case 'reverb': {
        const reverbParams = effect.params as ReverbParams
        return new Tone.Freeverb({
          roomSize: reverbParams.roomSize,
          dampening: reverbParams.decay * 3000, // Scale decay to dampening range
          wet: reverbParams.wet
        })
      }
      
      case 'delay': {
        const delayParams = effect.params as DelayParams
        return new Tone.FeedbackDelay({
          delayTime: delayParams.time,
          feedback: delayParams.feedback,
          wet: delayParams.wet
        })
      }
      
      case 'distortion': {
        const distortionParams = effect.params as DistortionParams
        return new Tone.Distortion({
          distortion: distortionParams.distortion,
          oversample: distortionParams.oversample,
          wet: distortionParams.wet
        })
      }
      
      case 'filter': {
        const filterParams = effect.params as FilterParams
        return new Tone.Filter({
          frequency: filterParams.frequency,
          type: filterParams.type,
          rolloff: filterParams.rolloff,
          Q: filterParams.Q
        })
      }
      
      default:
        return null
    }
  }

  // Update Tone.js effect parameters
  private updateToneEffectParams(toneEffect: Tone.ToneAudioNode, type: EffectType, params: EffectParams): void {
    switch (type) {
      case 'reverb': {
        const reverb = toneEffect as Tone.Freeverb
        const reverbParams = params as ReverbParams
        reverb.roomSize.value = reverbParams.roomSize
        reverb.dampening = reverbParams.decay * 3000 // Scale decay to dampening range
        reverb.wet.value = reverbParams.wet
        break
      }
      
      case 'delay': {
        const delay = toneEffect as Tone.FeedbackDelay
        const delayParams = params as DelayParams
        delay.delayTime.value = delayParams.time
        delay.feedback.value = delayParams.feedback
        delay.wet.value = delayParams.wet
        break
      }
      
      case 'distortion': {
        const distortion = toneEffect as Tone.Distortion
        const distortionParams = params as DistortionParams
        distortion.distortion = distortionParams.distortion
        distortion.oversample = distortionParams.oversample
        distortion.wet.value = distortionParams.wet
        break
      }
      
      case 'filter': {
        const filter = toneEffect as Tone.Filter
        const filterParams = params as FilterParams
        filter.frequency.value = filterParams.frequency
        filter.type = filterParams.type
        filter.rolloff = filterParams.rolloff
        filter.Q.value = filterParams.Q
        break
      }
    }
  }

  // Rebuild the audio routing for an effect chain
  private rebuildEffectChain(chain: EffectChain): void {
    console.log(`Rebuilding effect chain for track ${chain.trackIndex}`)
    
    // Disconnect everything first
    chain.input.disconnect()
    chain.toneEffects.forEach(effect => {
      if ('disconnect' in effect) {
        (effect as { disconnect: () => void }).disconnect()
      }
    })

    // Get enabled effects only
    const enabledEffects = chain.toneEffects.filter((_, index) => 
      chain.effects[index].enabled
    )

    console.log(`Track ${chain.trackIndex}: ${enabledEffects.length} enabled effects out of ${chain.toneEffects.length} total`)

    // If no enabled effects, connect input directly to output
    if (enabledEffects.length === 0) {
      chain.input.connect(chain.output)
      console.log(`Track ${chain.trackIndex}: Direct input->output connection (no effects)`)
      return
    }

    // Connect input to first effect
    chain.input.connect(enabledEffects[0])
    console.log(`Track ${chain.trackIndex}: Connected input to first effect`)

    // Chain effects together
    for (let i = 0; i < enabledEffects.length - 1; i++) {
      enabledEffects[i].connect(enabledEffects[i + 1])
      console.log(`Track ${chain.trackIndex}: Connected effect ${i} to effect ${i + 1}`)
    }

    // Connect last effect to output
    enabledEffects[enabledEffects.length - 1].connect(chain.output)
    console.log(`Track ${chain.trackIndex}: Connected last effect to output`)
  }

  // Connect the effect chain output to a destination (deprecated - now connected automatically)
  connectChainToDestination(trackIndex: number, _destination: Tone.InputNode): void {
    // This method is no longer needed as output is connected on creation
    console.log(`connectChainToDestination called for track ${trackIndex} - but connection already exists`)
  }

  // Get input node for a track's effect chain
  getChainInput(trackIndex: number): Tone.Gain {
    const chain = this.getEffectChain(trackIndex)
    return chain.input
  }

  // Dispose of all effects for cleanup
  dispose(): void {
    this.effectChains.forEach(chain => {
      chain.input.dispose()
      chain.output.dispose()
      chain.toneEffects.forEach(effect => {
        if ('dispose' in effect) {
          (effect as { dispose: () => void }).dispose()
        }
      })
    })
    this.effectChains.clear()
  }
}

// Export singleton instance
export const effectsEngine = new EffectsEngine()