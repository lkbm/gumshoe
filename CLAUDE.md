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

### Frontend (src/App.tsx)
- Uses Preact hooks for state management

### Backend (src/main.tsx)
- OPTIONAL: Hono server with simple REST API:
  - `GET /api/state/:key` - retrieve data
  - `PUT /api/state/:key` - save data
- Serves static assets from /dist
- OPTIONAL: Uses Cloudflare KV namespace "gumshoe" for persistence

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
* Let's make a "Debug" mode, so if I visit http://localhost:5175/#debug it will let me see the game data (victim, murderer, etc.)