import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { TrackEffect, EffectType, EffectParams } from '@/lib/effectsEngine'

interface EffectsPanelProps {
  trackIndex: number
  trackName: string
  effects: TrackEffect[]
  onAddEffect: (trackIndex: number, effectType: EffectType) => void
  onRemoveEffect: (trackIndex: number, effectId: string) => void
  onUpdateEffect: (trackIndex: number, effectId: string, params: Partial<EffectParams>) => void
  onToggleEffect: (trackIndex: number, effectId: string) => void
  onClose: () => void
}

const EFFECT_TYPES: { type: EffectType; name: string; icon: string }[] = [
  { type: 'reverb', name: 'Reverb', icon: '🏛️' },
  { type: 'delay', name: 'Delay', icon: '🔄' },
  { type: 'distortion', name: 'Distortion', icon: '⚡' },
  { type: 'filter', name: 'Filter', icon: '🎛️' }
]

export default function EffectsPanel({
  trackIndex,
  trackName,
  effects,
  onAddEffect,
  onRemoveEffect,
  onUpdateEffect,
  onToggleEffect,
  onClose
}: EffectsPanelProps) {
  const [activeTab, setActiveTab] = useState<EffectType>('reverb')

  const handleAddEffect = useCallback((effectType: EffectType) => {
    onAddEffect(trackIndex, effectType)
  }, [trackIndex, onAddEffect])

  const getEffectOfType = (type: EffectType) => {
    return effects.find(effect => effect.type === type)
  }

  const renderEffectControls = (effectType: EffectType) => {
    const effect = getEffectOfType(effectType)
    
    if (!effect) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No {effectType} effect added</p>
          <button
            onClick={() => handleAddEffect(effectType)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add {effectType.charAt(0).toUpperCase() + effectType.slice(1)}
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{effectType.charAt(0).toUpperCase() + effectType.slice(1)}</span>
            <button
              onClick={() => onToggleEffect(trackIndex, effect.id)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                effect.enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5",
                effect.enabled ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>
          <button
            onClick={() => onRemoveEffect(trackIndex, effect.id)}
            className="text-destructive hover:text-destructive/80 p-1 rounded-md hover:bg-destructive/10 transition-colors"
            title="Remove effect"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {effect.enabled && (
          <div className="space-y-3">
            {renderEffectParameters(effect)}
          </div>
        )}
      </div>
    )
  }

  const renderEffectParameters = (effect: TrackEffect) => {
    const updateParam = (paramName: string, value: number) => {
      onUpdateEffect(trackIndex, effect.id, { [paramName]: value })
    }

    switch (effect.type) {
      case 'reverb': {
        const reverbParams = effect.params as { roomSize: number; decay: number; wet: number }
        return (
          <>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Room Size: {(reverbParams.roomSize * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={reverbParams.roomSize}
                onChange={(e) => updateParam('roomSize', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Decay: {reverbParams.decay.toFixed(1)}s
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={reverbParams.decay}
                onChange={(e) => updateParam('decay', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Wet: {(reverbParams.wet * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={reverbParams.wet}
                onChange={(e) => updateParam('wet', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </>
        )
      }

      case 'delay': {
        const delayParams = effect.params as { time: number; feedback: number; wet: number }
        return (
          <>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Time: {(delayParams.time * 1000).toFixed(0)}ms
              </label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={delayParams.time}
                onChange={(e) => updateParam('time', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Feedback: {(delayParams.feedback * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.01"
                value={delayParams.feedback}
                onChange={(e) => updateParam('feedback', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Wet: {(delayParams.wet * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={delayParams.wet}
                onChange={(e) => updateParam('wet', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </>
        )
      }

      case 'distortion': {
        const distortionParams = effect.params as { distortion: number; oversample: string; wet: number }
        return (
          <>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Distortion: {(distortionParams.distortion * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={distortionParams.distortion}
                onChange={(e) => updateParam('distortion', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Oversample: {distortionParams.oversample}
              </label>
              <select
                value={distortionParams.oversample}
                onChange={(e) => updateParam('oversample', e.target.value as any)}
                className="w-full p-2 bg-background border border-border rounded-lg"
              >
                <option value="none">None</option>
                <option value="2x">2x</option>
                <option value="4x">4x</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Wet: {(distortionParams.wet * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={distortionParams.wet}
                onChange={(e) => updateParam('wet', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </>
        )
      }

      case 'filter': {
        const filterParams = effect.params as { frequency: number; type: string; Q: number }
        return (
          <>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Frequency: {filterParams.frequency.toFixed(0)}Hz
              </label>
              <input
                type="range"
                min="20"
                max="20000"
                step="10"
                value={filterParams.frequency}
                onChange={(e) => updateParam('frequency', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Type: {filterParams.type}
              </label>
              <select
                value={filterParams.type}
                onChange={(e) => updateParam('type', e.target.value as any)}
                className="w-full p-2 bg-background border border-border rounded-lg"
              >
                <option value="lowpass">Low Pass</option>
                <option value="highpass">High Pass</option>
                <option value="bandpass">Band Pass</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Q: {filterParams.Q.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={filterParams.Q}
                onChange={(e) => updateParam('Q', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </>
        )
      }

      default:
        return null
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl shadow-2xl w-[500px] max-h-[700px] overflow-hidden z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Effects - {trackName}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {EFFECT_TYPES.map((effectType) => (
            <button
              key={effectType.type}
              onClick={() => setActiveTab(effectType.type)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === effectType.type
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{effectType.icon}</span>
                {effectType.name}
              </div>
              {activeTab === effectType.type && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
              {getEffectOfType(effectType.type)?.enabled && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {renderEffectControls(activeTab)}
        </div>
      </div>
    </>
  )
}