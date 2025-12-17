# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This will be a Sleuth clone built with:
- **Frontend**: Preact (React alternative) with TypeScript and Vite. Use fnm rather than nvm for Node version management.
- **Backend**: Hono framework running on Cloudflare Workers
- **Storage**: Cloudflare KV for persistent data storage (if needed)
- **Deployment**: Cloudflare Workers via Wrangler

The application is a single-page app that allows users to walk around a map, talk to different NPCs, examine items, and eventually solve the mystery/

## Architecture

### Component Structure
```
App.tsx (main component, holds all game state)
├── Map (src/components/Map.tsx) - renders rooms, doors, entities
├── TextPanel (src/components/TextPanel.tsx) - message log display
└── CommandBar (src/components/CommandBar.tsx) - action buttons
```

### Key Files
- `src/game/types.ts` - TypeScript interfaces (GameState, Room, NPC, Item, etc.)
- `src/game/generator.ts` - `generateMystery()` creates initial state, picks random victim/murderer/weapon/room
- `src/game/dialogue.ts` - generates all text responses (question, alibi, examine, etc.)
- `src/game/houseLayouts.ts` - room definitions, NPC pool, weapon pool
- `src/styles/index.css` - DOS retro theming

### GameState Structure
```typescript
interface GameState {
  currentRoom: string;
  inventory: string[];           // Item IDs player has picked up
  rooms: Room[];
  npcs: NPC[];
  items: Item[];
  murderWeapon: string;          // Item ID
  murderRoom: string;            // Room ID
  murderer: string;              // NPC ID
  victim: string;                // Name (not an active NPC)
  messages: string[];            // Last 20 shown in TextPanel
  selectedEntity: { type: "npc" | "item"; id: string } | null;
  gamePhase: "intro" | "playing" | "assembled" | "won" | "lost";
}
```

### Message Flow
1. User clicks button in CommandBar
2. Handler in App.tsx calls dialogue generator from `dialogue.ts`
3. Result added to `gameState.messages` via `addMessage()`
4. TextPanel re-renders and auto-scrolls to bottom

### Debug Mode
Visit `#debug` URL hash to show DEBUG button that dumps mystery solution to text panel.

### Backend (src/main.tsx) - NOT YET IMPLEMENTED
- OPTIONAL: Hono server with simple REST API
- OPTIONAL: Cloudflare KV for persistence
- Currently all state is client-side only (lost on refresh)

### Build Configuration
- Vite with Preact preset
- TypeScript with separate configs for app and node code
- Bundle visualization enabled
- React compatibility layer (preact/compat)

## Common Commands

```bash
# Development
npm run dev          # Start development server

# Build and Deploy  
npm run build        # TypeScript compile + Vite build
npm run deploy       # Deploy to Cloudflare Workers

# Code Quality
npm run lint         # ESLint checking
npm run preview      # Preview production build
```

## Key Data Structures

## Development Notes

## Data
There are a couple screenshots of the original Sleuth game in the `sleuth_screenshots/` folder for reference.

## TODOs
* Arrow key movement, and type to do actions?