# Jam with Remy

A music step sequencer web application for creating beats with Remy's weird sounds! 

## Features

- **16/32 Step Grid Sequencer**: Toggle between 16 and 32-step patterns
- **7 Sound Categories**: Cough, Cry, Eat, Glurp, Misc, Snore, and Squish sounds
- **Real-time Playback**: Create and play beats with adjustable tempo (60-180 BPM)
- **Audio Effects**: Add reverb, delay, and filter effects to individual tracks
- **Dark/Light Mode**: Beautiful UI with theme switching support
- **Web Audio API**: High-quality audio playback with on-demand loading

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **Web Audio API** for audio processing
- **shadcn/ui** components

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production version
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser and start jamming with Remy's sounds!

## Audio Files

All audio samples are stored in `/public/audio files/` and are loaded dynamically using the Web Audio API for optimal performance.
