import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { audioEngine } from '@/lib/audioEngine'

interface StepSequencerProps {
  className?: string
}

const DEFAULT_SOUNDS = [
  { name: 'Kick', color: 'bg-red-500 hover:bg-red-600', audioKey: 'kick' },
  { name: 'Snare', color: 'bg-blue-500 hover:bg-blue-600', audioKey: 'snare' },
  { name: 'Hi-Hat', color: 'bg-yellow-500 hover:bg-yellow-600', audioKey: 'hihat' },
  { name: 'Open Hat', color: 'bg-green-500 hover:bg-green-600', audioKey: 'openhat' },
  { name: 'Clap', color: 'bg-purple-500 hover:bg-purple-600', audioKey: 'clap' },
  { name: 'Crash', color: 'bg-orange-500 hover:bg-orange-600', audioKey: 'crash' },
  { name: 'Perc', color: 'bg-pink-500 hover:bg-pink-600', audioKey: 'perc' }
]

// Mock sound bank - in production this would come from your API
const SOUND_BANK = [
  { name: 'Kick', color: 'bg-red-500 hover:bg-red-600', audioKey: 'kick' },
  { name: 'Kick 2', color: 'bg-red-600 hover:bg-red-700', audioKey: 'kick' },
  { name: 'Sub Kick', color: 'bg-red-400 hover:bg-red-500', audioKey: 'kick' },
  { name: 'Snare', color: 'bg-blue-500 hover:bg-blue-600', audioKey: 'snare' },
  { name: 'Snare Roll', color: 'bg-blue-600 hover:bg-blue-700', audioKey: 'snare' },
  { name: 'Rim Shot', color: 'bg-blue-400 hover:bg-blue-500', audioKey: 'snare' },
  { name: 'Hi-Hat', color: 'bg-yellow-500 hover:bg-yellow-600', audioKey: 'hihat' },
  { name: 'Hi-Hat Tight', color: 'bg-yellow-600 hover:bg-yellow-700', audioKey: 'hihat' },
  { name: 'Open Hat', color: 'bg-green-500 hover:bg-green-600', audioKey: 'openhat' },
  { name: 'Open Hat Long', color: 'bg-green-600 hover:bg-green-700', audioKey: 'openhat' },
  { name: 'Clap', color: 'bg-purple-500 hover:bg-purple-600', audioKey: 'clap' },
  { name: 'Hand Clap', color: 'bg-purple-600 hover:bg-purple-700', audioKey: 'clap' },
  { name: 'Crash', color: 'bg-orange-500 hover:bg-orange-600', audioKey: 'crash' },
  { name: 'Crash Reverse', color: 'bg-orange-600 hover:bg-orange-700', audioKey: 'crash' },
  { name: 'Perc', color: 'bg-pink-500 hover:bg-pink-600', audioKey: 'perc' },
  { name: 'Bongo', color: 'bg-pink-600 hover:bg-pink-700', audioKey: 'perc' },
  { name: 'Cowbell', color: 'bg-pink-400 hover:bg-pink-500', audioKey: 'perc' }
]

const STEPS = 32

export default function StepSequencer({ className }: StepSequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tempo, setTempo] = useState(120)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sounds, setSounds] = useState(DEFAULT_SOUNDS)
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(DEFAULT_SOUNDS.length).fill(null).map(() => Array(STEPS).fill(false))
  )
  const [soundPickerOpen, setSoundPickerOpen] = useState<number | null>(null)
  
  // Use ref to access current pattern without causing re-renders
  const patternRef = useRef(pattern)
  patternRef.current = pattern

  // Close sound picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (soundPickerOpen !== null) {
        const target = event.target as Element
        if (!target.closest('.sound-picker-container')) {
          setSoundPickerOpen(null)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [soundPickerOpen])

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      await audioEngine.initialize()
      setIsInitialized(true)
    }
    initAudio()
  }, [])

  // Calculate interval based on tempo (BPM to milliseconds)
  const stepInterval = (60 / tempo / 4) * 1000

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % STEPS
        
        // Play sounds for active steps using ref to avoid re-renders
        if (isInitialized) {
          sounds.forEach((sound, soundIndex) => {
            if (patternRef.current[soundIndex][prev]) {
              audioEngine.playSound(sound.audioKey, 0.7)
            }
          })
        }
        
        return nextStep
      })
    }, stepInterval)

    return () => clearInterval(interval)
  }, [isPlaying, stepInterval, isInitialized])

  const toggleStep = useCallback((soundIndex: number, stepIndex: number) => {
    setPattern(prev => {
      const newPattern = [...prev]
      newPattern[soundIndex] = [...newPattern[soundIndex]]
      newPattern[soundIndex][stepIndex] = !newPattern[soundIndex][stepIndex]
      return newPattern
    })
  }, [])

  const togglePlay = async () => {
    if (!isPlaying) {
      await audioEngine.resumeContext()
    }
    setIsPlaying(!isPlaying)
  }

  const previewSound = async (soundIndex: number) => {
    if (!isInitialized) return
    await audioEngine.resumeContext()
    audioEngine.playSound(sounds[soundIndex].audioKey, 0.7)
  }

  const selectSound = useCallback((soundIndex: number, newSound: typeof SOUND_BANK[0]) => {
    setSounds(prev => {
      const newSounds = [...prev]
      newSounds[soundIndex] = newSound
      return newSounds
    })
    setSoundPickerOpen(null)
  }, [])

  const resetSequencer = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const clearPattern = () => {
    setPattern(Array(sounds.length).fill(null).map(() => Array(STEPS).fill(false)))
    resetSequencer()
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Step Sequencer</h1>
        <p className="text-muted-foreground">Create beats with 32 steps and 7 sounds</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 p-4 border rounded-lg bg-secondary">
        <button
          onClick={togglePlay}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all duration-200 shadow-sm",
            isPlaying
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>

        <button
          onClick={resetSequencer}
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Reset
        </button>

        <button
          onClick={clearPattern}
          className="px-4 py-2 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          Clear
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="tempo" className="text-sm font-medium">
            Tempo:
          </label>
          <input
            id="tempo"
            type="range"
            min="60"
            max="180"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-mono w-12 text-center">{tempo}</span>
        </div>
      </div>

      {/* Step Grid */}
      <div className="border rounded-lg p-2 sm:p-4 bg-secondary shadow-sm overflow-x-auto">
        <div className="min-w-fit">
          {/* Step numbers */}
          <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: '100px repeat(32, minmax(24px, 1fr))' }}>
            <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
              Track
            </div>
            {Array.from({ length: STEPS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-6 flex items-center justify-center text-xs font-mono min-w-6",
                  currentStep === i && isPlaying
                    ? "bg-primary text-primary-foreground rounded"
                    : "text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Sound rows */}
          {sounds.map((sound, soundIndex) => (
            <div key={sound.name} className="grid gap-1 mb-2" style={{ gridTemplateColumns: '100px repeat(32, minmax(24px, 1fr))' }}>
              {/* Sound name */}
              <div className="flex items-center justify-between px-2 py-1 rounded border bg-card min-w-0">
                <button
                  onClick={() => previewSound(soundIndex)}
                  className="text-xs sm:text-sm font-medium hover:text-primary transition-colors flex-1 text-left truncate"
                  disabled={!isInitialized}
                >
                  {sound.name}
                </button>
                <div className="relative sound-picker-container ml-1">
                  <button 
                    onClick={() => setSoundPickerOpen(soundPickerOpen === soundIndex ? null : soundIndex)}
                    className="text-xs text-muted-foreground hover:text-foreground px-1 py-1 rounded border hover:bg-muted transition-colors flex-shrink-0"
                    title="Choose sound"
                  >
                    ⚙
                  </button>
                  
                  {soundPickerOpen === soundIndex && (
                    <div className="absolute top-full right-0 mt-1 bg-card border rounded-lg shadow-lg p-2 min-w-48 max-h-48 overflow-y-auto z-50">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Select Sound:</div>
                      <div className="grid gap-1">
                        {SOUND_BANK.map((bankSound, bankIndex) => (
                          <button
                            key={bankIndex}
                            onClick={() => selectSound(soundIndex, bankSound)}
                            className={cn(
                              "px-2 py-1 text-left rounded text-sm hover:bg-muted transition-colors",
                              sounds[soundIndex].name === bankSound.name && "bg-primary text-primary-foreground"
                            )}
                          >
                            {bankSound.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step buttons */}
              {Array.from({ length: STEPS }, (_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(soundIndex, stepIndex)}
                  className={cn(
                    "h-6 w-6 sm:h-8 sm:w-8 rounded border-2 transition-all duration-150 hover:scale-105 min-w-6 flex-shrink-0",
                    pattern[soundIndex][stepIndex]
                      ? `${sound.color} border-transparent shadow-md`
                      : "bg-muted hover:bg-muted/80 border-border",
                    currentStep === stepIndex && isPlaying && "ring-2 ring-ring ring-offset-1",
                    stepIndex % 4 === 0 && "border-l-4 border-l-foreground/20"
                  )}
                  aria-label={`Toggle ${sound.name} at step ${stepIndex + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Info */}
      <div className="text-center text-sm text-muted-foreground">
        Current Step: {currentStep + 1} / {STEPS} | 
        Active Steps: {pattern.flat().filter(Boolean).length}
      </div>
    </div>
  )
}