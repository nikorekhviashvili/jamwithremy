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
- **Step Sequencer**: Grid-based drum machine with 32 steps and 7 sounds (StepSequencer.tsx)
- **Audio Engine**: Web Audio API-based sound synthesis and playback (audioEngine.ts)
- **UI Framework**: shadcn/ui components with Tailwind CSS v4

### Key Technical Implementation Details

**Audio System**:
- `audioEngine.ts` - Programmatically generates drum sounds using Web Audio API
- Handles browser audio context initialization and sound playback
- 7 synthesized drum sounds: kick, snare, hi-hat, open hat, clap, crash, percussion

**Sequencer Architecture**:
- 32-step × 7-sound grid pattern stored as 2D boolean array
- Real-time playback with tempo control (60-180 BPM)
- Uses `useRef` for pattern access to prevent timing interference during live editing
- Step interval calculated as `(60 / tempo / 4) * 1000` milliseconds

**Styling System**:
- Tailwind CSS v4 with CSS-first configuration (no tailwind.config.js)
- shadcn/ui theme with custom variables in `src/index.css`
- Path aliases: `@/components` and `@/lib` configured in tsconfig and Vite

## Configuration Files

- `vite.config.ts` - Vite with React and Tailwind v4 plugins, path alias configuration
- `components.json` - shadcn/ui configuration for component generation
- `postcss.config.js` - PostCSS with Tailwind v4 plugin
- `src/index.css` - CSS variables and theme definitions for shadcn/ui
- Import aliases `@/*` point to `src/*` for clean imports