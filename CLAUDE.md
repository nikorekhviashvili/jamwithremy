# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production version (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Project Architecture

This is a **music production step sequencer** built with React 19 + TypeScript + Vite:

### Core Application
- **Step Sequencer**: Grid-based beat machine with 32 steps and 7 configurable sound tracks (StepSequencer.tsx)
- **Audio Engine**: Web Audio API-based audio file loading and playback (audioEngine.ts)
- **UI Framework**: shadcn/ui components with Tailwind CSS v4

### Key Technical Implementation Details

**Audio System**:
- `audioEngine.ts` - Loads and plays real audio files (.wav/.m4a) using Web Audio API
- Handles browser audio context initialization, file caching, and sound playback
- Audio files stored in `/public/audio files/` directory
- 7 sound categories: Cough, Cry, Eat, Glurp, Misc, Snore, Squish (Remy's sounds)
- On-demand loading with caching to prevent redundant network requests

**Sequencer Architecture**:
- 32-step × 7-track grid pattern stored as 2D boolean array
- Real-time playback with tempo control (60-180 BPM)
- Uses `useRef` for pattern access to prevent timing interference during live editing
- Step interval calculated as `(60 / tempo / 4) * 1000` milliseconds
- Sound selection modal allows switching between different audio files per track

**Styling System**:
- Tailwind CSS v4 with CSS-first configuration (no tailwind.config.js)
- shadcn/ui theme with custom variables in `src/index.css`
- Dark/light mode support with theme toggle component
- Path aliases: `@/components` and `@/lib` configured in tsconfig and Vite

**UI Components**:
- Interactive background with `MagnetLines` component for visual appeal
- Modal-based sound picker for switching audio files per track
- Custom range slider styling for tempo control
- Real-time step highlighting during playback

## Configuration Files

- `vite.config.ts` - Vite with React and Tailwind v4 plugins, path alias configuration
- `components.json` - shadcn/ui configuration for component generation
- `postcss.config.js` - PostCSS with autoprefixer (Note: Tailwind is imported via Vite plugin, not PostCSS)
- `src/index.css` - CSS variables and theme definitions for shadcn/ui with dark mode support
- Import aliases `@/*` point to `src/*` for clean imports