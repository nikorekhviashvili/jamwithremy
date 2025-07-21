import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { audioEngine } from '@/lib/audioEngine'

interface StepSequencerProps {
  className?: string
}

const SOUNDS = [
  { name: 'Kick', color: 'bg-red-500 hover:bg-red-600', audioKey: 'kick' },
  { name: 'Snare', color: 'bg-blue-500 hover:bg-blue-600', audioKey: 'snare' },
  { name: 'Hi-Hat', color: 'bg-yellow-500 hover:bg-yellow-600', audioKey: 'hihat' },
  { name: 'Open Hat', color: 'bg-green-500 hover:bg-green-600', audioKey: 'openhat' },
  { name: 'Clap', color: 'bg-purple-500 hover:bg-purple-600', audioKey: 'clap' },
  { name: 'Crash', color: 'bg-orange-500 hover:bg-orange-600', audioKey: 'crash' },
  { name: 'Perc', color: 'bg-pink-500 hover:bg-pink-600', audioKey: 'perc' }
]

const STEPS = 32

export default function StepSequencer({ className }: StepSequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tempo, setTempo] = useState(120)
  const [isInitialized, setIsInitialized] = useState(false)
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(SOUNDS.length).fill(null).map(() => Array(STEPS).fill(false))
  )
  
  // Use ref to access current pattern without causing re-renders
  const patternRef = useRef(pattern)
  patternRef.current = pattern

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
          SOUNDS.forEach((sound, soundIndex) => {
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
    audioEngine.playSound(SOUNDS[soundIndex].audioKey, 0.7)
  }

  const resetSequencer = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const clearPattern = () => {
    setPattern(Array(SOUNDS.length).fill(null).map(() => Array(STEPS).fill(false)))
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
      <div className="flex items-center justify-center gap-6 p-4 border rounded-lg bg-card">
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
      <div className="border rounded-lg p-4 bg-card shadow-sm">
        {/* Step numbers */}
        <div className="grid grid-cols-33 gap-1 mb-4">
          <div className="w-20"></div>
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-6 flex items-center justify-center text-xs font-mono",
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
        {SOUNDS.map((sound, soundIndex) => (
          <div key={sound.name} className="grid grid-cols-33 gap-1 mb-2">
            {/* Sound name */}
            <div className="w-20 flex items-center justify-start">
              <button
                onClick={() => previewSound(soundIndex)}
                className="text-sm font-medium truncate hover:text-primary transition-colors"
                disabled={!isInitialized}
              >
                {sound.name}
              </button>
            </div>

            {/* Step buttons */}
            {Array.from({ length: STEPS }, (_, stepIndex) => (
              <button
                key={stepIndex}
                onClick={() => toggleStep(soundIndex, stepIndex)}
                className={cn(
                  "h-8 w-8 rounded border-2 transition-all duration-150 hover:scale-105",
                  pattern[soundIndex][stepIndex]
                    ? `${sound.color} border-transparent shadow-md`
                    : "bg-muted hover:bg-muted/80 border-border",
                  currentStep === stepIndex && isPlaying && "ring-2 ring-ring ring-offset-2",
                  stepIndex % 4 === 0 && "border-l-4 border-l-foreground/20"
                )}
                aria-label={`Toggle ${sound.name} at step ${stepIndex + 1}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pattern Info */}
      <div className="text-center text-sm text-muted-foreground">
        Current Step: {currentStep + 1} / {STEPS} | 
        Active Steps: {pattern.flat().filter(Boolean).length}
      </div>
    </div>
  )
}