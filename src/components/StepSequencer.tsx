import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { audioEngine } from '@/lib/audioEngine'

interface StepSequencerProps {
  className?: string
}

const DEFAULT_SOUNDS = [
  { name: 'Kick', audioKey: 'kick' },
  { name: 'Snare', audioKey: 'snare' },
  { name: 'Hi-Hat', audioKey: 'hihat' },
  { name: 'Open Hat', audioKey: 'openhat' },
  { name: 'Clap', audioKey: 'clap' },
  { name: 'Crash', audioKey: 'crash' },
  { name: 'Perc', audioKey: 'perc' }
]

// Mock sound bank - in production this would come from your API
const SOUND_BANK = [
  { name: 'Kick', audioKey: 'kick' },
  { name: 'Kick 2', audioKey: 'kick' },
  { name: 'Sub Kick', audioKey: 'kick' },
  { name: 'Snare', audioKey: 'snare' },
  { name: 'Snare Roll', audioKey: 'snare' },
  { name: 'Rim Shot', audioKey: 'snare' },
  { name: 'Hi-Hat', audioKey: 'hihat' },
  { name: 'Hi-Hat Tight', audioKey: 'hihat' },
  { name: 'Open Hat', audioKey: 'openhat' },
  { name: 'Open Hat Long', audioKey: 'openhat' },
  { name: 'Clap', audioKey: 'clap' },
  { name: 'Hand Clap', audioKey: 'clap' },
  { name: 'Crash', audioKey: 'crash' },
  { name: 'Crash Reverse', audioKey: 'crash' },
  { name: 'Perc', audioKey: 'perc' },
  { name: 'Bongo', audioKey: 'perc' },
  { name: 'Cowbell', audioKey: 'perc' }
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
    <div className={cn('w-full max-w-7xl mx-auto p-8 space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-3 relative">
        <div className="absolute inset-0 -m-8 bg-gradient-to-b from-background via-background/95 to-transparent rounded-xl" />
        <h1 className="text-4xl font-semibold tracking-tight text-foreground dark:text-foreground/90 relative">Jam with Remy</h1>
        <p className="text-foreground/60 dark:text-muted-foreground text-base relative">Create beats with weird sounds that Remy makes.</p>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlay}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 text-base",
              isPlaying
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
            )}
          >
            {isPlaying ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play
              </>
            )}
          </button>

          <button
            onClick={resetSequencer}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-all duration-200 font-medium text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>

          <button
            onClick={clearPattern}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-background border border-border text-foreground hover:bg-muted/30 transition-all duration-200 font-medium text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>

          <div className="flex items-center gap-4 ml-8 px-6 py-3 rounded-lg bg-gradient-to-r from-muted/10 to-muted/30 border border-border/50">
            <label htmlFor="tempo" className="text-sm font-medium text-foreground flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tempo
            </label>
            
            <div className="relative flex items-center">
              <div className="absolute w-32 h-2 bg-muted rounded-lg" />
              <div 
                className="absolute h-2 bg-primary rounded-lg pointer-events-none transition-all duration-150"
                style={{ width: `${((tempo - 60) / (180 - 60)) * 100}%` }}
              />
              <input
                id="tempo"
                type="range"
                min="60"
                max="180"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-32 h-2 appearance-none cursor-pointer slider relative z-10"
              />
            </div>
            
            <span className="text-sm font-mono font-semibold text-foreground bg-background px-3 py-1.5 rounded-md border border-border min-w-[4rem] text-center shadow-sm">
              {tempo} BPM
            </span>
          </div>
        </div>
      </div>

      {/* Step Grid */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 overflow-x-auto">
        <div className="w-fit mx-auto">
                    {/* Step numbers */}
          <div className="flex gap-0.5 mb-3">
            <div className="flex items-center justify-center text-sm font-medium text-muted-foreground w-[110px] h-7">
              Track
            </div>
            <div className="w-1"></div>
            <div className="flex gap-0.5">
              {Array.from({ length: STEPS }, (_, i) => (
                <div key={i} className="flex">
                  {i % 4 === 0 && i > 0 && <div className="w-1"></div>}
                  <div
                    className={cn(
                      "h-7 w-7 flex items-center justify-center text-xs font-medium rounded-md transition-all duration-200",
                      currentStep === i && isPlaying
                        ? "bg-primary/10 text-primary font-semibold scale-110"
                        : "text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sound rows */}
          {sounds.map((sound, soundIndex) => (
            <div key={sound.name} className="flex gap-0.5 mb-1.5">
              {/* Sound name */}
              <div className="flex items-center justify-between px-3 rounded-lg bg-muted/30 border border-border/50 w-[110px] h-8">
                <button
                  onClick={() => previewSound(soundIndex)}
                  className="text-sm font-medium hover:text-primary transition-colors flex-1 text-left truncate"
                  disabled={!isInitialized}
                >
                  {sound.name}
                </button>
                <div className="relative sound-picker-container ml-1">
                  <button 
                    onClick={() => setSoundPickerOpen(soundPickerOpen === soundIndex ? null : soundIndex)}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-background/50 transition-all duration-200 flex-shrink-0"
                    title="Choose sound"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  {soundPickerOpen === soundIndex && (
                    <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-3 min-w-[200px] max-h-64 overflow-y-auto z-50">
                      <div className="text-sm font-medium text-muted-foreground mb-3 px-1">Select Sound:</div>
                      <div className="grid gap-1">
                        {SOUND_BANK.map((bankSound, bankIndex) => (
                          <button
                            key={bankIndex}
                            onClick={() => selectSound(soundIndex, bankSound)}
                            className={cn(
                              "px-3 py-2 text-left rounded-md text-sm hover:bg-muted transition-all duration-200",
                              sounds[soundIndex].name === bankSound.name && "bg-primary text-primary-foreground hover:bg-primary/90"
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
              <div className="w-1"></div>
              <div className="flex gap-0.5">
                {Array.from({ length: STEPS }, (_, stepIndex) => (
                  <div key={stepIndex} className="flex">
                    {stepIndex % 4 === 0 && stepIndex > 0 && <div className="w-1"></div>}
                    <button
                      onClick={() => toggleStep(soundIndex, stepIndex)}
                      className={cn(
                        "h-8 w-7 rounded-md transition-all duration-200 flex-shrink-0",
                        pattern[soundIndex][stepIndex]
                          ? "bg-primary shadow-sm hover:bg-primary/90 scale-105"
                          : "bg-muted/20 hover:bg-muted/40 border border-border/50",
                        currentStep === stepIndex && isPlaying && pattern[soundIndex][stepIndex] && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                        currentStep === stepIndex && isPlaying && !pattern[soundIndex][stepIndex] && "bg-muted/40"
                      )}
                      aria-label={`Toggle ${sound.name} at step ${stepIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Info */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Current Step:</span>
            <span className="font-semibold text-foreground bg-muted/30 px-3 py-1 rounded-md">
              {currentStep + 1} / {STEPS}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Active Steps:</span>
            <span className="font-semibold text-foreground bg-primary/10 text-primary px-3 py-1 rounded-md">
              {pattern.flat().filter(Boolean).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}