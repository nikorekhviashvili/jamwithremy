import StepSequencer from '@/components/StepSequencer'
import { MagnetLines } from '@/components/ui/magnet-lines'
import { ThemeToggle } from '@/components/ui/theme-toggle'

function App() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Theme toggle in top right */}
      <div className="fixed top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Interactive background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <MagnetLines
          rows={15}
          columns={20}
          containerSize="100vw"
          lineColor="currentColor"
          lineWidth="3px"
          lineHeight="25px"
          baseAngle={0}
          className="w-full h-full text-primary/30 dark:text-primary/10"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0,
            width: '100vw',
            height: '100vh'
          }}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        <StepSequencer />
      </div>
    </div>
  )
}

export default App
